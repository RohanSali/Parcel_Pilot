import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const CallVehicleScreen = () => {
  return (
    <View style={styles.container}>
      <Text>CallVehicle Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
