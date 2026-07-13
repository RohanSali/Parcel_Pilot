import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const TaskCard = () => {
  return (
    <View style={styles.container}>
      <Text>TaskCard</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8 },
});
