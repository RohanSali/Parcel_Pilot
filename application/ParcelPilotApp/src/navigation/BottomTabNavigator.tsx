import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/DashboardScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { TaskListScreen } from '../screens/TaskListScreen';
import { MapViewerScreen } from '../screens/MapViewerScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { BottomTabParamList } from './types';
import { Home, Bell, List, Map, Settings as SettingsIcon } from 'lucide-react-native';
import { useThemeColors } from '../hooks/useThemeColors';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const BottomTabNavigator = () => {
  const { colors, isDark } = useThemeColors();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ tabBarIcon: ({ color, size }) => <Bell color={color} size={size} /> }}
      />
      <Tab.Screen 
        name="TaskList" 
        component={TaskListScreen} 
        options={{ tabBarIcon: ({ color, size }) => <List color={color} size={size} /> }}
      />
      <Tab.Screen 
        name="MapViewer" 
        component={MapViewerScreen} 
        options={{ tabBarIcon: ({ color, size }) => <Map color={color} size={size} /> }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
};
