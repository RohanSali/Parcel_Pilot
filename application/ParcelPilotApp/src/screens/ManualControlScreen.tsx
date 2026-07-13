import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ManualControlScreen = () => {
  return (
    <View style={styles.container}>
      <Text>ManualControl Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
