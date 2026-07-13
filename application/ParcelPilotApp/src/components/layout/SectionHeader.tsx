import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const SectionHeader = () => {
  return (
    <View style={styles.container}>
      <Text>SectionHeader</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8 },
});
