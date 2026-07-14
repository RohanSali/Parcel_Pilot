import { DocumentData, QueryDocumentSnapshot } from '@react-native-firebase/firestore';
import { BaseModel } from './BaseModel';

export interface User extends BaseModel {
  firebaseUid: string;
  userId: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  ecosystems: string[];
  ecosystemCode?: string;
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
      firebaseUid: snapshot.id,
      userId: data.userId,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      isSuperAdmin: data.isSuperAdmin || false,
      isAdmin: data.isAdmin || false,
      ecosystems: data.ecosystems || [],
      ecosystemCode: data.ecosystemCode,
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
