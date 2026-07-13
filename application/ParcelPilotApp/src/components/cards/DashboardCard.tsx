import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const DashboardCard = () => {
  return (
    <View style={styles.container}>
      <Text>New Dashboard Card</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8 },
});
