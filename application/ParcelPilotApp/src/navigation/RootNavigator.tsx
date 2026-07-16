import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { RootStackParamList } from './types';
import { useAuthStore } from '../store/authStore';
import { useNetworkStore } from '../store/networkStore';
import { AuthService } from '../services/auth/AuthService';

// Import all screens (placeholder)
import { SplashScreen } from '../screens/SplashScreen';
import { AuthNavigator } from './AuthNavigator';
import { DashboardScreen } from '../screens/DashboardScreen';
import { EcosystemPromptScreen } from '../screens/EcosystemPromptScreen';
import { VehicleDetailsScreen } from '../screens/VehicleDetailsScreen';
import { VehicleRegistrationScreen } from '../screens/VehicleRegistrationScreen';
import { CallVehicleScreen } from '../screens/CallVehicleScreen';
import { TaskDetailsScreen } from '../screens/TaskDetailsScreen';
import { TaskCreationScreen } from '../screens/TaskCreationScreen';
import { MapEditorScreen } from '../screens/MapEditorScreen';
import { ManualControlScreen } from '../screens/ManualControlScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { BroadcastMessagingScreen } from '../screens/BroadcastMessagingScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { RolesManagementScreen } from '../screens/RolesManagementScreen';
import { UserManagementScreen } from '../screens/UserManagementScreen';
import { ManageNetworksScreen } from '../screens/ManageNetworksScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { NotFoundScreen } from '../screens/NotFoundScreen';
import { EcosystemsScreen } from '../screens/EcosystemsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { status, restoreSession, showEcosystemPrompt } = useAuthStore();
  const { activeNetwork } = useNetworkStore();

  useEffect(() => {
    const subscriber = AuthService.onAuthStateChanged(restoreSession);
    return subscriber; 
  }, [restoreSession]);

  if (status === 'loading') {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {status === 'unauthenticated' ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : showEcosystemPrompt ? (
        <Stack.Screen name="EcosystemPrompt" component={EcosystemPromptScreen} />
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
          <Stack.Screen name="VehicleRegistration" component={VehicleRegistrationScreen} />
          <Stack.Screen name="CallVehicle" component={CallVehicleScreen} />
          <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
          <Stack.Screen name="TaskCreation" component={TaskCreationScreen} />
          <Stack.Screen name="MapEditor" component={MapEditorScreen} />
          <Stack.Screen name="ManualControl" component={ManualControlScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="BroadcastMessaging" component={BroadcastMessagingScreen} />
          <Stack.Screen name="Analytics" component={AnalyticsScreen} />
          <Stack.Screen name="RolesManagement" component={RolesManagementScreen} />
          <Stack.Screen name="UserManagement" component={UserManagementScreen} />
          <Stack.Screen name="ManageNetworks" component={ManageNetworksScreen} />
          <Stack.Screen name="Ecosystems" component={EcosystemsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="NotFound" component={NotFoundScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
