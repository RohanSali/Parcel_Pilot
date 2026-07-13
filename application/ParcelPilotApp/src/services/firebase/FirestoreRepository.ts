import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  FirestoreDataConverter,
  DocumentData
} from '@react-native-firebase/firestore';

export class FirestoreRepository<T extends DocumentData> {
  private collectionName: string;
  private converter: FirestoreDataConverter<T>;

  constructor(
    collectionName: string,
    converter: FirestoreDataConverter<T>
  ) {
    this.collectionName = collectionName;
    this.converter = converter;
  }

  protected get collectionRef() {
    const db = getFirestore();
    return collection(db, this.collectionName).withConverter<T>(this.converter);
  }

  async getById(id: string): Promise<T | null> {
    const documentRef = doc(this.collectionRef, id);
    const docSnap = await getDoc(documentRef);
    
    const exists = typeof docSnap.exists === 'function' ? docSnap.exists() : docSnap.exists;
    if (!exists) {
      return null;
    }
    
    return docSnap.data() as T;
  }

  async create(id: string, data: Partial<T>): Promise<void> {
    const documentRef = doc(this.collectionRef, id);
    const payload = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isDeleted: false,
      version: 1,
    } as any;
    
    await setDoc(documentRef, payload);
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    const documentRef = doc(this.collectionRef, id);
    const payload = {
      ...data,
      updatedAt: serverTimestamp(),
    } as any;
    
    await updateDoc(documentRef, payload);
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    const documentRef = doc(this.collectionRef, id);
    await updateDoc(documentRef, {
      isDeleted: true,
      updatedAt: serverTimestamp(),
      updatedBy: deletedBy,
      status: 'archived',
    } as any);
  }
}
