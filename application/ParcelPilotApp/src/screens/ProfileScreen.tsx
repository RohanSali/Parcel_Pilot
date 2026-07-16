import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { LogOut, User as UserIcon, ArrowLeft, Edit2, Link, Key, Shield } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { CustomModal, ModalAction } from '../components/ui/CustomModal';
import { AuthService } from '../services/auth/AuthService';
import { authRepository } from '../services/auth/AuthRepository';
import { updateProfile } from '@react-native-firebase/auth';

export const ProfileScreen = () => {
  const { user, updateUser, signOut, status } = useAuthStore();
  const navigation = useNavigation();
  const { colors, isDark } = useThemeColors();
  const styles = createStyles(colors, isDark);

  const [isGoogleLinked, setIsGoogleLinked] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);

  // Modals state
  const [editNameVisible, setEditNameVisible] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');

  const [setPwdVisible, setSetPwdVisible] = useState(false);
  const [changePwdVisible, setChangePwdVisible] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const checkProviders = useCallback(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      const providers = currentUser.providerData.map(p => p.providerId);
      setIsGoogleLinked(providers.includes('google.com'));
      setHasPassword(providers.includes('password'));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkProviders();
    }, [checkProviders])
  );

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Sign Out Failed', error.message || 'An error occurred.');
    }
  };

  const handleEditName = async () => {
    if (!newName.trim()) return;
    try {
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        await updateProfile(currentUser, { displayName: newName });
        if (user) {
          await authRepository.update(user.firebaseUid, { displayName: newName });
          updateUser({ displayName: newName });
        }
      }
      setEditNameVisible(false);
    } catch (error: any) {
      Alert.alert('Failed to update name', error.message);
    }
  };

  const handleLinkGoogle = async () => {
    try {
      await AuthService.linkWithGoogle();
      checkProviders();
      Alert.alert('Success', 'Google account linked successfully!');
    } catch (error: any) {
      Alert.alert('Link Failed', error.message);
    }
  };

  const handleSetPassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match or are empty.');
      return;
    }
    try {
      await AuthService.setNewPassword(newPassword);
      setSetPwdVisible(false);
      setNewPassword('');
      setConfirmPassword('');
      checkProviders();
      Alert.alert('Success', 'Password has been set successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      Alert.alert('Error', 'Please fill all fields and ensure new passwords match.');
      return;
    }
    try {
      await AuthService.changeExistingPassword(currentPassword, newPassword);
      setChangePwdVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password has been changed successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const loading = status === 'loading';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <View style={styles.avatarContainer}>
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <UserIcon color={colors.text.inverse} size={48} />
          </View>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
          <Text style={styles.displayName}>{user?.displayName || 'Parcel Pilot User'}</Text>
          <TouchableOpacity onPress={() => setEditNameVisible(true)}>
            <Edit2 color={colors.primary} size={18} />
          </TouchableOpacity>
        </View>

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
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Ecosystem Join Code</Text>
            <Text style={styles.infoValue}>{user.ecosystemCode || 'Not Generated'}</Text>
          </View>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Account Security</Text>

        <View style={styles.securityRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[styles.iconBox, { backgroundColor: isGoogleLinked ? 'rgba(52, 199, 89, 0.1)' : 'rgba(10, 132, 255, 0.1)' }]}>
              <Link color={isGoogleLinked ? colors.success : colors.primary} size={20} />
            </View>
            <View>
              <Text style={{ color: colors.text.primary, fontWeight: 'bold' }}>Google Account</Text>
              <Text style={{ color: colors.text.secondary, fontSize: 12 }}>{isGoogleLinked ? 'Linked' : 'Not Linked'}</Text>
            </View>
          </View>
          {!isGoogleLinked && (
            <TouchableOpacity style={styles.smallButton} onPress={handleLinkGoogle}>
              <Text style={styles.smallButtonText}>Link</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.securityRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[styles.iconBox, { backgroundColor: hasPassword ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 160, 0, 0.1)' }]}>
              <Key color={hasPassword ? colors.success : colors.warning} size={20} />
            </View>
            <View>
              <Text style={{ color: colors.text.primary, fontWeight: 'bold' }}>Password</Text>
              <Text style={{ color: colors.text.secondary, fontSize: 12 }}>{hasPassword ? 'Set' : 'Not Set'}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => hasPassword ? setChangePwdVisible(true) : setSetPwdVisible(true)}
          >
            <Text style={styles.smallButtonText}>{hasPassword ? 'Change' : 'Set'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} disabled={loading}>
        <LogOut color={colors.danger} size={20} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

      {/* Edit Name Modal */}
      <CustomModal
        visible={editNameVisible}
        onClose={() => setEditNameVisible(false)}
        title="Edit Profile"
        message="Enter your new display name:"
        customContent={
          <TextInput
            style={[styles.input, { marginTop: 12, width: '100%' }]}
            placeholder="Display Name"
            placeholderTextColor={colors.text.secondary}
            value={newName}
            onChangeText={setNewName}
            autoFocus
          />
        }
        actions={[
          { label: 'Cancel', onPress: () => setEditNameVisible(false), variant: 'secondary' },
          { label: 'Save', onPress: handleEditName, variant: 'primary' }
        ]}
      />

      {/* Set Password Modal */}
      <CustomModal
        visible={setPwdVisible}
        onClose={() => setSetPwdVisible(false)}
        title="Set Password"
        message="Create a password so you can log in with email and password."
        customContent={
          <View style={{ width: '100%', marginTop: 12 }}>
            <TextInput
              style={[styles.input, { marginBottom: 12 }]}
              placeholder="New Password"
              placeholderTextColor={colors.text.secondary}
              secureTextEntry
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={colors.text.secondary}
              secureTextEntry
              onChangeText={setConfirmPassword}
            />
          </View>
        }
        actions={[
          { label: 'Cancel', onPress: () => setSetPwdVisible(false), variant: 'secondary' },
          { label: 'Set Password', onPress: handleSetPassword, variant: 'primary' }
        ]}
      />

      {/* Change Password Modal */}
      <CustomModal
        visible={changePwdVisible}
        onClose={() => setChangePwdVisible(false)}
        title="Change Password"
        message="Enter your current password and a new one."
        customContent={
          <View style={{ width: '100%', marginTop: 12 }}>
            <TextInput
              style={[styles.input, { marginBottom: 12 }]}
              placeholder="Current Password"
              placeholderTextColor={colors.text.secondary}
              secureTextEntry
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={[styles.input, { marginBottom: 12 }]}
              placeholder="New Password"
              placeholderTextColor={colors.text.secondary}
              secureTextEntry
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              placeholderTextColor={colors.text.secondary}
              secureTextEntry
              onChangeText={setConfirmPassword}
            />
          </View>
        }
        actions={[
          { label: 'Cancel', onPress: () => setChangePwdVisible(false), variant: 'secondary' },
          { label: 'Change Password', onPress: handleChangePassword, variant: 'primary' }
        ]}
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
    paddingTop: require('react-native').Dimensions.get('window').width > 768 ? 20 : 50,
  },
  backButton: {
    marginRight: 16,
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
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  displayName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
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
    marginBottom: 24,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: 16,
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
  securityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallButton: {
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  smallButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
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
  input: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text.primary,
    fontSize: 16,
  }
});
