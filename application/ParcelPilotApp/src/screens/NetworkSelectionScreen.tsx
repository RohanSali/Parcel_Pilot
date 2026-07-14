import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNetworkStore } from '../store/networkStore';
import { useAuthStore } from '../store/authStore';
import { Network } from '../models/Network';
import { colors } from '../theme';

export const NetworkSelectionScreen = () => {
  const { setActiveNetwork } = useNetworkStore();
  const { signOut } = useAuthStore();

  // Placeholder data - in a real app this would come from a query to Firestore
  // filtering networks where the user is a member.
  const mockNetworks: Network[] = [
    { networkId: 'net-1', name: 'Main Warehouse', superAdminId: 'sys', admins: [], createdAt: null, createdBy: null, updatedAt: null, updatedBy: null, isDeleted: false, status: 'active', version: 1 },
    { networkId: 'net-2', name: 'Test Facility', superAdminId: 'sys', admins: [], createdAt: null, createdBy: null, updatedAt: null, updatedBy: null, isDeleted: false, status: 'active', version: 1 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Network</Text>
      
      <FlatList
        data={mockNetworks}
        keyExtractor={(item) => item.networkId}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => setActiveNetwork(item)}
          >
            <Text style={styles.cardText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.dark.background,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
    marginBottom: 20,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.dark.surface,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  cardText: {
    fontSize: 18,
    color: colors.dark.text.primary,
  },
  logoutButton: {
    marginTop: 'auto',
    padding: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.dark.danger,
    fontSize: 16,
    fontWeight: 'bold',
  }
});
