import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { getFirestore, doc, getDoc, updateDoc, deleteField } from '@react-native-firebase/firestore';
import { EcosystemUser } from '../models/Ecosystem';
import { CustomModal, ModalAction } from '../components/ui/CustomModal';
import { ArrowLeft, UserCheck, UserX, Shield } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import NotificationService from '../services/NotificationService';

export const UserManagementScreen = () => {
  const { user } = useAuthStore();
  const { colors, isDark } = useThemeColors();
  const styles = createStyles(colors, isDark);
  const navigation = useNavigation();

  const [ecosystemUsers, setEcosystemUsers] = useState<(EcosystemUser & { userId: string })[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    actions?: ModalAction[];
  }>({ visible: false, title: '', message: '' });

  const closeModal = () => setModalConfig(prev => ({ ...prev, visible: false }));

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    if (!user?.ecosystemCode) return;
    
    try {
      const db = getFirestore();
      const ecoRef = doc(db, 'ecosystems', user.ecosystemCode);
      const ecoSnap = await getDoc(ecoRef);
      const isExisting = typeof ecoSnap.exists === 'function' ? ecoSnap.exists() : ecoSnap.exists;

      if (isExisting) {
        const ecoData = ecoSnap.data();
        const usersMap = ecoData?.users || {};
        const usersArray: (EcosystemUser & { userId: string })[] = Object.entries(usersMap).map(([userId, data]) => ({
          ...(data as EcosystemUser),
          userId
        }));
        setEcosystemUsers(usersArray);
      }
    } catch (error) {
      console.error('Failed to fetch ecosystem users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (targetUserId: string, newRole: 'Admin' | 'User' | 'Remove') => {
    if (!user?.ecosystemCode || !user.isSuperAdmin) return;
    setLoading(true);
    try {
      if (newRole === 'Remove') {
        const db = getFirestore();
        const ecoRef = doc(db, 'ecosystems', user.ecosystemCode);
        
        // Remove from the map using FieldValue.delete() is tricky in map objects if we update a whole object. 
        // We can just fetch, remove the key, and set. Or in Firebase we can use FieldValue.delete(). 
        // But since we don't have it imported, we'll just set it to null or remove it by fetching.
        const ecoSnap = await getDoc(ecoRef);
        const data = ecoSnap.data();
        if (data && data.users) {
          const newUsers = { ...data.users };
          delete newUsers[targetUserId];
          await updateDoc(ecoRef, { users: newUsers });
        }

        // Also remove from user's global profile
        const targetUserObj = ecosystemUsers.find(u => u.userId === targetUserId);
        if (targetUserObj?.firebaseUid) {
          const userDocRef = doc(db, 'users', targetUserObj.firebaseUid);
          const userDoc = await getDoc(userDocRef);
          
          const isUserExisting = typeof userDoc.exists === 'function' ? userDoc.exists() : userDoc.exists;
          if (isUserExisting) {
            const userData = userDoc.data();
            const currentEcosystems = userData?.ecosystems || [];
            const newEcosystems = currentEcosystems.filter((eco: string) => eco !== user.ecosystemCode);
            
            let updatePayload: any = { ecosystems: newEcosystems };
            if (userData?.ecosystemCode === user.ecosystemCode) {
              updatePayload.ecosystemCode = newEcosystems.length > 0 ? newEcosystems[0] : deleteField();
            }
            await updateDoc(userDocRef, updatePayload);
          }
        }
      } else {
        const db = getFirestore();
        const ecoRef = doc(db, 'ecosystems', user.ecosystemCode);
        
        let updatePayload: any = {
          [`users.${targetUserId}.role`]: newRole
        };

        if (newRole === 'Admin') {
          const ecoSnap = await getDoc(ecoRef);
          const ecoData = ecoSnap.data();
          if (ecoData && ecoData.networks) {
            const allNetworkIds = Object.keys(ecoData.networks);
            updatePayload[`users.${targetUserId}.networks`] = allNetworkIds;
          }
        }

        await updateDoc(ecoRef, updatePayload);
      }
      
      await fetchUsers();

      // Send notification to the affected user
      let message = '';
      if (newRole === 'Remove') message = `You have been removed from ecosystem ${user.ecosystemCode}.`;
      else if (newRole === 'Admin') message = `You have been promoted to Admin in ecosystem ${user.ecosystemCode}.`;
      else if (newRole === 'User') message = `Your role has been updated to User in ecosystem ${user.ecosystemCode}.`;

      await NotificationService.notifyUserByAppUserId(targetUserId, {
        type: 'ROLE_UPDATE',
        title: 'Role Update',
        message: message,
        ecosystemId: user.ecosystemCode
      });

      setModalConfig({
        visible: true,
        title: newRole === 'Remove' ? 'User Removed' : 'Role Updated',
        message: newRole === 'Remove' ? 'User has been removed from ecosystem.' : `User has been updated to ${newRole}.`,
        actions: [{ label: 'OK', onPress: closeModal, variant: 'primary' }]
      });
    } catch (error: any) {
      setModalConfig({
        visible: true,
        title: 'Update Failed',
        message: error.message || 'Could not update user role.',
        actions: [{ label: 'OK', onPress: closeModal, variant: 'danger' }]
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmUpdateRole = (targetUser: EcosystemUser & { userId: string }, newRole: 'Admin' | 'User' | 'Remove') => {
    setModalConfig({
      visible: true,
      title: newRole === 'Remove' ? 'Confirm Removal' : 'Confirm Role Change',
      message: newRole === 'Remove' ? `Are you sure you want to remove ${targetUser.displayName} from the ecosystem?` : `Are you sure you want to change ${targetUser.displayName}'s role to ${newRole}?`,
      actions: [
        { label: 'Cancel', onPress: closeModal, variant: 'secondary' },
        { label: newRole === 'Remove' ? 'Remove' : 'Confirm', onPress: () => handleUpdateRole(targetUser.userId, newRole), variant: newRole === 'Remove' ? 'danger' : 'primary' }
      ]
    });
  };

  if (loading && ecosystemUsers.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Users</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Ecosystem: {user?.ecosystemCode}</Text>

        {ecosystemUsers.map((ecoUser, index) => (
          <View key={index} style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{ecoUser.displayName || 'Unknown User'}</Text>
              <Text style={styles.userRole}>{ecoUser.role}</Text>
            </View>

            {user?.isSuperAdmin && ecoUser.role !== 'SuperAdmin' && (
              <View style={styles.actionRow}>
                {ecoUser.role === 'User' ? (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => confirmUpdateRole(ecoUser, 'Admin')}
                  >
                    <Shield color={colors.primary} size={16} />
                    <Text style={styles.actionText}>Make Admin</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => confirmUpdateRole(ecoUser, 'User')}
                  >
                    <UserX color={colors.danger} size={16} />
                    <Text style={[styles.actionText, { color: colors.danger }]}>Demote</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => confirmUpdateRole(ecoUser, 'Remove')}
                >
                  <UserX color={colors.danger} size={16} />
                  <Text style={[styles.actionText, { color: colors.danger }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      <CustomModal
        visible={modalConfig.visible}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        actions={modalConfig.actions}
      />
    </View>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  scrollContent: {
    padding: 24,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 24,
  },
  userCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  userRole: {
    fontSize: 14,
    color: colors.text.secondary,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    gap: 16,
    justifyContent: 'flex-start',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  actionText: {
    color: colors.primary,
    fontWeight: '600',
  }
});
