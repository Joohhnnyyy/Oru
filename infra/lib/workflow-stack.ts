import * as path from 'path';
import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import { TsLambda } from './constructs/ts-lambda';

export interface WorkflowStackProps extends StackProps {
  table: dynamodb.ITable;
  proofsBucket: s3.IBucket;
}

export class WorkflowStack extends Stack {
  public readonly stateMachine: sfn.StateMachine;
  public readonly evaluateSubmissionFn: TsLambda;

  constructor(scope: Construct, id: string, props: WorkflowStackProps) {
    super(scope, id, props);

    const { table, proofsBucket } = props;
    const apiBasePath = path.resolve(__dirname, '../../services/api/src');

    // 1. Multimodal AI Evaluation Lambda Function
    this.evaluateSubmissionFn = new TsLambda(this, 'EvaluateSubmissionFunction', {
      entry: path.join(apiBasePath, 'handlers/submissions/evaluateSubmission.ts'),
      serviceName: 'saafsafari-evaluate-submission',
      timeout: Duration.seconds(60),
      environment: {
        TABLE_NAME: table.tableName,
        PROOFS_BUCKET_NAME: proofsBucket.bucketName,
      },
    });

    table.grantReadWriteData(this.evaluateSubmissionFn);
    proofsBucket.grantRead(this.evaluateSubmissionFn);

    // Grant Rekognition permissions
    this.evaluateSubmissionFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['rekognition:DetectModerationLabels', 'rekognition:DetectLabels'],
        resources: ['*'],
      }),
    );

    // Grant Bedrock Nova Lite inference permissions
    this.evaluateSubmissionFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['bedrock:InvokeModel'],
        resources: ['*'],
      }),
    );

    // 2. Step Functions Task: AI Vision & Moderation Evaluation
    const evaluateTask = new tasks.LambdaInvoke(this, 'EvaluateSubmissionTask', {
      lambdaFunction: this.evaluateSubmissionFn,
      outputPath: '$.Payload',
      retryOnServiceExceptions: true,
    });

    // 3. Choice State: Check Evaluation Result
    const isApproved = sfn.Condition.stringEquals('$.status', 'AUTO_APPROVED');
    const isFlagged = sfn.Condition.stringEquals('$.status', 'FLAGGED_FOR_REVIEW');

    const approvedState = new sfn.Succeed(this, 'SubmissionApproved', {
      comment: 'Submission successfully verified and approved by multimodal AI.',
    });

    const flaggedState = new sfn.Pass(this, 'AwaitingHumanReview', {
      comment: 'Submission suspended in municipal review queue awaiting admin decision.',
    });

    const rejectedState = new sfn.Fail(this, 'SubmissionRejected', {
      cause: 'Submission failed AI verification or content moderation.',
      error: 'AiVerificationFailed',
    });

    const choice = new sfn.Choice(this, 'EvaluationChoice')
      .when(isApproved, approvedState)
      .when(isFlagged, flaggedState)
      .otherwise(rejectedState);

    const definition = evaluateTask.next(choice);

    // 4. State Machine definition
    this.stateMachine = new sfn.StateMachine(this, 'AiVerificationStateMachine', {
      stateMachineName: 'saafsafari-ai-verification',
      definitionBody: sfn.DefinitionBody.fromChainable(definition),
      timeout: Duration.hours(24),
      comment: 'Orchestrates Rekognition moderation, Bedrock Nova Lite evaluation, and review queue callbacks.',
    });

    // CloudFormation Outputs
    new CfnOutput(this, 'StateMachineArnOutput', {
      value: this.stateMachine.stateMachineArn,
      description: 'Step Functions AI Verification State Machine ARN',
      exportName: 'SaafSafari-StateMachineArn',
    });
  }
}
