import * as path from 'path';
import { fileURLToPath } from 'url';
import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpJwtAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
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

    const { table, proofsBucket, userPool, userPoolClient, trackerArn } = props;

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

    // 4. Task Board Handler (GET /v1/tasks)
    const getTasksFn = new TsLambda(this, 'GetTasksFunction', {
      entry: path.join(apiBasePath, 'handlers/tasks/getTasks.ts'),
      serviceName: 'saafsafari-tasks-get',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadData(getTasksFn);

    this.addSecuredRoute(
      '/v1/tasks',
      [apigwv2.HttpMethod.GET],
      new HttpLambdaIntegration('GetTasksIntegration', getTasksFn),
    );

    // 5. Daily Habit Check-in Handler (POST /v1/tasks/checkin)
    const checkinHabitFn = new TsLambda(this, 'CheckinHabitFunction', {
      entry: path.join(apiBasePath, 'handlers/tasks/checkinHabit.ts'),
      serviceName: 'saafsafari-tasks-checkin',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadWriteData(checkinHabitFn);

    this.addSecuredRoute(
      '/v1/tasks/checkin',
      [apigwv2.HttpMethod.POST],
      new HttpLambdaIntegration('CheckinHabitIntegration', checkinHabitFn),
    );

    // 6. Leaderboards Handler (GET /v1/leaderboards)
    const getLeaderboardFn = new TsLambda(this, 'GetLeaderboardFunction', {
      entry: path.join(apiBasePath, 'handlers/leaderboards/getLeaderboard.ts'),
      serviceName: 'saafsafari-leaderboards-get',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadData(getLeaderboardFn);

    this.addPublicRoute(
      '/v1/leaderboards',
      [apigwv2.HttpMethod.GET],
      new HttpLambdaIntegration('GetLeaderboardIntegration', getLeaderboardFn),
    );

    // 7. QR Scan Verification Handler (POST /v1/scans)
    const verifyScanFn = new TsLambda(this, 'VerifyScanFunction', {
      entry: path.join(apiBasePath, 'handlers/scans/verifyScan.ts'),
      serviceName: 'saafsafari-scans-verify',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadWriteData(verifyScanFn);

    if (trackerArn) {
      verifyScanFn.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ['geo:GetDevicePosition', 'geo:BatchGetDevicePosition'],
          resources: [trackerArn],
        }),
      );
    }

    this.addSecuredRoute(
      '/v1/scans',
      [apigwv2.HttpMethod.POST],
      new HttpLambdaIntegration('VerifyScanIntegration', verifyScanFn),
    );

    // 8. User Wallet Handler (GET /v1/wallet)
    const getWalletFn = new TsLambda(this, 'GetWalletFunction', {
      entry: path.join(apiBasePath, 'handlers/wallet/getWallet.ts'),
      serviceName: 'saafsafari-wallet-get',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadData(getWalletFn);

    this.addSecuredRoute(
      '/v1/wallet',
      [apigwv2.HttpMethod.GET],
      new HttpLambdaIntegration('GetWalletIntegration', getWalletFn),
    );

    // 9. Coupon Catalog Handler (GET /v1/coupons)
    const getCouponsFn = new TsLambda(this, 'GetCouponsFunction', {
      entry: path.join(apiBasePath, 'handlers/coupons/getCoupons.ts'),
      serviceName: 'saafsafari-coupons-get',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadData(getCouponsFn);

    this.addPublicRoute(
      '/v1/coupons',
      [apigwv2.HttpMethod.GET],
      new HttpLambdaIntegration('GetCouponsIntegration', getCouponsFn),
    );

    // 10. Coupon Redemption Handler (POST /v1/coupons/redeem)
    const redeemCouponFn = new TsLambda(this, 'RedeemCouponFunction', {
      entry: path.join(apiBasePath, 'handlers/coupons/redeemCoupon.ts'),
      serviceName: 'saafsafari-coupons-redeem',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadWriteData(redeemCouponFn);

    this.addSecuredRoute(
      '/v1/coupons/redeem',
      [apigwv2.HttpMethod.POST],
      new HttpLambdaIntegration('RedeemCouponIntegration', redeemCouponFn),
    );

    // 11. Live Collection Truck Tracking Handler (GET /v1/trucks/live)
    const getLiveTrucksFn = new TsLambda(this, 'GetLiveTrucksFunction', {
      entry: path.join(apiBasePath, 'handlers/trucks/getLiveTrucks.ts'),
      serviceName: 'saafsafari-trucks-live',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadData(getLiveTrucksFn);

    if (trackerArn) {
      getLiveTrucksFn.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ['geo:GetDevicePosition', 'geo:BatchGetDevicePosition'],
          resources: [trackerArn],
        }),
      );
    }

    this.addPublicRoute(
      '/v1/trucks/live',
      [apigwv2.HttpMethod.GET],
      new HttpLambdaIntegration('GetLiveTrucksIntegration', getLiveTrucksFn),
    );

    // 12. Create Photo Proof Submission Handler (POST /v1/submissions)
    const createSubmissionFn = new TsLambda(this, 'CreateSubmissionFunction', {
      entry: path.join(apiBasePath, 'handlers/submissions/createSubmission.ts'),
      serviceName: 'saafsafari-submissions-create',
      environment: {
        TABLE_NAME: table.tableName,
        PROOFS_BUCKET_NAME: proofsBucket.bucketName,
      },
    });
    table.grantReadWriteData(createSubmissionFn);
    proofsBucket.grantPut(createSubmissionFn);

    this.addSecuredRoute(
      '/v1/submissions',
      [apigwv2.HttpMethod.POST],
      new HttpLambdaIntegration('CreateSubmissionIntegration', createSubmissionFn),
    );

    // 13. Get Submission Metadata Handler (GET /v1/submissions/{id})
    const getSubmissionFn = new TsLambda(this, 'GetSubmissionFunction', {
      entry: path.join(apiBasePath, 'handlers/submissions/getSubmission.ts'),
      serviceName: 'saafsafari-submissions-get',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadData(getSubmissionFn);

    this.addSecuredRoute(
      '/v1/submissions/{id}',
      [apigwv2.HttpMethod.GET],
      new HttpLambdaIntegration('GetSubmissionIntegration', getSubmissionFn),
    );

    // 14. Report Civic Hotspot Handler (POST /v1/hotspots)
    const reportHotspotFn = new TsLambda(this, 'ReportHotspotFunction', {
      entry: path.join(apiBasePath, 'handlers/hotspots/reportHotspot.ts'),
      serviceName: 'saafsafari-hotspots-report',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadWriteData(reportHotspotFn);

    this.addSecuredRoute(
      '/v1/hotspots',
      [apigwv2.HttpMethod.POST],
      new HttpLambdaIntegration('ReportHotspotIntegration', reportHotspotFn),
    );

    // 15. Get Civic Hotspots Handler (GET /v1/hotspots)
    const getHotspotsFn = new TsLambda(this, 'GetHotspotsFunction', {
      entry: path.join(apiBasePath, 'handlers/hotspots/getHotspots.ts'),
      serviceName: 'saafsafari-hotspots-get',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadData(getHotspotsFn);

    this.addPublicRoute(
      '/v1/hotspots',
      [apigwv2.HttpMethod.GET],
      new HttpLambdaIntegration('GetHotspotsIntegration', getHotspotsFn),
    );

    // 16. Admin Territory Overview Handler (GET /v1/admin/territory-overview)
    const getTerritoryOverviewFn = new TsLambda(this, 'GetTerritoryOverviewFunction', {
      entry: path.join(apiBasePath, 'handlers/admin/getTerritoryOverview.ts'),
      serviceName: 'saafsafari-admin-territory-overview',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadData(getTerritoryOverviewFn);

    this.addSecuredRoute(
      '/v1/admin/territory-overview',
      [apigwv2.HttpMethod.GET],
      new HttpLambdaIntegration('GetTerritoryOverviewIntegration', getTerritoryOverviewFn),
    );

    // 17. Admin Manage QR Sources Handler (GET & POST /v1/admin/qr-sources)
    const manageQrSourcesFn = new TsLambda(this, 'ManageQrSourcesFunction', {
      entry: path.join(apiBasePath, 'handlers/admin/manageQrSources.ts'),
      serviceName: 'saafsafari-admin-qr-sources',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadWriteData(manageQrSourcesFn);

    this.addSecuredRoute(
      '/v1/admin/qr-sources',
      [apigwv2.HttpMethod.GET, apigwv2.HttpMethod.POST],
      new HttpLambdaIntegration('ManageQrSourcesIntegration', manageQrSourcesFn),
    );

    // 18. Admin Get Review Queue Handler (GET /v1/admin/review-queue)
    const getReviewQueueFn = new TsLambda(this, 'GetReviewQueueFunction', {
      entry: path.join(apiBasePath, 'handlers/admin/getReviewQueue.ts'),
      serviceName: 'saafsafari-admin-review-queue-get',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadData(getReviewQueueFn);

    this.addSecuredRoute(
      '/v1/admin/review-queue',
      [apigwv2.HttpMethod.GET],
      new HttpLambdaIntegration('GetReviewQueueIntegration', getReviewQueueFn),
    );

    // 19. Admin Resolve Review Queue Handler (POST /v1/admin/review-queue/resolve)
    const resolveReviewQueueFn = new TsLambda(this, 'ResolveReviewQueueFunction', {
      entry: path.join(apiBasePath, 'handlers/admin/resolveReviewQueue.ts'),
      serviceName: 'saafsafari-admin-review-queue-resolve',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadWriteData(resolveReviewQueueFn);
    resolveReviewQueueFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['states:SendTaskSuccess', 'states:SendTaskFailure'],
        resources: ['*'],
      }),
    );

    this.addSecuredRoute(
      '/v1/admin/review-queue/resolve',
      [apigwv2.HttpMethod.POST],
      new HttpLambdaIntegration('ResolveReviewQueueIntegration', resolveReviewQueueFn),
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
