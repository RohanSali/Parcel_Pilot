import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { BaseModel } from './BaseModel';

export interface Network extends BaseModel {
  networkId: string;
  name: string;
  superAdminId: string;
}

export const networkConverter = {
  toFirestore: (network: Network): FirebaseFirestoreTypes.DocumentData => {
    return {
      ...network,
    };
  },
  fromFirestore: (
    snapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot
  ): Network => {
    const data = snapshot.data();
    return {
      networkId: data.networkId,
      name: data.name,
      superAdminId: data.superAdminId,
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
