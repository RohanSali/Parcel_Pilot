import { NavigatorScreenParams } from '@react-navigation/native';

export type BottomTabParamList = {
  NetworkDashboard: undefined;
  Chats: undefined;
  TaskList: undefined;
  MapViewer: undefined;
  VehicleList: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  EcosystemPrompt: undefined;
  Ecosystems: undefined;
  NetworkSelection: undefined;
  Dashboard: undefined;
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
  RolesManagement: undefined;
  UserManagement: undefined;
  ManageNetworks: undefined;
  Profile: undefined;
  Settings: undefined;
  About: undefined;
  NotFound: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
