$screens = @(
  "Splash", "Authentication", "NetworkSelection", "Dashboard", "VehicleList",
  "VehicleDetails", "VehicleRegistration", "CallVehicle", "TaskList",
  "TaskDetails", "TaskCreation", "MapViewer", "MapEditor", "ManualControl",
  "Notifications", "BroadcastMessaging", "Analytics", "RolesPermissions",
  "UserManagement", "Profile", "Settings", "About", "NotFound"
)

$components = @{
  "buttons" = @("PrimaryButton", "SecondaryButton", "DangerButton", "OutlinedButton", "IconButton")
  "cards" = @("VehicleCard", "TaskCard", "AnalyticsCard", "QuickActionCard", "DashboardCard")
  "layout" = @("Screen", "PageHeader", "SectionHeader", "EmptyState", "LoadingView", "PermissionGuard")
  "dialogs" = @("ConfirmationDialog", "DeleteDialog", "LoadingDialog")
  "inputs" = @("AppTextField", "Dropdown", "SearchBar")
  "badges" = @("StatusBadge", "PriorityBadge", "RoleBadge")
}

$stores = @(
  "appStore", "themeStore", "authStore", "networkStore", "vehicleStore", "taskStore", "notificationStore", "permissionStore"
)

# Generate Screens
foreach ($screen in $screens) {
  $content = @"
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ${screen}Screen = () => {
  return (
    <View style={styles.container}>
      <Text>${screen} Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
"@
  Set-Content -Path "src/screens/${screen}Screen.tsx" -Value $content
}

# Generate Components
foreach ($folder in $components.Keys) {
  foreach ($comp in $components[$folder]) {
    $content = @"
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ${comp} = () => {
  return (
    <View style={styles.container}>
      <Text>${comp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8 },
});
"@
    Set-Content -Path "src/components/${folder}/${comp}.tsx" -Value $content
  }
}

# Generate Stores
foreach ($store in $stores) {
  $capitalized = $store.Substring(0,1).ToUpper() + $store.Substring(1)
  $content = @"
import { create } from 'zustand';

interface ${capitalized}State {
  // Placeholder state
}

export const use${capitalized} = create<${capitalized}State>((set) => ({
  // Placeholder initial state
}));
"@
  Set-Content -Path "src/store/${store}.ts" -Value $content
}

# Generate Services
$services = @("firebase", "backend", "vehicle", "maps", "notifications")
foreach ($srv in $services) {
  $capitalized = $srv.Substring(0,1).ToUpper() + $srv.Substring(1)
  $content = @"
export class ${capitalized}Service {
  // Placeholder for ${srv} service
}
"@
  Set-Content -Path "src/services/${srv}Service.ts" -Value $content
}

# Generate Types
$content = @"
export interface User {
  id: string;
  name: string;
}

export interface Network {
  id: string;
  name: string;
}

export interface Vehicle {
  id: string;
  state: string;
}

export interface Task {
  id: string;
  status: string;
}
"@
Set-Content -Path "src/types/index.ts" -Value $content
