import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme';

export const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parcel Pilot</Text>
      <ActivityIndicator size="large" color={colors.dark.primary} style={styles.loader} />
      <Text style={styles.subtitle}>Restoring Session...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: colors.dark.background 
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  loader: {
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 16,
    color: colors.dark.text.secondary,
  }
});
