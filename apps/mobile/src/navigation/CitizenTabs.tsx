import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';

import { HomeScreen } from '../screens/citizen/HomeScreen';
import { MapScreen } from '../screens/citizen/MapScreen';
import { ScanScreen } from '../screens/citizen/ScanScreen';
import { TasksScreen } from '../screens/citizen/TasksScreen';
import { ProfileScreen } from '../screens/citizen/ProfileScreen';
import { Icon3D } from '../components/Icon3D';
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
          backgroundColor: '#FFFFFF',
          borderTopColor: colors.borderSubtle,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 6,
        },
        tabBarActiveTintColor: colors.textPrimary,
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
          tabBarIcon: () => <Icon3D name="home" size={26} />,
        }}
      />
      <TabScreen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: () => <Icon3D name="map" size={26} />,
        }}
      />
      <TabScreen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarLabel: 'Scan',
          tabBarIcon: () => (
            <View style={styles.scanTabBadge}>
              <Icon3D name="scan" size={32} />
            </View>
          ),
        }}
      />
      <TabScreen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarLabel: 'Tasks',
          tabBarIcon: () => <Icon3D name="tasks" size={26} />,
        }}
      />
      <TabScreen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <Icon3D name="profile" size={26} />,
        }}
      />
    </TabNavigator>
  );
};

const styles = StyleSheet.create({
  scanTabBadge: {
    width: 46,
    height: 46,
    borderRadius: radii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: colors.surfaceRaised,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
});
