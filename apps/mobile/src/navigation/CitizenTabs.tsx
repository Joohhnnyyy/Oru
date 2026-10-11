import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { Icon, IconName } from '../components/Icon';
import { Bounce } from '../components/Motion';
import * as Haptics from 'expo-haptics';

import { HomeScreen } from '../screens/citizen/HomeScreen';
import { MapScreen } from '../screens/citizen/MapScreen';
import { ScanScreen } from '../screens/citizen/ScanScreen';
import { RewardsScreen } from '../screens/citizen/RewardsScreen';
import { ProfileScreen } from '../screens/citizen/ProfileScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();
const TabNavigator = Tab.Navigator as any;
const TabScreen = Tab.Screen as any;

const TabIcon: React.FC<{ name: IconName; focused: boolean; color: string }> = ({ name, focused, color }) => (
  <Bounce trigger={focused}>
    <Icon name={name} size={24} color={color} strokeWidth={focused ? 3 : 2.5} />
  </Bounce>
);

const ScanTabIcon: React.FC = () => <Icon name="scan" size={28} color="#05070C" strokeWidth={3} />;

export const CitizenTabs: React.FC = () => {
  const { theme, isDark } = useTheme();

  return (
    <TabNavigator
      screenOptions={{
        headerShown: false,
        animation: 'none',
        tabBarHideOnKeyboard: true,
        safeAreaInsets: Platform.OS === 'ios' ? undefined : { bottom: 0 },
        tabBarStyle: {
          backgroundColor: theme.tabBarBg,
          borderTopColor: theme.tabBarBorder,
          borderTopWidth: 2,
          height: Platform.OS === 'ios' ? 84 : 72,
          paddingBottom: Platform.OS === 'ios' ? 22 : 8,
          paddingTop: 8,
          paddingHorizontal: 8,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.35 : 0.05,
          shadowRadius: 8,
          elevation: 6,
        },
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
          marginBottom: 0,
        },
      }}
      screenListeners={{
        tabPress: (e: any) => {
          if (e.target?.includes('Scan')) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          } else {
            Haptics.selectionAsync().catch(() => {});
          }
        },
      }}
    >
      <TabScreen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
            <View style={[styles.tabIconWrapper, focused && { backgroundColor: isDark ? 'rgba(0, 207, 255, 0.14)' : 'rgba(0, 229, 212, 0.18)', borderColor: theme.tabBarActive }]}>
              <TabIcon name="home" focused={focused} color={color} />
            </View>
          ),
        }}
      />
      <TabScreen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
            <View style={[styles.tabIconWrapper, focused && { backgroundColor: isDark ? 'rgba(0, 207, 255, 0.14)' : 'rgba(0, 229, 212, 0.18)', borderColor: theme.tabBarActive }]}>
              <TabIcon name="map" focused={focused} color={color} />
            </View>
          ),
        }}
      />
      <TabScreen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => (
            <View style={styles.floatingScanContainer}>
              <View style={styles.scanTabBadge}>
                <ScanTabIcon />
              </View>
            </View>
          ),
        }}
      />
      <TabScreen
        name="Rewards"
        component={RewardsScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
            <View style={[styles.tabIconWrapper, focused && { backgroundColor: isDark ? 'rgba(0, 207, 255, 0.14)' : 'rgba(0, 229, 212, 0.18)', borderColor: theme.tabBarActive }]}>
              <TabIcon name="gift" focused={focused} color={color} />
            </View>
          ),
        }}
      />
      <TabScreen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
            <View style={[styles.tabIconWrapper, focused && { backgroundColor: isDark ? 'rgba(0, 207, 255, 0.14)' : 'rgba(0, 229, 212, 0.18)', borderColor: theme.tabBarActive }]}>
              <TabIcon name="user" focused={focused} color={color} />
            </View>
          ),
        }}
      />
    </TabNavigator>
  );
};

const styles = StyleSheet.create({
  tabIconWrapper: {
    width: 52,
    height: 42,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingScanContainer: {
    top: -16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanTabBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#00E5D4',
    borderBottomWidth: 5,
    borderBottomColor: '#00A99C',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
