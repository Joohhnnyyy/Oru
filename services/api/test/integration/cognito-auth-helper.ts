import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminAddUserToGroupCommand,
  AdminInitiateAuthCommand,
  AdminDeleteUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import * as crypto from 'crypto';

export interface TestUserSession {
  email: string;
  password: string;
  userId: string;
  idToken: string;
  accessToken: string;
}

export function createCognitoClient(region = process.env.AWS_REGION || 'ap-south-1'): CognitoIdentityProviderClient {
  return new CognitoIdentityProviderClient({ region });
}

export async function createTestCitizenUser(
  userPoolId: string,
  clientId: string,
  region = process.env.AWS_REGION || 'ap-south-1',
): Promise<TestUserSession> {
  const client = createCognitoClient(region);
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  const email = `test-citizen-${Date.now()}-${randomSuffix}@saafsafari.local`;
  const password = `TestPass!2026#${randomSuffix}`;

  // 1. Create user in Cognito User Pool
  const createRes = await client.send(
    new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: email,
      MessageAction: 'SUPPRESS',
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'true' },
      ],
    }),
  );

  const userId = createRes.User?.Username || email;

  // 2. Set permanent password
  await client.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: userPoolId,
      Username: email,
      Password: password,
      Permanent: true,
    }),
  );

  // 3. Assign to 'citizen' group
  await client.send(
    new AdminAddUserToGroupCommand({
      UserPoolId: userPoolId,
      Username: email,
      GroupName: 'citizen',
    }),
  );

  // 4. Authenticate via ADMIN_NO_SRP_AUTH
  const authRes = await client.send(
    new AdminInitiateAuthCommand({
      UserPoolId: userPoolId,
      ClientId: clientId,
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    }),
  );

  const idToken = authRes.AuthenticationResult?.IdToken;
  const accessToken = authRes.AuthenticationResult?.AccessToken;

  if (!idToken || !accessToken) {
    throw new Error(`Failed to authenticate test user ${email}. Tokens missing in response.`);
  }

  return {
    email,
    password,
    userId,
    idToken,
    accessToken,
  };
}

export async function elevateUserToAdmin(
  userPoolId: string,
  clientId: string,
  email: string,
  password: string,
  region = process.env.AWS_REGION || 'ap-south-1',
): Promise<{ idToken: string; accessToken: string }> {
  const client = createCognitoClient(region);

  // 1. Add user to 'ward_admin' group
  await client.send(
    new AdminAddUserToGroupCommand({
      UserPoolId: userPoolId,
      Username: email,
      GroupName: 'ward_admin',
    }),
  );

  // 2. Re-authenticate to issue token containing ward_admin group claim
  const authRes = await client.send(
    new AdminInitiateAuthCommand({
      UserPoolId: userPoolId,
      ClientId: clientId,
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    }),
  );

  const idToken = authRes.AuthenticationResult?.IdToken;
  const accessToken = authRes.AuthenticationResult?.AccessToken;

  if (!idToken || !accessToken) {
    throw new Error(`Failed to refresh token after elevating user ${email} to admin.`);
  }

  return { idToken, accessToken };
}

export async function cleanupCognitoUser(
  userPoolId: string,
  email: string,
  region = process.env.AWS_REGION || 'ap-south-1',
): Promise<void> {
  const client = createCognitoClient(region);
  try {
    await client.send(
      new AdminDeleteUserCommand({
        UserPoolId: userPoolId,
        Username: email,
      }),
    );
  } catch (err: any) {
    // Ignore UserNotFoundException on teardown
    if (err.name !== 'UserNotFoundException') {
      console.warn(`[CLEANUP WARNING] Failed to delete test user ${email}:`, err.message);
    }
  }
}
