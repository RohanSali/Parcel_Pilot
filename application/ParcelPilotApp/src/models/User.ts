import { DocumentData, QueryDocumentSnapshot } from '@react-native-firebase/firestore';
import { BaseModel } from './BaseModel';

export interface User extends BaseModel {
  userId: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  networkMemberships: string[];
  isSuperAdmin: boolean;
}

export const userConverter = {
  toFirestore: (user: User): DocumentData => {
    return {
      ...user,
    };
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot
  ): User => {
    const data = snapshot.data();
    return {
      userId: data.userId,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      networkMemberships: data.networkMemberships || [],
      isSuperAdmin: data.isSuperAdmin || false,
      createdAt: data.createdAt,
      createdBy: data.createdBy,
      updatedAt: data.updatedAt,
      updatedBy: data.updatedBy,
      isDeleted: data.isDeleted || false,
      status: data.status || 'active',
      version: data.version || 1,
    };
  },
};
