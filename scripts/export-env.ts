import * as fs from 'fs';
import * as path from 'path';

interface CdkOutputs {
  'SaafSafari-DataStack'?: {
    TableNameOutput?: string;
    ProofsBucketNameOutput?: string;
    [key: string]: string | undefined;
  };
  'SaafSafari-AuthStack'?: {
    UserPoolIdOutput?: string;
    UserPoolClientIdOutput?: string;
    UserPoolArnOutput?: string;
    [key: string]: string | undefined;
  };
  'SaafSafari-GeoStack'?: {
    MapNameOutput?: string;
    GeofenceCollectionNameOutput?: string;
    TrackerNameOutput?: string;
    [key: string]: string | undefined;
  };
  'SaafSafari-ApiStack'?: {
    HttpApiUrlOutput?: string;
    HttpApiIdOutput?: string;
    [key: string]: string | undefined;
  };
  'SaafSafari-WorkflowStack'?: {
    StateMachineArnOutput?: string;
    [key: string]: string | undefined;
  };
  'SaafSafari-SchedulerStack'?: {
    NightlyDecayRuleArnOutput?: string;
    [key: string]: string | undefined;
  };
  [stackName: string]: Record<string, string | undefined> | undefined;
}

export function parseOutputs(outputsPath: string): Record<string, string> {
  if (!fs.existsSync(outputsPath)) {
    throw new Error(`CDK outputs file not found at: ${outputsPath}`);
  }

  const raw = fs.readFileSync(outputsPath, 'utf8');
  const json: CdkOutputs = JSON.parse(raw);

  const dataStack = json['SaafSafari-DataStack'] || {};
  const authStack = json['SaafSafari-AuthStack'] || {};
  const geoStack = json['SaafSafari-GeoStack'] || {};
  const apiStack = json['SaafSafari-ApiStack'] || {};
  const workflowStack = json['SaafSafari-WorkflowStack'] || {};
  const schedulerStack = json['SaafSafari-SchedulerStack'] || {};

  const region = process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'ap-south-1';
  const account = process.env.CDK_DEFAULT_ACCOUNT || '517025126295';

  const apiUrl = apiStack.HttpApiUrlOutput || '';
  const apiId = apiStack.HttpApiIdOutput || '';
  const userPoolId = authStack.UserPoolIdOutput || '';
  const userPoolClientId = authStack.UserPoolClientIdOutput || '';
  const userPoolArn = authStack.UserPoolArnOutput || '';
  const tableName = dataStack.TableNameOutput || 'SaafSafariMain';
  const proofsBucketName = dataStack.ProofsBucketNameOutput || '';
  const mapName = geoStack.MapNameOutput || 'saafsafari-map';
  const geofenceCollection = geoStack.GeofenceCollectionNameOutput || 'saafsafari-geofences';
  const trackerName = geoStack.TrackerNameOutput || 'saafsafari-truck-tracker';
  const stateMachineArn = workflowStack.StateMachineArnOutput || '';
  const nightlyDecayRuleArn = schedulerStack.NightlyDecayRuleArnOutput || '';

  return {
    AWS_REGION: region,
    CDK_DEFAULT_REGION: region,
    CDK_DEFAULT_ACCOUNT: account,
    API_URL: apiUrl,
    API_ID: apiId,
    VITE_API_URL: apiUrl,
    EXPO_PUBLIC_API_URL: apiUrl,
    COGNITO_USER_POOL_ID: userPoolId,
    COGNITO_USER_POOL_CLIENT_ID: userPoolClientId,
    COGNITO_USER_POOL_ARN: userPoolArn,
    VITE_COGNITO_USER_POOL_ID: userPoolId,
    VITE_COGNITO_CLIENT_ID: userPoolClientId,
    VITE_COGNITO_REGION: region,
    EXPO_PUBLIC_COGNITO_USER_POOL_ID: userPoolId,
    EXPO_PUBLIC_COGNITO_CLIENT_ID: userPoolClientId,
    TABLE_NAME: tableName,
    PROOFS_BUCKET_NAME: proofsBucketName,
    LOCATION_MAP_NAME: mapName,
    LOCATION_GEOFENCE_COLLECTION: geofenceCollection,
    LOCATION_TRACKER_NAME: trackerName,
    STATE_MACHINE_ARN: stateMachineArn,
    NIGHTLY_DECAY_RULE_ARN: nightlyDecayRuleArn,
  };
}

