import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

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
        animation: 'none', // Emil Kowalski rule: Tabs are peers, not a hierarchy; tab switches never slide
        tabBarStyle: {
          backgroundColor: '#0A0F1D',
          borderTopColor: 'rgba(255, 255, 255, 0.07)',
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <TabScreen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 19 }}>🏠</Text>,
        }}
      />
      <TabScreen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: () => <Text style={{ fontSize: 19 }}>🗺️</Text>,
        }}
      />
      <TabScreen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarLabel: 'Scan',
          tabBarIcon: () => (
            <View style={styles.scanTabBadge}>
              <Text style={{ fontSize: 18 }}>📷</Text>
            </View>
          ),
        }}
      />
      <TabScreen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarLabel: 'Tasks',
          tabBarIcon: () => <Text style={{ fontSize: 19 }}>📋</Text>,
        }}
      />
      <TabScreen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <Text style={{ fontSize: 19 }}>👤</Text>,
        }}
      />
    </TabNavigator>
  );
};

const styles = StyleSheet.create({
  scanTabBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
});
