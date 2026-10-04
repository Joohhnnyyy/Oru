import * as path from 'path';
import { fileURLToPath } from 'url';
import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpJwtAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { TsLambda } from './constructs/ts-lambda';

export interface ApiStackProps extends StackProps {
  table: dynamodb.ITable;
  proofsBucket: s3.IBucket;
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  geofenceCollectionArn?: string;
  trackerArn?: string;
}

export class ApiStack extends Stack {
  public readonly httpApi: apigwv2.HttpApi;
  public readonly authorizer: HttpJwtAuthorizer;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const { table, proofsBucket, userPool, userPoolClient } = props;

    // Cognito JWT Authorizer
    this.authorizer = new HttpJwtAuthorizer('SaafSafariJwtAuthorizer', userPool.userPoolProviderUrl, {
      jwtAudience: [userPoolClient.userPoolClientId],
      authorizerName: 'SaafSafariCognitoAuthorizer',
    });

    // HTTP API Gateway v2
    this.httpApi = new apigwv2.HttpApi(this, 'SaafSafariHttpApi', {
      apiName: 'saafsafari-http-api',
      description: 'SaafSafari Civic Waste & Energy Platform HTTP API',
      corsPreflight: {
        allowHeaders: ['Authorization', 'Content-Type', 'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token'],
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.POST,
          apigwv2.CorsHttpMethod.PUT,
          apigwv2.CorsHttpMethod.PATCH,
          apigwv2.CorsHttpMethod.DELETE,
          apigwv2.CorsHttpMethod.OPTIONS,
        ],
        allowOrigins: ['*'],
        maxAge: Duration.days(1),
      },
    });

    // Resolve path to services/api handlers
    const apiBasePath = path.resolve(__dirname, '../../services/api/src');

    // 1. Onboarding Handler (POST /v1/onboarding)
    const completeOnboardingFn = new TsLambda(this, 'CompleteOnboardingFunction', {
      entry: path.join(apiBasePath, 'handlers/onboarding/completeOnboarding.ts'),
      serviceName: 'saafsafari-onboarding',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadWriteData(completeOnboardingFn);

    this.addSecuredRoute(
      '/v1/onboarding',
      [apigwv2.HttpMethod.POST],
      new HttpLambdaIntegration('OnboardingIntegration', completeOnboardingFn),
    );

    // 2. Get User Profile Handler (GET /v1/me)
    const getMeFn = new TsLambda(this, 'GetMeFunction', {
      entry: path.join(apiBasePath, 'handlers/me/getMe.ts'),
      serviceName: 'saafsafari-me-get',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadData(getMeFn);

    this.addSecuredRoute(
      '/v1/me',
      [apigwv2.HttpMethod.GET],
      new HttpLambdaIntegration('GetMeIntegration', getMeFn),
    );

    // 3. Update User Profile Handler (PATCH /v1/me)
    const updateMeFn = new TsLambda(this, 'UpdateMeFunction', {
      entry: path.join(apiBasePath, 'handlers/me/updateMe.ts'),
      serviceName: 'saafsafari-me-update',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadWriteData(updateMeFn);

    this.addSecuredRoute(
      '/v1/me',
      [apigwv2.HttpMethod.PATCH],
      new HttpLambdaIntegration('UpdateMeIntegration', updateMeFn),
    );

    // CloudFormation Outputs
    new CfnOutput(this, 'HttpApiUrlOutput', {
      value: this.httpApi.url ?? '',
      description: 'API Gateway HTTP API Endpoint URL',
      exportName: 'SaafSafari-ApiUrl',
    });

    new CfnOutput(this, 'HttpApiIdOutput', {
      value: this.httpApi.apiId,
      description: 'API Gateway HTTP API ID',
      exportName: 'SaafSafari-ApiId',
    });
  }

  /**
   * Register a route protected by Cognito JWT Authorizer
   */
  public addSecuredRoute(
    path: string,
    methods: apigwv2.HttpMethod[],
    integration: apigwv2.HttpRouteIntegration,
  ) {
    return this.httpApi.addRoutes({
      path,
      methods,
      integration,
      authorizer: this.authorizer,
    });
  }

  /**
   * Register an unauthenticated public route
   */
  public addPublicRoute(
    path: string,
    methods: apigwv2.HttpMethod[],
    integration: apigwv2.HttpRouteIntegration,
  ) {
    return this.httpApi.addRoutes({
      path,
      methods,
      integration,
    });
  }
}
