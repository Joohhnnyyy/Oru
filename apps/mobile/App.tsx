import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';

const NavContainer = NavigationContainer as any;

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavContainer>
          <StatusBar style="light" />
          <RootNavigator />
        </NavContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
