import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useNetworkStore } from '../store/networkStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Plus, Users, Key, LogIn, CheckCircle, Bell, Settings as SettingsIcon } from 'lucide-react-native';
import { Network } from '../models/Network';
import { CustomModal, ModalAction } from '../components/ui/CustomModal';
import { NotificationBell } from '../components/ui/NotificationBell';

export const DashboardScreen = () => {
  const { user } = useAuthStore();
  const { colors, isDark } = useThemeColors();
  const styles = createStyles(colors, isDark);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const isSuperAdmin = user?.isSuperAdmin;

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Parcel Pilot</Text>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <NotificationBell onPress={() => navigation.navigate('Notifications')} color={colors.text.primary} size={24} />
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <SettingsIcon color={colors.text.primary} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Welcome, {user?.displayName || 'Pilot'}</Text>
        <Text style={styles.subtitle}>Dashboard Overview</Text>

        {isSuperAdmin && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Manage Users</Text>
            <Text style={{ color: colors.text.secondary, marginBottom: 16 }}>Manage ecosystem users, roles, and access control.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('UserManagement')}>
              <Users color={colors.text.inverse} size={20} />
              <Text style={styles.primaryButtonText}>Manage Users</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Networks</Text>
          <Text style={{ color: colors.text.secondary, marginBottom: 16 }}>Create, join, and manage networks within this ecosystem.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('ManageNetworks')}>
            <Key color={colors.text.inverse} size={20} />
            <Text style={styles.primaryButtonText}>Enter Networks Hub</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: require('react-native').Dimensions.get('window').width > 768 ? 20 : 50,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  container: {
    padding: 24,
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
