import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useNetworkStore } from '../store/networkStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { Plus, Users, Key, LogIn, CheckCircle } from 'lucide-react-native';
import { Network } from '../models/Network';
import { CustomModal, ModalAction } from '../components/ui/CustomModal';

export const DashboardScreen = () => {
  const { user } = useAuthStore();
  const { activeNetwork, setActiveNetwork } = useNetworkStore();
  const [joinCode, setJoinCode] = useState('');
  const { colors, isDark } = useThemeColors();
  const styles = createStyles(colors, isDark);

  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    actions?: ModalAction[];
  }>({ visible: false, title: '', message: '' });

  const showModal = (title: string, message: string, actions?: ModalAction[]) => {
    setModalConfig({
      visible: true,
      title,
      message,
      actions: actions || [{ label: 'OK', onPress: () => {}, variant: 'primary' }]
    });
  };

  const closeModal = () => setModalConfig(prev => ({ ...prev, visible: false }));

  // Placeholder function
  const handleJoinNetwork = () => {
    if (!joinCode) return;
    showModal('Join Network', `Attempting to join network with code: ${joinCode}`);
  };

  const handleCreateNetwork = () => {
    showModal('Create Network', 'Network creation flow will launch here.');
  };

  const handleGenerateJoinCode = () => {
    showModal('Generated Code', 'A 5-minute joining code has been generated: XYZ123');
  };

  const handleInviteUser = () => {
    showModal('Invite User', 'User invitation modal will launch here.');
  };

  // Mock list of networks the user belongs to
  const myNetworks: Network[] = []; 

  const isEcosystemAdmin = user?.isAdmin || user?.isSuperAdmin;

  if (!activeNetwork) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Welcome, {user?.displayName || 'Pilot'}</Text>
        <Text style={styles.subtitle}>You are not currently in an active network.</Text>

        {isEcosystemAdmin && (
          <View style={styles.adminCard}>
            <Text style={styles.cardTitle}>Ecosystem Admin Controls</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleCreateNetwork}>
              <Plus color={colors.text.inverse} size={20} />
              <Text style={styles.primaryButtonText}>Create New Network</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Join a Network</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Enter 5-digit Join Code"
              placeholderTextColor={colors.text.secondary}
              value={joinCode}
              onChangeText={setJoinCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.secondaryButton} onPress={handleJoinNetwork}>
              <LogIn color={colors.primary} size={20} />
              <Text style={styles.secondaryButtonText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>

        {myNetworks.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Networks</Text>
            {myNetworks.map((net) => (
              <TouchableOpacity key={net.networkId} style={styles.networkItem} onPress={() => setActiveNetwork(net)}>
                <Text style={styles.networkItemText}>{net.name}</Text>
                <CheckCircle color={colors.success} size={20} />
              </TouchableOpacity>
            ))}
          </View>
        )}
        <CustomModal
          visible={modalConfig.visible}
          onClose={closeModal}
          title={modalConfig.title}
          message={modalConfig.message}
          actions={modalConfig.actions}
        />
      </ScrollView>
    );
  }

  // Active Network View
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{activeNetwork.name}</Text>
      <Text style={styles.subtitle}>Dashboard Overview</Text>

      {/* Admin Controls within a Network */}
      {isEcosystemAdmin && (
        <View style={styles.adminCard}>
          <Text style={styles.cardTitle}>Network Administration</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.actionButton} onPress={handleGenerateJoinCode}>
              <Key color={colors.text.primary} size={20} />
              <Text style={styles.actionButtonText}>Generate 5-min Code</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleInviteUser}>
              <Users color={colors.text.primary} size={20} />
              <Text style={styles.actionButtonText}>Invite via UUID</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Normal Dashboard Widgets go here */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Network Stats</Text>
        <Text style={{ color: colors.text.secondary }}>Active Vehicles: 0</Text>
        <Text style={{ color: colors.text.secondary }}>Pending Tasks: 0</Text>
      </View>
      <CustomModal
        visible={modalConfig.visible}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        actions={modalConfig.actions}
      />
    </ScrollView>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 60,
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 32,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  adminCard: {
    backgroundColor: 'rgba(255, 160, 0, 0.1)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 0, 0.3)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    color: colors.text.inverse,
    fontWeight: 'bold',
    fontSize: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: colors.text.primary,
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  networkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  networkItemText: {
    color: colors.text.primary,
    fontSize: 16,
  },
});
