import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const AppTextField = () => {
  return (
    <View style={styles.container}>
      <Text>AppTextField</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8 },
});
