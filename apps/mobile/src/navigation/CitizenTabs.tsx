import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { HomeScreen } from '../screens/citizen/HomeScreen';
import { MapScreen } from '../screens/citizen/MapScreen';
import { ScanScreen } from '../screens/citizen/ScanScreen';
import { TasksScreen } from '../screens/citizen/TasksScreen';
import { ProfileScreen } from '../screens/citizen/ProfileScreen';

const Tab = createBottomTabNavigator();
const TabNavigator = Tab.Navigator as any;
const TabScreen = Tab.Screen as any;

export const CitizenTabs: React.FC = () => {
  return (
    <TabNavigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#1E293B',
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#64748B',
      }}
    >
      <TabScreen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <TabScreen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🗺️</Text>,
        }}
      />
      <TabScreen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarLabel: 'Scan',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📷</Text>,
        }}
      />
      <TabScreen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarLabel: 'Tasks',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📋</Text>,
        }}
      />
      <TabScreen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </TabNavigator>
  );
};
