import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const OutlinedButton = () => {
  return (
    <View style={styles.container}>
      <Text>OutlinedButton</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8 },
});
