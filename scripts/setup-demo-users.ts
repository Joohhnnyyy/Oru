import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminAddUserToGroupCommand,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const USER_POOL_ID = 'ap-south-1_KZcMN2CaO';
const CLIENT_ID = '2g4b36dekkv7f0lu9ad4h4s7oa';
const REGION = 'ap-south-1';
const API_URL = 'https://dp029jx9uf.execute-api.ap-south-1.amazonaws.com';

const client = new CognitoIdentityProviderClient({ region: REGION });

async function setupUser(email: string, pass: string, groups: string[], role: string) {
  console.log(`Setting up user: ${email} (Role: ${role})...`);

  // 1. Create user
  try {
    await client.send(
      new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        MessageAction: 'SUPPRESS',
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'true' },
        ],
      }),
    );
    console.log(`✓ User ${email} created in Cognito`);
  } catch (err: any) {
    if (err.name === 'UsernameExistsException') {
      console.log(`ℹ User ${email} already exists in Cognito`);
    } else {
      throw err;
    }
  }

  // 2. Set permanent password
  await client.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      Password: pass,
      Permanent: true,
    }),
  );
  console.log(`✓ Permanent password set`);

  // 3. Add to groups
  for (const group of groups) {
    try {
      await client.send(
        new AdminAddUserToGroupCommand({
          UserPoolId: USER_POOL_ID,
          Username: email,
          GroupName: group,
        }),
      );
      console.log(`✓ Added to Cognito group: ${group}`);
    } catch (err: any) {
      console.log(`ℹ Group assignment note: ${err.message}`);
    }
  }

  // 4. Authenticate to get real tokens
  const authRes = await client.send(
    new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: pass,
      },
    }),
  );

  const idToken = authRes.AuthenticationResult?.IdToken!;
  console.log(`✓ Got live Cognito ID Token (first 20 chars): ${idToken.substring(0, 20)}...`);

  // 5. Call live /v1/onboarding to provision user in DynamoDB
  console.log(`Calling live /v1/onboarding...`);
  const onboardRes = await fetch(`${API_URL}/v1/onboarding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      language: role === 'ward_admin' ? 'en' : 'hi',
      latitude: 28.5355,
      longitude: 77.241,
    }),
  });

  const onboardData = await onboardRes.json();
  console.log(`Onboarding HTTP status: ${onboardRes.status}`, onboardData);

  return { email, password: pass, idToken };
}

async function main() {
  console.log('--- Initializing Permanent Demo Personas in Cognito & DynamoDB ---');

  const citizen = await setupUser(
    'demo-citizen@saafsafari.local',
    'REMOVED_CREDENTIAL',
    ['citizen'],
    'citizen'
  );

  const admin = await setupUser(
    'demo-admin@saafsafari.local',
    'REMOVED_CREDENTIAL',
    ['ward_admin', 'citizen'],
    'ward_admin'
  );

  console.log('\n--- Live Persona Setup Complete ---');
  console.log('Citizen: demo-citizen@saafsafari.local / REMOVED_CREDENTIAL');
  console.log('Admin:   demo-admin@saafsafari.local / REMOVED_CREDENTIAL');
}

main().catch(console.error);
