import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';

export const SplashScreen = () => {
  const { colors, isDark } = useThemeColors();
  const styles = createStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parcel Pilot</Text>
      <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      <Text style={styles.subtitle}>Restoring Session...</Text>
    </View>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: colors.background 
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  loader: {
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  }
});
