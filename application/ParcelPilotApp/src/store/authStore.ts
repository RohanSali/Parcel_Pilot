import { create } from 'zustand';
import { User as AppUser } from '../models/User';
import { AuthService } from '../services/auth/AuthService';
import { authRepository } from '../services/auth/AuthRepository';
import { User as FirebaseUser } from '@react-native-firebase/auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthStoreState {
  user: AppUser | null;
  status: AuthStatus;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: (firebaseUser: FirebaseUser | null) => Promise<void>;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  status: 'loading',

  signIn: async () => {
    try {
      set({ status: 'loading' });
      const credential = await AuthService.signInWithGoogle();
      if (credential?.user) {
        const userModel = await authRepository.syncUser(credential.user);
        set({ user: userModel, status: 'authenticated' });
      } else {
        set({ status: 'unauthenticated' });
      }
    } catch (error) {
      console.error('SignIn Error:', error);
      set({ status: 'unauthenticated' });
      throw error;
    }
  },

  signInWithEmail: async (email, password) => {
    try {
      set({ status: 'loading' });
      const credential = await AuthService.loginWithEmail(email, password);
      if (credential?.user) {
        const userModel = await authRepository.syncUser(credential.user);
        set({ user: userModel, status: 'authenticated' });
      } else {
        set({ status: 'unauthenticated' });
      }
    } catch (error) {
      console.error('Email SignIn Error:', error);
      set({ status: 'unauthenticated' });
      throw error;
    }
  },

  registerWithEmail: async (email, password) => {
    try {
      set({ status: 'loading' });
      const credential = await AuthService.registerWithEmail(email, password);
      if (credential?.user) {
        const userModel = await authRepository.syncUser(credential.user);
        set({ user: userModel, status: 'authenticated' });
      } else {
        set({ status: 'unauthenticated' });
      }
    } catch (error) {
      console.error('Email Registration Error:', error);
      set({ status: 'unauthenticated' });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ status: 'loading' });
      await AuthService.signOut();
      set({ user: null, status: 'unauthenticated' });
    } catch (error) {
      console.error('SignOut Error:', error);
      set({ status: 'authenticated' });
      throw error;
    }
  },

  restoreSession: async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      try {
        const userModel = await authRepository.syncUser(firebaseUser);
        set({ user: userModel, status: 'authenticated' });
      } catch (error) {
        console.error('RestoreSession Error:', error);
        set({ user: null, status: 'unauthenticated' });
      }
    } else {
      set({ user: null, status: 'unauthenticated' });
    }
  },
}));
