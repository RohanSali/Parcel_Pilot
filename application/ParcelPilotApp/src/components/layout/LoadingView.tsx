import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const LoadingView = () => {
  return (
    <View style={styles.container}>
      <Text>LoadingView</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8 },
});
