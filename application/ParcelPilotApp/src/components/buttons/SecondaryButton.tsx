import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const SecondaryButton = () => {
  return (
    <View style={styles.container}>
      <Text>SecondaryButton</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8 },
});
