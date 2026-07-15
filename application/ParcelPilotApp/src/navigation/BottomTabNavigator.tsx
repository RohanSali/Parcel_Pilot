import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NetworkDashboardScreen } from '../screens/NetworkDashboardScreen';
import { BroadcastMessagingScreen } from '../screens/BroadcastMessagingScreen';
import { TaskListScreen } from '../screens/TaskListScreen';
import { MapViewerScreen } from '../screens/MapViewerScreen';
import { VehicleListScreen } from '../screens/VehicleListScreen';
import { BottomTabParamList } from './types';
import { Home, Bell, List, Map, Settings as SettingsIcon, MessageSquare, Truck, Network } from 'lucide-react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { useNetworkStore } from '../store/networkStore';
import { NotificationBell } from '../components/ui/NotificationBell';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const BottomTabNavigator = () => {
  const { colors, isDark } = useThemeColors();
  const { setActiveNetwork } = useNetworkStore();

  return (
    <Tab.Navigator
      screenOptions={({ navigation, route }) => ({
        headerShown: true,
        header: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <TouchableOpacity onPress={() => { setActiveNetwork(null); navigation.navigate('Dashboard'); }}>
              <Home color={colors.text.primary} size={24} />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text.primary }}>{route.name === 'NetworkDashboard' ? 'Overview' : route.name}</Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <NotificationBell onPress={() => navigation.navigate('Notifications')} color={colors.text.primary} size={24} />
              <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                <SettingsIcon color={colors.text.primary} size={24} />
              </TouchableOpacity>
            </View>
          </View>
        ),
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
      })}
    >
      <Tab.Screen 
        name="NetworkDashboard" 
        component={NetworkDashboardScreen} 
        options={{ tabBarLabel: 'Network', tabBarIcon: ({ color, size }) => <Network color={color} size={size} /> }}
      />
      <Tab.Screen 
        name="Chats" 
        component={BroadcastMessagingScreen} 
        options={{ tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} /> }}
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
        name="VehicleList" 
        component={VehicleListScreen} 
        options={{ tabBarIcon: ({ color, size }) => <Truck color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
};
