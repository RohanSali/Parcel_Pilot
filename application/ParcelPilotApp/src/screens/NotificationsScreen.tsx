import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { useNotificationStore } from '../store/notificationStore';

export const NotificationsScreen = () => {
  const { notifications, clearAll, addNotification } = useNotificationStore();
  const { colors, isDark } = useThemeColors();
  const styles = createStyles(colors, isDark);

  // For demonstration, populate some mock data if empty on first mount
  useEffect(() => {
    if (notifications.length === 0) {
      addNotification({ title: 'Welcome!', message: 'This is the new notifications center.', type: 'System' });
      addNotification({ title: 'Network Update', message: 'New features are available.', type: 'Alert' });
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearAll} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>You have no new notifications.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.notificationCard}>
              <View style={styles.header}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.date}>{item.date}</Text>
              </View>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.badge}>{item.type}</Text>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
    padding: 20,
    paddingTop: 60,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  clearButton: {
    padding: 8,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  clearButtonText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: 'bold',
  },
  list: {
    gap: 12,
  },
  notificationCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  date: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  message: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.05)',
    color: colors.text.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    overflow: 'hidden',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: 16,
  }
});
