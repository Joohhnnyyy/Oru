import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class AuthStack extends Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Cognito User Pool configured for Email OTP / Passwordless & standard auth
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'saafsafari-user-pool',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        phone: false,
        username: false,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Client for mobile and web clients
    this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
      userPoolClientName: 'saafsafari-client',
      generateSecret: false,
      authFlows: {
        userSrp: true,
        userPassword: true,
        custom: true,
        adminUserPassword: true,
      },
      preventUserExistenceErrors: true,
    });

    // Pre-created User Pool Groups
    const roles = ['citizen', 'collector', 'ward_admin', 'merchant'];
    for (const role of roles) {
      new cognito.CfnUserPoolGroup(this, `Group-${role}`, {
        userPoolId: this.userPool.userPoolId,
        groupName: role,
        description: `SaafSafari role group for ${role}`,
      });
    }

    // Outputs
    new CfnOutput(this, 'UserPoolIdOutput', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: 'SaafSafari-UserPoolId',
    });

    new CfnOutput(this, 'UserPoolClientIdOutput', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: 'SaafSafari-UserPoolClientId',
    });

    new CfnOutput(this, 'UserPoolArnOutput', {
      value: this.userPool.userPoolArn,
      description: 'Cognito User Pool ARN',
    });
  }
}
