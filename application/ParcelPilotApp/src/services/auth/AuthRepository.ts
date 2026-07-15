import { FirestoreRepository } from '../firebase/FirestoreRepository';
import { User, userConverter } from '../../models/User';
import 'react-native-get-random-values';

const generateUserId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'USR-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export class AuthRepository extends FirestoreRepository<User> {
  constructor() {
    super('users', userConverter);
  }

  /**
   * Syncs the Firebase Auth user with Firestore. 
   * Creates a new user document if one doesn't exist.
   */
  async syncUser(firebaseUser: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }): Promise<{ user: User, isNewUser: boolean }> {
    let user = await this.getById(firebaseUser.uid);
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      // First login: Create User Document
      // Generate a UUID for the user independent of their Firebase UID as per SRS
      const newUser: Partial<User> = {
        firebaseUid: firebaseUser.uid,
        userId: generateUserId(), 
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        ecosystems: [],
        isSuperAdmin: false,
        createdBy: firebaseUser.uid,
        status: 'active',
      };
      
      await this.create(firebaseUser.uid, newUser);
      user = await this.getById(firebaseUser.uid);
    }

    if (!user) {
      throw new Error('Failed to sync user');
    }

    return { user, isNewUser };
  }
}

export const authRepository = new AuthRepository();
