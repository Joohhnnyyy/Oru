import { describe, it, expect } from 'vitest';
import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { DataStack } from '../lib/data-stack';
import { AuthStack } from '../lib/auth-stack';
import { GeoStack } from '../lib/geo-stack';
import { ApiStack } from '../lib/api-stack';
import { WorkflowStack } from '../lib/workflow-stack';
import { SchedulerStack } from '../lib/scheduler-stack';

describe('AWS CDK Infrastructure Stacks', () => {
  const env = { account: '123456789012', region: 'ap-south-1' };

  it('DataStack provisions DynamoDB table with GSI1 and GSI2, and encrypted S3 bucket', () => {
    const app = new App();
    const dataStack = new DataStack(app, 'TestDataStack', { env });
    const template = Template.fromStack(dataStack);

    // Assert DynamoDB Table
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'SaafSafariMain',
      BillingMode: 'PAY_PER_REQUEST',
      KeySchema: [
        { AttributeName: 'PK', KeyType: 'HASH' },
        { AttributeName: 'SK', KeyType: 'RANGE' },
      ],
      TimeToLiveSpecification: {
        AttributeName: 'ttl',
        Enabled: true,
      },
      GlobalSecondaryIndexes: Match.arrayWith([
        Match.objectLike({
          IndexName: 'GSI1',
          KeySchema: [
            { AttributeName: 'SK', KeyType: 'HASH' },
            { AttributeName: 'PK', KeyType: 'RANGE' },
          ],
        }),
        Match.objectLike({
          IndexName: 'GSI2',
          KeySchema: [
            { AttributeName: 'GSI2PK', KeyType: 'HASH' },
            { AttributeName: 'GSI2SK', KeyType: 'RANGE' },
          ],
        }),
      ]),
    });

    // Assert S3 Bucket
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: 'AES256',
            },
          },
        ],
      },
    });
  });

  it('AuthStack provisions Cognito User Pool, Client, and all 4 user groups', () => {
    const app = new App();
    const authStack = new AuthStack(app, 'TestAuthStack', { env });
    const template = Template.fromStack(authStack);

    template.hasResourceProperties('AWS::Cognito::UserPool', {
      UserPoolName: 'saafsafari-user-pool',
      UsernameAttributes: ['email'],
      AutoVerifiedAttributes: ['email'],
    });

    template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
      ClientName: 'saafsafari-client',
      GenerateSecret: false,
    });

    const groups = ['citizen', 'collector', 'ward_admin', 'merchant'];
    for (const group of groups) {
      template.hasResourceProperties('AWS::Cognito::UserPoolGroup', {
        GroupName: group,
      });
    }
  });

  it('GeoStack provisions Amazon Location Map, Geofences, and Vehicle Tracker', () => {
    const app = new App();
    const geoStack = new GeoStack(app, 'TestGeoStack', { env });
    const template = Template.fromStack(geoStack);

    template.hasResourceProperties('AWS::Location::Map', {
      MapName: 'saafsafari-map',
    });

    template.hasResourceProperties('AWS::Location::GeofenceCollection', {
      CollectionName: 'saafsafari-geofences',
    });

    template.hasResourceProperties('AWS::Location::Tracker', {
      TrackerName: 'saafsafari-truck-tracker',
      PositionFiltering: 'TimeBased',
    });
  });

  it('ApiStack provisions HTTP API Gateway v2, Cognito JWT Authorizer, and all Phase 1-4 routes', () => {
    const app = new App();
    const dataStack = new DataStack(app, 'TestDataStackForApi', { env });
    const authStack = new AuthStack(app, 'TestAuthStackForApi', { env });
    const geoStack = new GeoStack(app, 'TestGeoStackForApi', { env });
    const apiStack = new ApiStack(app, 'TestApiStack', {
      env,
      table: dataStack.table,
      proofsBucket: dataStack.proofsBucket,
      userPool: authStack.userPool,
      userPoolClient: authStack.userPoolClient,
      geofenceCollectionArn: geoStack.geofenceCollection.attrArn,
      trackerArn: geoStack.tracker.attrArn,
    });

    const template = Template.fromStack(apiStack);

    template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
      Name: 'saafsafari-http-api',
      ProtocolType: 'HTTP',
    });

    template.hasResourceProperties('AWS::ApiGatewayV2::Authorizer', {
      AuthorizerType: 'JWT',
      Name: 'SaafSafariCognitoAuthorizer',
    });

    // Secured routes
    const securedRoutes = [
      'POST /v1/onboarding',
      'GET /v1/me',
      'PATCH /v1/me',
      'GET /v1/tasks',
      'POST /v1/tasks/checkin',
      'POST /v1/scans',
      'GET /v1/wallet',
      'POST /v1/coupons/redeem',
      'POST /v1/submissions',
      'GET /v1/submissions/{id}',
      'POST /v1/hotspots',
      'GET /v1/admin/territory-overview',
      'POST /v1/admin/qr-sources',
      'GET /v1/admin/qr-sources',
      'GET /v1/admin/review-queue',
      'POST /v1/admin/review-queue/resolve',
      'GET /v1/collector/qr-token',
    ];

    for (const routeKey of securedRoutes) {
      template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
        RouteKey: routeKey,
        AuthorizationType: 'JWT',
      });
    }

    // Public routes
    const publicRoutes = [
      'GET /v1/leaderboards',
      'GET /v1/coupons',
      'GET /v1/trucks/live',
      'GET /v1/hotspots',
    ];

    for (const routeKey of publicRoutes) {
      template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
        RouteKey: routeKey,
        AuthorizationType: 'NONE',
      });
    }
  }, 20000);

  it('WorkflowStack provisions Step Functions State Machine with Rekognition and Bedrock permissions', () => {
    const app = new App();
    const dataStack = new DataStack(app, 'TestDataStackForWorkflow', { env });
    const workflowStack = new WorkflowStack(app, 'TestWorkflowStack', {
      env,
      table: dataStack.table,
      proofsBucket: dataStack.proofsBucket,
    });

    const template = Template.fromStack(workflowStack);

    // Assert State Machine
    template.hasResourceProperties('AWS::StepFunctions::StateMachine', {
      StateMachineName: 'saafsafari-ai-verification',
    });

    // Every proof upload starts the workflow (S3 → EventBridge → Step Functions)
    template.hasResourceProperties('AWS::Events::Rule', {
      EventPattern: Match.objectLike({ source: ['aws.s3'], 'detail-type': ['Object Created'] }),
    });

    // Human review pauses the execution on a task token
    const machine = Object.values(template.findResources('AWS::StepFunctions::StateMachine'))[0] as any;
    expect(JSON.stringify(machine.Properties.DefinitionString)).toContain('waitForTaskToken');

    // Assert IAM policy for Rekognition and Bedrock
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: ['rekognition:DetectModerationLabels', 'rekognition:DetectLabels'],
            Effect: 'Allow',
          }),
          Match.objectLike({
            Action: 'bedrock:InvokeModel',
            Effect: 'Allow',
          }),
        ]),
      },
    });
  });

  it('SchedulerStack provisions EventBridge Rule with cron expression targeting nightly health decay Lambda', () => {
    const app = new App();
    const dataStack = new DataStack(app, 'TestDataStackForScheduler', { env });
    const schedulerStack = new SchedulerStack(app, 'TestSchedulerStack', {
      env,
      table: dataStack.table,
    });

    const template = Template.fromStack(schedulerStack);

    // Assert EventBridge Rule
    template.hasResourceProperties('AWS::Events::Rule', {
      Name: 'saafsafari-nightly-health-decay',
      ScheduleExpression: 'cron(0 0 * * ? *)',
      State: 'ENABLED',
    });

    // Assert Lambda Function
    template.hasResourceProperties('AWS::Lambda::Function', {
      Timeout: 120,
    });
  });
});
