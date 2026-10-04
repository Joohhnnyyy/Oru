import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { AuthStack } from '../lib/auth-stack';
import { DataStack } from '../lib/data-stack';
import { GeoStack } from '../lib/geo-stack';
import { ApiStack } from '../lib/api-stack';

const app = new App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT || '123456789012',
  region: process.env.CDK_DEFAULT_REGION || 'ap-south-1',
};

// 1. Data Stack: DynamoDB Single Table + S3 Proofs Bucket
const dataStack = new DataStack(app, 'SaafSafari-DataStack', {
  env,
  description: 'SaafSafari DynamoDB and S3 data persistence infrastructure',
});

// 2. Auth Stack: Cognito User Pool, Client, and Role Groups
const authStack = new AuthStack(app, 'SaafSafari-AuthStack', {
  env,
  description: 'SaafSafari Cognito authentication infrastructure',
});

// 3. Geo Stack: Amazon Location Service Map, Geofences, and Vehicle Tracker
const geoStack = new GeoStack(app, 'SaafSafari-GeoStack', {
  env,
  description: 'SaafSafari Amazon Location Service geospatial resources',
});

// 4. API Stack: HTTP API v2 with Cognito JWT Authorizer
const apiStack = new ApiStack(app, 'SaafSafari-ApiStack', {
  env,
  description: 'SaafSafari HTTP API Gateway and service integration routing',
  table: dataStack.table,
  proofsBucket: dataStack.proofsBucket,
  userPool: authStack.userPool,
  userPoolClient: authStack.userPoolClient,
  geofenceCollectionArn: geoStack.geofenceCollection.attrArn,
  trackerArn: geoStack.tracker.attrArn,
});

// Explicit dependency ordering
apiStack.node.addDependency(dataStack);
apiStack.node.addDependency(authStack);
apiStack.node.addDependency(geoStack);

app.synth();
