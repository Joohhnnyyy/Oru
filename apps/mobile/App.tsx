import React from 'react';
import { StatusBar } from 'react-native';
import { registerRootComponent } from 'expo';
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
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <RootNavigator />
        </NavContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

registerRootComponent(App);

