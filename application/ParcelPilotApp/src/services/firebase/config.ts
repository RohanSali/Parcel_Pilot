import { firebase } from '@react-native-firebase/app';
// Ensure firebase is initialized. In React Native Firebase, 
// initialization is typically automatic via native modules (google-services.json / GoogleService-Info.plist).
// This is a placeholder for any manual configuration if needed.

export const getFirebaseApp = () => {
  return firebase.app();
};