export function formatEnvContent(vars: Record<string, string>): string {
  const lines = [
    '# ===================================================================',
    '# SaafSafari Live Environment Configuration',
    '# Generated automatically by scripts/export-env.ts',
    `# Generated at: ${new Date().toISOString()}`,
    '# ===================================================================',
    '',
    '# AWS Core',
    `AWS_REGION=${vars.AWS_REGION}`,
    `CDK_DEFAULT_REGION=${vars.CDK_DEFAULT_REGION}`,
    `CDK_DEFAULT_ACCOUNT=${vars.CDK_DEFAULT_ACCOUNT}`,
    '',
    '# API Gateway v2 (HTTP API)',
    `API_URL=${vars.API_URL}`,
    `API_ID=${vars.API_ID}`,
    `VITE_API_URL=${vars.VITE_API_URL}`,
    `EXPO_PUBLIC_API_URL=${vars.EXPO_PUBLIC_API_URL}`,
    '',
    '# Amazon Cognito Auth',
    `COGNITO_USER_POOL_ID=${vars.COGNITO_USER_POOL_ID}`,
    `COGNITO_USER_POOL_CLIENT_ID=${vars.COGNITO_USER_POOL_CLIENT_ID}`,
    `COGNITO_USER_POOL_ARN=${vars.COGNITO_USER_POOL_ARN}`,
    `VITE_COGNITO_USER_POOL_ID=${vars.VITE_COGNITO_USER_POOL_ID}`,
    `VITE_COGNITO_CLIENT_ID=${vars.VITE_COGNITO_CLIENT_ID}`,
    `VITE_COGNITO_REGION=${vars.VITE_COGNITO_REGION}`,
    `EXPO_PUBLIC_COGNITO_USER_POOL_ID=${vars.EXPO_PUBLIC_COGNITO_USER_POOL_ID}`,
    `EXPO_PUBLIC_COGNITO_CLIENT_ID=${vars.EXPO_PUBLIC_COGNITO_CLIENT_ID}`,
    '',
    '# DynamoDB & S3 Persistence',
    `TABLE_NAME=${vars.TABLE_NAME}`,
    `PROOFS_BUCKET_NAME=${vars.PROOFS_BUCKET_NAME}`,
    '',
    '# Amazon Location Service',
    `LOCATION_MAP_NAME=${vars.LOCATION_MAP_NAME}`,
    `LOCATION_GEOFENCE_COLLECTION=${vars.LOCATION_GEOFENCE_COLLECTION}`,
    `LOCATION_TRACKER_NAME=${vars.LOCATION_TRACKER_NAME}`,
    '',
    '# Step Functions & EventBridge Workflows',
    `STATE_MACHINE_ARN=${vars.STATE_MACHINE_ARN}`,
    `NIGHTLY_DECAY_RULE_ARN=${vars.NIGHTLY_DECAY_RULE_ARN}`,
    '',
  ];
  return lines.join('\n');
}

export function writeEnvFiles(vars: Record<string, string>, rootDir = process.cwd(), frontendOnly = false) {
  const envContent = formatEnvContent(vars);

  const targets = frontendOnly ? [path.join(rootDir, 'frontend/.env.local')] : [
    path.join(rootDir, '.env'),
    path.join(rootDir, 'services/api/.env'),
    path.join(rootDir, 'apps/web/.env'),
    path.join(rootDir, 'frontend/.env.local'),
    path.join(rootDir, 'apps/mobile/.env'),
  ];

  for (const target of targets) {
    const dir = path.dirname(target);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    let content = envContent;
    if (target === path.join(rootDir, 'frontend/.env.local')) {
      const publicVars = Object.entries(vars).filter(([key]) => key.startsWith('VITE_'));
      const keys = new Set(publicVars.map(([key]) => key));
      const preserved = fs.existsSync(target) ? fs.readFileSync(target, 'utf8').split('\n').filter(line => !keys.has(line.split('=')[0].trim())).join('\n').trim() : '';
      content = [preserved, ...publicVars.map(([key, value]) => `${key}=${value}`)].filter(Boolean).join('\n') + '\n';
    }
    fs.writeFileSync(target, content, 'utf8');
    console.log(`[EXPORT-ENV] Wrote environment config to: ${target}`);
  }
}

// CLI Execution
if (process.argv[1]?.includes('export-env')) {
  const frontendOnly = process.argv.includes('--frontend-only');
  const outputsFile = process.argv.slice(2).find(argument => argument !== '--frontend-only') || path.join(process.cwd(), 'cdk-outputs.json');
  try {
    console.log(`[EXPORT-ENV] Reading CDK outputs from ${outputsFile}...`);
    const vars = parseOutputs(outputsFile);
    writeEnvFiles(vars, process.cwd(), frontendOnly);
    console.log(`[EXPORT-ENV] Successfully exported environment variables!`);
  } catch (err: any) {
    console.error(`[EXPORT-ENV ERROR]: ${err.message}`);
    process.exit(1);
  }
}
