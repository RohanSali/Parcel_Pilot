import { getFirestore, collection, query, where, getDocs, addDoc, getDoc, doc } from '@react-native-firebase/firestore';

export type NotificationData = {
  type: string;
  title: string;
  message: string;
  ecosystemId?: string;
  networkId?: string;
  [key: string]: any;
};

class NotificationService {
  /**
   * Sends a notification directly to a user's firebaseUid.
   */
  static async notifyUserByFirebaseUid(firebaseUid: string, data: NotificationData) {
    try {
      const db = getFirestore();
      const notifsRef = collection(db, 'users', firebaseUid, 'notifications');
      
      await addDoc(notifsRef, {
        ...data,
        createdAt: Date.now(),
        read: false
      });
    } catch (error) {
      console.error('Failed to notify user by Firebase UID:', error);
    }
  }

  /**
   * Resolves an app userId (e.g. "@johndoe") to a firebaseUid and sends a notification.
   */
  static async notifyUserByAppUserId(appUserId: string, data: NotificationData) {
    try {
      const db = getFirestore();
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('userId', '==', appUserId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const firebaseUid = querySnapshot.docs[0].id;
        await this.notifyUserByFirebaseUid(firebaseUid, data);
      } else {
        console.warn(`Could not find firebaseUid for app userId: ${appUserId}`);
      }
    } catch (error) {
      console.error('Failed to notify user by App User ID:', error);
    }
  }

  /**
   * Scans an ecosystem's users map, resolves admins/superadmins, and broadcasts a notification to them.
   */
  static async notifyEcosystemAdmins(ecosystemId: string, data: NotificationData, onlySuperAdmins: boolean = false) {
    try {
      const db = getFirestore();
      const ecoRef = doc(db, 'ecosystems', ecosystemId);
      const ecoSnap = await getDoc(ecoRef);
      
      const isExisting = typeof ecoSnap.exists === 'function' ? ecoSnap.exists() : ecoSnap.exists;
      if (isExisting) {
        const ecoData = ecoSnap.data();
        if (ecoData && ecoData.users) {
          const adminsToNotify: string[] = [];
          
          Object.keys(ecoData.users).forEach((appUserId) => {
            const role = ecoData.users[appUserId].role;
            if (role === 'SuperAdmin' || (!onlySuperAdmins && role === 'Admin')) {
              adminsToNotify.push(appUserId);
            }
          });

          // Send notifications concurrently
          await Promise.all(
            adminsToNotify.map(appUserId => this.notifyUserByAppUserId(appUserId, data))
          );
        }
      }
    } catch (error) {
      console.error('Failed to notify ecosystem admins:', error);
    }
  }
}

export default NotificationService;
