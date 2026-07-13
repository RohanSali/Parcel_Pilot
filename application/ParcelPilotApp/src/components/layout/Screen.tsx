import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Screen = () => {
  return (
    <View style={styles.container}>
      <Text>Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8 },
});
