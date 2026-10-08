import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { SignInScreen } from '../screens/onboarding/SignInScreen';
import { VerifyCodeScreen } from '../screens/onboarding/VerifyCodeScreen';
import { LanguageScreen } from '../screens/onboarding/LanguageScreen';
import { LocationSetupScreen } from '../screens/onboarding/LocationSetupScreen';
import { HomeTerritoryRevealScreen } from '../screens/onboarding/HomeTerritoryRevealScreen';

import { CitizenTabs } from './CitizenTabs';
import { CollectorHomeScreen } from '../screens/collector/CollectorHomeScreen';

const Stack = createNativeStackNavigator();
const StackNavigator = Stack.Navigator as any;
const StackScreen = Stack.Screen as any;

export const RootNavigator: React.FC = () => {
  const { activeRole } = useAuth();

  return (
    <StackNavigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0F172A' },
      }}
    >
      <StackScreen name="Splash" component={SplashScreen} />
      <StackScreen name="Welcome" component={WelcomeScreen} />
      <StackScreen name="SignIn" component={SignInScreen} />
      <StackScreen name="VerifyCode" component={VerifyCodeScreen} />
      <StackScreen name="Language" component={LanguageScreen} />
      <StackScreen name="LocationSetup" component={LocationSetupScreen} />
      <StackScreen name="HomeTerritoryReveal" component={HomeTerritoryRevealScreen} />

      <StackScreen name="Main">
        {() => (activeRole === 'collector' ? <CollectorHomeScreen /> : <CitizenTabs />)}
      </StackScreen>
    </StackNavigator>
  );
};
