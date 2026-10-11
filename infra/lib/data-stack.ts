import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class DataStack extends Stack {
  public readonly table: dynamodb.Table;
  public readonly proofsBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // DynamoDB Single Table: SaafSafariMain
    this.table = new dynamodb.Table(this, 'SaafSafariMainTable', {
      tableName: 'SaafSafariMain',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: RemovalPolicy.DESTROY,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: false },
    });

    // GSI1: Inverted Index (SK -> PK)
    this.table.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI2: Domain-specific access (e.g. status, ward, time)
    this.table.addGlobalSecondaryIndex({
      indexName: 'GSI2',
      partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // S3 Bucket for waste segregation verification images and proofs
    this.proofsBucket = new s3.Bucket(this, 'ProofsBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      eventBridgeEnabled: true, // "Object Created" events start the Step Functions AI workflow
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
      lifecycleRules: [
        {
          id: 'ExpireTempUploads',
          expiration: Duration.days(90),
        },
      ],
    });

    // CloudFormation Outputs
    new CfnOutput(this, 'TableNameOutput', {
      value: this.table.tableName,
      description: 'SaafSafari DynamoDB Table Name',
      exportName: 'SaafSafari-TableName',
    });

    new CfnOutput(this, 'ProofsBucketNameOutput', {
      value: this.proofsBucket.bucketName,
      description: 'SaafSafari Proofs S3 Bucket Name',
      exportName: 'SaafSafari-ProofsBucketName',
    });
  }
}
