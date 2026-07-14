import { NavigatorScreenParams } from '@react-navigation/native';

export type BottomTabParamList = {
  Dashboard: undefined;
  Notifications: undefined;
  TaskList: undefined;
  MapViewer: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  EcosystemPrompt: undefined;
  NetworkSelection: undefined;
  Main: NavigatorScreenParams<BottomTabParamList>;
  VehicleDetails: { vehicleId: string };
  VehicleRegistration: undefined;
  CallVehicle: undefined;
  TaskDetails: { taskId: string };
  TaskCreation: undefined;
  MapEditor: undefined;
  ManualControl: { vehicleId: string };
  Notifications: undefined;
  BroadcastMessaging: undefined;
  Analytics: undefined;
  RolesPermissions: undefined;
  UserManagement: undefined;
  Profile: undefined;
  About: undefined;
  NotFound: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
