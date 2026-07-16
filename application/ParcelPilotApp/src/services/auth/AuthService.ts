import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signOut as signOutAuth,
  User,
  UserCredential,
  linkWithCredential,
  EmailAuthProvider,
  updatePassword,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '536715223671-tgbjg9lf4au330ru18opqul4a7froc5q.apps.googleusercontent.com',
  offlineAccess: true,
});

const auth = getAuth();

export class AuthService {
  static async signInWithGoogle(): Promise<UserCredential | null> {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      
      let idToken: string | null | undefined = null;

      if (response.type === 'success' && response.data) {
        idToken = response.data.idToken;
      } else {
        throw new Error('Google Sign-In was not completed or returned no data.');
      }
      
      // Always get tokens to ensure we have a valid accessToken for the React Native bridge
      const tokens = await GoogleSignin.getTokens();
      if (!idToken) {
        idToken = tokens.idToken;
      }

      if (!idToken) {
        throw new Error('Google Sign-In returned no idToken. Please verify your webClientId in GoogleSignin.configure(). Without a valid webClientId, Google Sign-In cannot generate the required ID Token for Firebase Auth.');
      }

      // Explicitly pass both idToken and accessToken to avoid the native "accessToken cannot be empty" crash
      const googleCredential = GoogleAuthProvider.credential(idToken, tokens.accessToken);
        
      return await signInWithCredential(auth, googleCredential);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  }

  static async linkWithGoogle(): Promise<UserCredential | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user is currently signed in.');

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      
      let idToken: string | null | undefined = null;

      if (response.type === 'success' && response.data) {
        idToken = response.data.idToken;
      } else {
        throw new Error('Google Sign-In was not completed or returned no data.');
      }
      
      const tokens = await GoogleSignin.getTokens();
      if (!idToken) {
        idToken = tokens.idToken;
      }

      if (!idToken) {
        throw new Error('Google Sign-In returned no idToken.');
      }

      const googleCredential = GoogleAuthProvider.credential(idToken, tokens.accessToken);
      return await linkWithCredential(currentUser, googleCredential);
    } catch (error) {
      console.error('Google Link Error:', error);
      throw error;
    }
  }

  static async loginWithEmail(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Email Login Error:', error);
      throw error;
    }
  }

  static async registerWithEmail(email: string, password: string): Promise<UserCredential> {
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Email Registration Error:', error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    try {
      const user = auth.currentUser;
      const isGoogleSignedIn = user?.providerData.some(p => p.providerId === 'google.com');
      
      await signOutAuth(auth);
      
      if (isGoogleSignedIn) {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      }
    } catch (error) {
      console.error('Sign Out Error:', error);
      throw error;
    }
  }

  static async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password Reset Error:', error);
      throw error;
    }
  }

  static async setNewPassword(newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user signed in');
      await updatePassword(user, newPassword);
    } catch (error) {
      console.error('Set Password Error:', error);
      throw error;
    }
  }

  static async changeExistingPassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user signed in');
      if (!user.email) throw new Error('User has no email associated');
      
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    } catch (error) {
      console.error('Change Password Error:', error);
      throw error;
    }
  }

  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  static onAuthStateChanged(callback: (user: User | null) => void) {
    return firebaseOnAuthStateChanged(auth, callback);
  }
}
