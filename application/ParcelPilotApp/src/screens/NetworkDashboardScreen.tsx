import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNetworkStore } from '../store/networkStore';
import { useThemeColors } from '../hooks/useThemeColors';

export const NetworkDashboardScreen = () => {
  const { activeNetwork } = useNetworkStore();
  const { colors, isDark } = useThemeColors();
  const styles = createStyles(colors, isDark);

  if (!activeNetwork) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text.secondary }}>No network selected.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{activeNetwork.name}</Text>
      <Text style={styles.subtitle}>Network Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Network Stats</Text>
        <Text style={{ color: colors.text.secondary, marginBottom: 8 }}>Active Vehicles: 0</Text>
        <Text style={{ color: colors.text.secondary }}>Pending Tasks: 0</Text>
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  }
});
