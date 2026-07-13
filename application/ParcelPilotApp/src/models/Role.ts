import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { BaseModel } from './BaseModel';

export interface Role extends BaseModel {
  roleId: string;
  networkId: string;
  name: string;
  permissions: string[];
}

export const roleConverter = {
  toFirestore: (role: Role): FirebaseFirestoreTypes.DocumentData => {
    return {
      ...role,
    };
  },
  fromFirestore: (
    snapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot
  ): Role => {
    const data = snapshot.data();
    return {
      roleId: data.roleId,
      networkId: data.networkId,
      name: data.name,
      permissions: data.permissions || [],
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
