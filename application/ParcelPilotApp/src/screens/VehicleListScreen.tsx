import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { useNetworkStore } from '../store/networkStore';

export const VehicleListScreen = () => {
  const { colors, isDark } = useThemeColors();
  const styles = createStyles(colors, isDark);
  const { activeNetwork } = useNetworkStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vehicles List</Text>
      <Text style={styles.subtitle}>
        Manage vehicles for {activeNetwork?.name || 'this network'}.
      </Text>
      
      <View style={styles.emptyState}>
        <Text style={{ color: colors.text.secondary, textAlign: 'center' }}>
          No vehicles registered in this network yet.
        </Text>
      </View>
    </View>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
