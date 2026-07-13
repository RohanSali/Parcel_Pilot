import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const MapViewerScreen = () => {
  return (
    <View style={styles.container}>
      <Text>MapViewer Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
