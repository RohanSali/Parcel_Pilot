import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useAuthStore } from '../../store/authStore';
import { getFirestore, collection, onSnapshot } from '@react-native-firebase/firestore';

interface NotificationBellProps {
  onPress: () => void;
  size?: number;
  color?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onPress, size = 24, color }) => {
  const { colors } = useThemeColors();
  const { user } = useAuthStore();
  const [hasNotifications, setHasNotifications] = useState(false);

  useEffect(() => {
    if (!user?.firebaseUid) return;

    const db = getFirestore();
    const notifsRef = collection(db, 'users', user.firebaseUid, 'notifications');
    
    // Listen for real-time changes
    const unsubscribe = onSnapshot(notifsRef, (snapshot) => {
      setHasNotifications(!snapshot.empty);
    }, (error) => {
      console.error('Error listening to notifications:', error);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Bell color={color || colors.text.primary} size={size} />
      {hasNotifications && (
        <View style={[styles.indicator, { backgroundColor: colors.danger }]} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 2,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  }
});
