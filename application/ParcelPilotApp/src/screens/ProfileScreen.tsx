import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { LogOut, User as UserIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { CustomModal, ModalAction } from '../components/ui/CustomModal';

export const ProfileScreen = () => {
  const { user, signOut, status } = useAuthStore();
  const navigation = useNavigation();
  const { colors, isDark } = useThemeColors();
  const styles = createStyles(colors, isDark);

  const [modalConfig, setModalConfig] = React.useState<{
    visible: boolean;
    title: string;
    message: string;
    actions?: ModalAction[];
  }>({ visible: false, title: '', message: '' });

  const closeModal = () => setModalConfig(prev => ({ ...prev, visible: false }));

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      setModalConfig({
        visible: true,
        title: 'Sign Out Failed',
        message: error.message || 'An error occurred.',
        actions: [{ label: 'OK', onPress: () => {}, variant: 'primary' }]
      });
    }
  };

  const loading = status === 'loading';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <View style={styles.avatarContainer}>
        <View style={styles.avatarPlaceholder}>
          <UserIcon color={colors.text.inverse} size={48} />
        </View>
        <Text style={styles.displayName}>{user?.displayName || 'Parcel Pilot User'}</Text>
        {user?.isSuperAdmin && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Super Admin</Text>
          </View>
        )}
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>User ID</Text>
          <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
            {user?.userId || 'N/A'}
          </Text>
        </View>
        {user?.isSuperAdmin && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ecosystem Join Code</Text>
            <Text style={styles.infoValue}>{user.ecosystemCode || 'Not Generated'}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.signOutButton} 
        onPress={handleSignOut}
        disabled={loading}
      >
        <LogOut color={colors.danger} size={20} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

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
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    marginRight: 16,
  },
  backText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  displayName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 40,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 2,
    textAlign: 'right',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  signOutText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});
