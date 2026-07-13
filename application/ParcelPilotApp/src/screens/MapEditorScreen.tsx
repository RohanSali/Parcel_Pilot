import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const MapEditorScreen = () => {
  return (
    <View style={styles.container}>
      <Text>MapEditor Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
