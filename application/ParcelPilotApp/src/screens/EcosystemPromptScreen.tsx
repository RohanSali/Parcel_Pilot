import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { authRepository } from '../services/auth/AuthRepository';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { CustomModal, ModalAction } from '../components/ui/CustomModal';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from '@react-native-firebase/firestore';

export const EcosystemPromptScreen = () => {
  const { user, completeEcosystemSetup, updateUser, signOut } = useAuthStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors, isDark } = useThemeColors();
  const styles = createStyles(colors, isDark);

  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    actions?: ModalAction[];
  }>({ visible: false, title: '', message: '' });

  const closeModal = () => setModalConfig(prev => ({ ...prev, visible: false }));

  const generateEcosystemCode = () => {
    // Generate a 6-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setModalConfig({
        visible: true,
        title: 'Missing Code',
        message: 'Please enter a code or skip.',
        actions: [{ label: 'OK', onPress: () => {}, variant: 'primary' }]
      });
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      const db = getFirestore();

      try {
        const myDocRef = doc(db, 'users', user.firebaseUid);
        await getDoc(myDocRef);
      } catch (debugErr: any) {
        setModalConfig({
          visible: true,
          title: 'Auth Error',
          message: 'Could not read your own user document. Your session is invalid. Please sign out and log in again.',
          actions: [{ label: 'OK', onPress: closeModal, variant: 'danger' }]
        });
        setLoading(false);
        return;
      }

      if (code.length > 10) {
        const secretDocRef = doc(db, 'superAdminCreation', 'Codes');
        const secretDoc = await getDoc(secretDocRef);
        const exists = typeof secretDoc.exists === 'function' ? secretDoc.exists() : secretDoc.exists;

        if (exists) {
          const validCodes: string[] = secretDoc.data()?.validCodes || [];
          if (validCodes.includes(code)) {
            const newEcosystemCode = generateEcosystemCode();

            await authRepository.update(user.firebaseUid, {
              isSuperAdmin: true,
              ecosystemCode: newEcosystemCode,
            });

            updateUser({ isSuperAdmin: true, ecosystemCode: newEcosystemCode });

            setModalConfig({
              visible: true,
              title: 'Success',
              message: 'You are now a SuperAdmin!',
              actions: [{ label: 'OK', onPress: () => completeEcosystemSetup(), variant: 'primary' }]
            });
            return;
          }
        }

        setModalConfig({
          visible: true,
          title: 'Invalid Code',
          message: 'The SuperAdmin code entered is not valid.',
          actions: [{ label: 'OK', onPress: closeModal, variant: 'danger' }]
        });
      } else {
        const newEcosystems = [...(user.ecosystems || []), code];
        await authRepository.update(user.firebaseUid, {
          ecosystems: newEcosystems
        });

        updateUser({ ecosystems: newEcosystems });

        setModalConfig({
          visible: true,
          title: 'Success',
          message: 'You have joined the ecosystem!',
          actions: [{ label: 'OK', onPress: () => completeEcosystemSetup(), variant: 'primary' }]
        });
      }
    } catch (error: any) {
      setModalConfig({
        visible: true,
        title: 'Error',
        message: error.message || 'An unexpected error occurred.',
        actions: [{ label: 'OK', onPress: closeModal, variant: 'danger' }]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    completeEcosystemSetup();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Join an Ecosystem</Text>
        <Text style={styles.subtitle}>Enter an Ecosystem Code provided by your SuperAdmin, or enter your setup code if you are an administrator.</Text>

        <TextInput
          style={styles.input}
          placeholder="Ecosystem Code"
          placeholderTextColor={colors.text.secondary}
          autoCapitalize="characters"
          value={code}
          onChangeText={setCode}
          editable={!loading}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Processing...' : 'Submit Code'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleSkip}
          disabled={loading}
        >
          <Text style={styles.linkText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
      <CustomModal
        visible={modalConfig.visible}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        actions={modalConfig.actions}
      />
    </KeyboardAvoidingView>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  input: {
    width: '100%',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.05)',
    color: colors.text.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    padding: 12,
  },
  linkText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
