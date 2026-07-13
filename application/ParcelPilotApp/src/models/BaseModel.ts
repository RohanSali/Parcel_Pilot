import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface BaseModel {
  createdAt: FirebaseFirestoreTypes.Timestamp | null;
  createdBy: string | null;
  updatedAt: FirebaseFirestoreTypes.Timestamp | null;
  updatedBy: string | null;
  isDeleted: boolean;
  status: string;
  version: number;
}
