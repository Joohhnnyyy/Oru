import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpJwtAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

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
