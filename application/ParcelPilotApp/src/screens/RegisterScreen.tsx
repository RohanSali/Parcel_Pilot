import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export const RegisterScreen = () => {
  const { registerWithEmail, status } = useAuthStore();
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: 'transparent' });
  const { colors, isDark } = useThemeColors();
  const styles = createStyles(colors, isDark);

  const loading = status === 'loading';

  // Evaluate Password Strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, label: '', color: 'transparent' });
      return;
    }

    let score = 0;
    if (password.length > 6) score += 1;
    if (password.length > 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) {
      setPasswordStrength({ score, label: 'Weak', color: '#ef4444' }); // red-500
    } else if (score <= 4) {
      setPasswordStrength({ score, label: 'Medium', color: '#eab308' }); // yellow-500
    } else {
      setPasswordStrength({ score, label: 'Strong', color: '#22c55e' }); // green-500
    }
  }, [password]);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Passwords Mismatch', 'Your passwords do not match.');
      return;
    }

    if (passwordStrength.score <= 2) {
      Alert.alert('Weak Password', 'Please choose a stronger password before continuing.');
      return;
    }

    try {
      await registerWithEmail(email, password);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to join Parcel Pilot</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.text.secondary}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.text.secondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        {password.length > 0 && (
          <View style={styles.strengthContainer}>
            <View style={styles.strengthBars}>
              <View style={[styles.bar, passwordStrength.score >= 1 ? { backgroundColor: passwordStrength.color } : null]} />
              <View style={[styles.bar, passwordStrength.score >= 3 ? { backgroundColor: passwordStrength.color } : null]} />
              <View style={[styles.bar, passwordStrength.score >= 5 ? { backgroundColor: passwordStrength.color } : null]} />
            </View>
            <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
              {passwordStrength.label}
            </Text>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor={colors.text.secondary}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!loading}
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton} 
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
        >
          <Text style={styles.linkText}>Already have an account? Log In</Text>
        </TouchableOpacity>
      </View>
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
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 40,
  },
  input: {
    width: '100%',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.05)',
    color: colors.text.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  strengthContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: -8, // pull closer to password input
    paddingHorizontal: 4,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
    marginRight: 16,
  },
  bar: {
    flex: 1,
    height: 4,
    backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 50,
    textAlign: 'right',
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
    padding: 8,
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
