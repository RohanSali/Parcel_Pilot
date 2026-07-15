import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { getFirestore, doc, getDoc, updateDoc, deleteField } from '@react-native-firebase/firestore';
import { authRepository } from '../services/auth/AuthRepository';
import { ArrowLeft, Layers, LogOut, Plus } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { CustomModal, ModalAction } from '../components/ui/CustomModal';

type EcosystemRoleInfo = {
  ecoId: string;
  role: string;
  ownerName: string;
};

export const EcosystemsScreen = () => {
  const { user, updateUser, triggerEcosystemPrompt } = useAuthStore();
  const { colors, isDark } = useThemeColors();
  const styles = createStyles(colors, isDark);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [ecosystems, setEcosystems] = useState<EcosystemRoleInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    actions?: ModalAction[];
  }>({ visible: false, title: '', message: '' });

  const closeModal = () => setModalConfig(prev => ({ ...prev, visible: false }));

  useFocusEffect(
    useCallback(() => {
      fetchEcosystems();
    }, [user?.ecosystems])
  );

  const fetchEcosystems = async () => {
    if (!user?.ecosystems || user.ecosystems.length === 0) {
      setEcosystems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const db = getFirestore();
      const fetched: EcosystemRoleInfo[] = [];

      for (const ecoId of user.ecosystems) {
        const ecoRef = doc(db, 'ecosystems', ecoId);
        const ecoSnap = await getDoc(ecoRef);
        
        const isExisting = typeof ecoSnap.exists === 'function' ? ecoSnap.exists() : ecoSnap.exists;
        if (isExisting) {
          const data = ecoSnap.data();
          const role = data?.users?.[user.userId]?.role || 'Unknown';
          fetched.push({
            ecoId,
            role,
            ownerName: data?.ownerName || 'Unknown Owner'
          });
        }
      }
      setEcosystems(fetched);
    } catch (error) {
      console.error('Failed to fetch user ecosystems', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmLeave = (ecoId: string) => {
    setModalConfig({
      visible: true,
      title: 'Leave Ecosystem',
      message: `Are you sure you want to leave the ecosystem "${ecoId}"? You will lose access to all its networks.`,
      actions: [
        { label: 'Cancel', onPress: closeModal, variant: 'secondary' },
        { label: 'Leave', onPress: () => handleLeave(ecoId), variant: 'danger' }
      ]
    });
  };

  const handleLeave = async (ecoId: string) => {
    if (!user) return;
    closeModal();
    setLoading(true);
    
    try {
      const db = getFirestore();
      
      // 1. Remove from User's global array
      const newEcosystems = user.ecosystems.filter(e => e !== ecoId);
      
      // If they leave their active ecosystem, switch active ecosystem to another one if available
      let newEcosystemCode: any = user.ecosystemCode;
      if (user.ecosystemCode === ecoId) {
        newEcosystemCode = newEcosystems.length > 0 ? newEcosystems[0] : deleteField();
      }

      await authRepository.update(user.firebaseUid, {
        ecosystems: newEcosystems,
        ...(user.ecosystemCode === ecoId ? { ecosystemCode: newEcosystemCode } : {})
      });
      
      // 2. Remove from Ecosystem doc
      const ecoRef = doc(db, 'ecosystems', ecoId);
      const ecoSnap = await getDoc(ecoRef);
      const data = ecoSnap.data();
      if (data && data.users && data.users[user.userId]) {
        const newUsers = { ...data.users };
        delete newUsers[user.userId];
        await updateDoc(ecoRef, { users: newUsers });
      }

      // Update local state
      updateUser({ ecosystems: newEcosystems, ecosystemCode: user.ecosystemCode === ecoId ? (newEcosystems.length > 0 ? newEcosystems[0] : undefined) : user.ecosystemCode });
      
    } catch (error: any) {
      setModalConfig({
        visible: true,
        title: 'Error',
        message: error.message || 'Could not leave ecosystem.',
        actions: [{ label: 'OK', onPress: closeModal, variant: 'primary' }]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && ecosystems.length === 0) {
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
        <Text style={styles.headerTitle}>My Ecosystems</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <TouchableOpacity 
          style={styles.joinButton} 
          onPress={() => triggerEcosystemPrompt()}
        >
          <Plus color={colors.text.inverse} size={24} />
          <Text style={styles.joinButtonText}>Join New Ecosystem</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Joined Ecosystems</Text>

        {ecosystems.length === 0 && (
          <Text style={styles.emptyText}>You are not part of any ecosystems yet.</Text>
        )}

        {ecosystems.map((eco) => {
          const isSuperAdmin = eco.role === 'SuperAdmin';

          return (
            <View key={eco.ecoId} style={styles.card}>
              <View style={styles.cardInfo}>
                <Layers color={colors.primary} size={24} style={{ marginRight: 16 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.ecoId}>{eco.ecoId}</Text>
                  <Text style={styles.ecoDetails}>Owner: {eco.ownerName}</Text>
                  <Text style={styles.ecoRole}>Role: {eco.role}</Text>
                </View>
              </View>

              {!isSuperAdmin ? (
                <TouchableOpacity 
                  style={styles.leaveButton}
                  onPress={() => confirmLeave(eco.ecoId)}
                >
                  <LogOut color={colors.danger} size={20} />
                  <Text style={styles.leaveButtonText}>Leave</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.ownerBadge}>
                  <Text style={styles.ownerBadgeText}>Owner</Text>
                </View>
              )}
            </View>
          );
        })}

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
  joinButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    gap: 8,
  },
  joinButtonText: {
    color: colors.text.inverse,
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'column',
    gap: 16,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ecoId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  ecoDetails: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  ecoRole: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,59,48,0.1)',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  leaveButtonText: {
    color: colors.danger,
    fontWeight: 'bold',
    fontSize: 16,
  },
  ownerBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52,199,89,0.1)',
    paddingVertical: 12,
    borderRadius: 8,
  },
  ownerBadgeText: {
    color: colors.success,
    fontWeight: 'bold',
    fontSize: 16,
  }
});
