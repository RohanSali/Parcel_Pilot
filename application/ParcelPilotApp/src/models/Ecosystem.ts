import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface EcosystemNetwork {
  name: string;
  description?: string;
  createdAt: number;
  joinCode?: string;
  joinCodeExpiresAt?: number;
}

export interface EcosystemUser {
  firebaseUid: string;
  role: 'SuperAdmin' | 'Admin' | 'User';
  networks?: string[];
}

export interface Ecosystem {
  ecosystemCode: string;
  ownerFirebaseUid: string;
  networks: Record<string, EcosystemNetwork>;
  users: Record<string, EcosystemUser>;
  permissions?: Record<string, string[]>;
  customRoles?: Record<string, string[]>;
}

export const ecosystemConverter = {
  toFirestore: (ecosystem: Ecosystem): FirebaseFirestoreTypes.DocumentData => {
    return {
      ...ecosystem,
    };
  },
  fromFirestore: (
    snapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot
  ): Ecosystem => {
    const data = snapshot.data();
    return {
      ecosystemCode: snapshot.id,
      ownerFirebaseUid: data.ownerFirebaseUid,
      networks: data.networks || {},
      users: data.users || {},
      createdAt: data.createdAt || Date.now(),
      permissions: data.permissions || {},
      customRoles: data.customRoles || {},
    };
  },
};
