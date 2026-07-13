import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const PageHeader = () => {
  return (
    <View style={styles.container}>
      <Text>PageHeader</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8 },
});
