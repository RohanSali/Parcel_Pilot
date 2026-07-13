import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const PriorityBadge = () => {
  return (
    <View style={styles.container}>
      <Text>PriorityBadge</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8 },
});
