import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const BroadcastMessagingScreen = () => {
  return (
    <View style={styles.container}>
      <Text>BroadcastMessaging Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
