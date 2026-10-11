import * as path from 'path';
import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import { TsLambda } from './constructs/ts-lambda';

export interface WorkflowStackProps extends StackProps {
  table: dynamodb.ITable;
  proofsBucket: s3.IBucket;
}

/**
 * Photo-proof verification:
 *   S3 upload (proofs/<user>/<submission>.jpg)
 *     → EventBridge "Object Created" rule
 *     → Step Functions: Evaluate (Rekognition + Groq, fail-closed)
 *        ├─ AUTO_APPROVED → Approved
 *        ├─ REJECTED      → Rejected
 *        └─ FLAGGED       → AwaitHumanReview (task token; paused until a ward officer resolves)
 */
export class WorkflowStack extends Stack {
  public readonly stateMachine: sfn.StateMachine;
  public readonly evaluateSubmissionFn: TsLambda;

  constructor(scope: Construct, id: string, props: WorkflowStackProps) {
    super(scope, id, props);

    const { table, proofsBucket } = props;
    const apiBasePath = path.resolve(__dirname, '../../services/api/src');

    // 1. Multimodal AI evaluation Lambda
    this.evaluateSubmissionFn = new TsLambda(this, 'EvaluateSubmissionFunction', {
      entry: path.join(apiBasePath, 'handlers/submissions/evaluateSubmission.ts'),
      serviceName: 'saafsafari-evaluate-submission',
      timeout: Duration.seconds(60),
      memorySize: 512,
      environment: {
        TABLE_NAME: table.tableName,
        PROOFS_BUCKET_NAME: proofsBucket.bucketName,
        GROQ_MODEL_ID: 'qwen/qwen3.8-27b',
        GROQ_SECRET_ID: 'oru/groq-api-key',
      },
    });
    table.grantReadWriteData(this.evaluateSubmissionFn);
    proofsBucket.grantRead(this.evaluateSubmissionFn);
    this.evaluateSubmissionFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['rekognition:DetectModerationLabels', 'rekognition:DetectLabels'],
        resources: ['*'],
      }),
    );
    secretsmanager.Secret.fromSecretNameV2(this, 'GroqApiKey', 'oru/groq-api-key').grantRead(this.evaluateSubmissionFn);

    // 2. Lambda that parks the Step Functions task token on a flagged submission
    const awaitReviewFn = new TsLambda(this, 'AwaitReviewFunction', {
      entry: path.join(apiBasePath, 'handlers/submissions/awaitReview.ts'),
      serviceName: 'saafsafari-await-review',
      environment: { TABLE_NAME: table.tableName },
    });
    table.grantWriteData(awaitReviewFn);

    // 3. State machine
    const evaluateTask = new tasks.LambdaInvoke(this, 'EvaluateSubmissionTask', {
      lambdaFunction: this.evaluateSubmissionFn,
      outputPath: '$.Payload',
      retryOnServiceExceptions: true,
    });

    const approvedState = new sfn.Succeed(this, 'SubmissionApproved', {
      comment: 'Verified by Rekognition + Groq and rewarded.',
    });
    const rejectedState = new sfn.Succeed(this, 'SubmissionRejected', {
      comment: 'Rejected (duplicate, moderation, or not genuine). Not an execution failure.',
    });
    const reviewedState = new sfn.Succeed(this, 'HumanReviewCompleted');

    const awaitHumanReview = new tasks.LambdaInvoke(this, 'AwaitHumanReview', {
      lambdaFunction: awaitReviewFn,
      integrationPattern: sfn.IntegrationPattern.WAIT_FOR_TASK_TOKEN,
      payload: sfn.TaskInput.fromObject({
        submissionId: sfn.JsonPath.stringAt('$.submissionId'),
        taskToken: sfn.JsonPath.taskToken,
      }),
      taskTimeout: sfn.Timeout.duration(Duration.days(7)),
    }).next(reviewedState);

    const choice = new sfn.Choice(this, 'EvaluationChoice')
      .when(sfn.Condition.stringEquals('$.status', 'AUTO_APPROVED'), approvedState)
      .when(sfn.Condition.stringEquals('$.status', 'FLAGGED_FOR_REVIEW'), awaitHumanReview)
      .otherwise(rejectedState);

    this.stateMachine = new sfn.StateMachine(this, 'AiVerificationStateMachine', {
      stateMachineName: 'saafsafari-ai-verification',
      definitionBody: sfn.DefinitionBody.fromChainable(evaluateTask.next(choice)),
      timeout: Duration.days(8),
      comment: 'Rekognition moderation + Groq vision, with human-in-the-loop review.',
    });

    // 4. Start an execution for every uploaded proof photo
    new events.Rule(this, 'ProofUploadedRule', {
      ruleName: 'saafsafari-proof-uploaded',
      description: 'Starts AI verification when a proof photo lands in S3',
      eventPattern: {
        source: ['aws.s3'],
        detailType: ['Object Created'],
        detail: {
          bucket: { name: [proofsBucket.bucketName] },
          object: { key: [{ prefix: 'proofs/' }] },
        },
      },
      targets: [
        new targets.SfnStateMachine(this.stateMachine, {
          input: events.RuleTargetInput.fromObject({
            s3Bucket: events.EventField.fromPath('$.detail.bucket.name'),
            s3Key: events.EventField.fromPath('$.detail.object.key'),
          }),
        }),
      ],
    });

    new CfnOutput(this, 'StateMachineArnOutput', {
      value: this.stateMachine.stateMachineArn,
      description: 'Step Functions AI Verification State Machine ARN',
      exportName: 'SaafSafari-StateMachineArn',
    });
  }
}
