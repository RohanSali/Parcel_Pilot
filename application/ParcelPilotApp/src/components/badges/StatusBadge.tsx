import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const StatusBadge = () => {
  return (
    <View style={styles.container}>
      <Text>StatusBadge</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8 },
});
