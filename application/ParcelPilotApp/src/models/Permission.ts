import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { BaseModel } from './BaseModel';

export interface Permission extends BaseModel {
  permissionId: string;
  key: string;
  description: string;
}

export const permissionConverter = {
  toFirestore: (permission: Permission): FirebaseFirestoreTypes.DocumentData => {
    return {
      ...permission,
    };
  },
  fromFirestore: (
    snapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot
  ): Permission => {
    const data = snapshot.data();
    return {
      permissionId: data.permissionId,
      key: data.key,
      description: data.description,
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
