import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { useAuthStore } from '../store/authStore';
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs, deleteDoc } from '@react-native-firebase/firestore';
import { UserNotification } from '../models/User';
import { Check, X, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import NotificationService from '../services/NotificationService';

export const NotificationsScreen = () => {
  const { user } = useAuthStore();
  const { colors, isDark } = useThemeColors();
  const styles = createStyles(colors, isDark);
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user?.firebaseUid) return;
    try {
      const db = getFirestore();
      const notifsRef = collection(db, 'users', user.firebaseUid, 'notifications');
      const snap = await getDocs(notifsRef);
      const fetched: UserNotification[] = [];
      snap.forEach(docSnap => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as UserNotification);
      });
      fetched.sort((a, b) => b.createdAt - a.createdAt);
      setNotifications(fetched);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = async () => {
    if (!user?.firebaseUid) return;
    try {
      const db = getFirestore();
      for (const notif of notifications) {
        await deleteDoc(doc(db, 'users', user.firebaseUid, 'notifications', notif.id));
      }
      setNotifications([]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDismiss = async (notifId: string) => {
    if (!user?.firebaseUid) return;
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, 'users', user.firebaseUid, 'notifications', notifId));
      setNotifications(prev => prev.filter(n => n.id !== notifId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAcceptInvite = async (notif: UserNotification) => {
    if (!user?.firebaseUid || !notif.ecosystemId || !notif.networkId) return;
    setLoading(true);
    try {
      const db = getFirestore();

      const ecoRef = doc(db, 'ecosystems', notif.ecosystemId);
      const ecoSnap = await getDoc(ecoRef);
      const isExisting = typeof ecoSnap.exists === 'function' ? ecoSnap.exists() : ecoSnap.exists;
      if (isExisting) {
        const usersMap = ecoSnap.data()?.users || {};
        const myEcoUser = usersMap[user.userId];
        if (myEcoUser) {
          const currentNetworks = myEcoUser.networks || [];
          if (!currentNetworks.includes(notif.networkId)) {
            await updateDoc(ecoRef, {
              [`users.${user.userId}.networks`]: [...currentNetworks, notif.networkId]
            });

            // Add user to the network chat allowedUids
            const { arrayUnion } = require('@react-native-firebase/firestore');
            const chatRef = doc(db, 'networkChats', notif.networkId);
            await updateDoc(chatRef, {
              allowedUids: arrayUnion(user.firebaseUid)
            });

            // Need to get network name from ecoSnap or just use networkId.
            // Wait, ecosystems/{ecoId} contains a 'networks' map. Let's get the name.
            const networksMap = ecoSnap.data()?.networks || {};
            const netName = networksMap[notif.networkId]?.name || 'a network';

            await NotificationService.notifyEcosystemAdmins(notif.ecosystemId, {
              type: 'NETWORK_JOIN',
              title: 'Network Update',
              message: `${user.displayName || 'A user'} accepted the invitation and joined ${netName}.`
            }, false);
          }
        }
      }

      await handleDismiss(notif.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color={colors.text.primary} size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
        </View>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearAll} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>You have no new notifications.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.notificationCard}>
              <View style={styles.header}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.message}>{item.message}</Text>

              {item.type === 'NETWORK_INVITE' && (
                <View style={styles.inviteActions}>
                  <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptInvite(item)}>
                    <Check color={colors.success} size={16} />
                    <Text style={styles.acceptText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.declineButton} onPress={() => handleDismiss(item.id)}>
                    <X color={colors.danger} size={16} />
                    <Text style={styles.declineText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    paddingTop: require('react-native').Dimensions.get('window').width > 768 ? 20 : 50,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  clearButton: {
    padding: 8,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  clearButtonText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: 'bold',
  },
  list: {
    gap: 12,
  },
  notificationCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  date: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  message: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  acceptText: {
    color: colors.success,
    fontWeight: 'bold',
  },
  declineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  declineText: {
    color: colors.danger,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: 16,
  }
});
