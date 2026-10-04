import { describe, it, expect } from 'vitest';
import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { DataStack } from '../lib/data-stack';
import { AuthStack } from '../lib/auth-stack';
import { GeoStack } from '../lib/geo-stack';
import { ApiStack } from '../lib/api-stack';

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

  it('ApiStack provisions HTTP API Gateway v2, Cognito JWT Authorizer, and Phase 1 routes', () => {
    const app = new App();
    const dataStack = new DataStack(app, 'TestDataStackForApi', { env });
    const authStack = new AuthStack(app, 'TestAuthStackForApi', { env });
    const apiStack = new ApiStack(app, 'TestApiStack', {
      env,
      table: dataStack.table,
      proofsBucket: dataStack.proofsBucket,
      userPool: authStack.userPool,
      userPoolClient: authStack.userPoolClient,
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

    // Check routes
    template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      RouteKey: 'POST /v1/onboarding',
      AuthorizationType: 'JWT',
    });

    template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      RouteKey: 'GET /v1/me',
      AuthorizationType: 'JWT',
    });

    template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      RouteKey: 'PATCH /v1/me',
      AuthorizationType: 'JWT',
    });
  });
});
