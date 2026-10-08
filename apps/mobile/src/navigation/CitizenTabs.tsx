import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import { HomeScreen } from '../screens/citizen/HomeScreen';
import { MapScreen } from '../screens/citizen/MapScreen';
import { ScanScreen } from '../screens/citizen/ScanScreen';
import { TasksScreen } from '../screens/citizen/TasksScreen';
import { ProfileScreen } from '../screens/citizen/ProfileScreen';
import { colors, radii } from '../theme/tokens';

const Tab = createBottomTabNavigator();
const TabNavigator = Tab.Navigator as any;
const TabScreen = Tab.Screen as any;

export const CitizenTabs: React.FC = () => {
  return (
    <TabNavigator
      screenOptions={{
        headerShown: false,
        animation: 'none',
        tabBarStyle: {
          backgroundColor: colors.surfaceBase,
          borderTopColor: colors.borderSubtle,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.surfaceRaised,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <TabScreen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🏠</Text>,
        }}
      />
      <TabScreen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🗺️</Text>,
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
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>📋</Text>,
        }}
      />
      <TabScreen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>👤</Text>,
        }}
      />
    </TabNavigator>
  );
};

const styles = StyleSheet.create({
  scanTabBadge: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceAccentSubtle,
    borderWidth: 1.5,
    borderColor: colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});
