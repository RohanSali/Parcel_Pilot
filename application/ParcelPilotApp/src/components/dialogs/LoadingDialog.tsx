import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const LoadingDialog = () => {
  return (
    <View style={styles.container}>
      <Text>LoadingDialog</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8 },
});
