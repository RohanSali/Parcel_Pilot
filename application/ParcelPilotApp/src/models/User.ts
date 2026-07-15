import { DocumentData, QueryDocumentSnapshot } from '@react-native-firebase/firestore';
import { BaseModel } from './BaseModel';

export interface UserNotification {
  id: string;
  type: 'NETWORK_INVITE' | 'GENERAL';
  title: string;
  message: string;
  ecosystemId?: string;
  networkId?: string;
  createdAt: number;
  read: boolean;
}

export interface User extends BaseModel {
  firebaseUid: string;
  userId: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isSuperAdmin: boolean;
  ecosystems: string[];
  ecosystemCode?: string;
  active_econet?: { ecosystemId: string; networkId: string | null };
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
      ecosystems: data.ecosystems || [],
      ecosystemCode: data.ecosystemCode,
      active_econet: data.active_econet,
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
