import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { SignInScreen } from '../screens/onboarding/SignInScreen';
import { VerifyCodeScreen } from '../screens/onboarding/VerifyCodeScreen';
import { LanguageScreen } from '../screens/onboarding/LanguageScreen';
import { LocationSetupScreen } from '../screens/onboarding/LocationSetupScreen';
import { HomeTerritoryRevealScreen } from '../screens/onboarding/HomeTerritoryRevealScreen';

import { CitizenTabs } from './CitizenTabs';
import { CollectorHomeScreen } from '../screens/collector/CollectorHomeScreen';
import { TasksScreen } from '../screens/citizen/TasksScreen';
import { LeaderboardScreen } from '../screens/citizen/LeaderboardScreen';
import { RewardsScreen } from '../screens/citizen/RewardsScreen';

const Stack = createNativeStackNavigator();
const StackNavigator = Stack.Navigator as any;
const StackScreen = Stack.Screen as any;

export const RootNavigator: React.FC = () => {
  const { activeRole } = useAuth();
  const { theme } = useTheme();

  return (
    <StackNavigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg },
        animation: 'slide_from_right',
        animationDuration: 350,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
    >
      <StackScreen name="Splash" component={SplashScreen} options={{ animation: 'fade' }} />
      <StackScreen name="Welcome" component={WelcomeScreen} options={{ animation: 'fade' }} />
      <StackScreen name="SignIn" component={SignInScreen} />
      <StackScreen name="VerifyCode" component={VerifyCodeScreen} />
      <StackScreen name="Language" component={LanguageScreen} />
      <StackScreen name="LocationSetup" component={LocationSetupScreen} />
      <StackScreen name="HomeTerritoryReveal" component={HomeTerritoryRevealScreen} options={{ animation: 'slide_from_bottom' }} />

      <StackScreen name="Main" options={{ animation: 'fade' }}>
        {() => (activeRole === 'collector' ? <CollectorHomeScreen /> : <CitizenTabs />)}
      </StackScreen>

      <StackScreen
        name="Tasks"
        component={TasksScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true, fullScreenGestureEnabled: true }}
      />
      <StackScreen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true, fullScreenGestureEnabled: true }}
      />
      <StackScreen
        name="Rewards"
        component={RewardsScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true, fullScreenGestureEnabled: true }}
      />
    </StackNavigator>
  );
};
