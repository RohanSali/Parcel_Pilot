import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/DashboardScreen';
import { VehicleListScreen } from '../screens/VehicleListScreen';
import { TaskListScreen } from '../screens/TaskListScreen';
import { MapViewerScreen } from '../screens/MapViewerScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { BottomTabParamList } from './types';
import { Home, Truck, List, Map, Settings as SettingsIcon } from 'lucide-react-native';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tab.Screen 
        name="VehicleList" 
        component={VehicleListScreen} 
        options={{ tabBarIcon: ({ color, size }) => <Truck color={color} size={size} /> }}
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
