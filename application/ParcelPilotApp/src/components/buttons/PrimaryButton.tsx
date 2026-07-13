import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const PrimaryButton = () => {
  return (
    <View style={styles.container}>
      <Text>PrimaryButton</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8 },
});
