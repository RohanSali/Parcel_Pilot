import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useThemeColors } from '../hooks/useThemeColors';
import { useThemeStore } from '../store/themeStore';
import { User, ChevronRight, Bell, Shield, HelpCircle, Layers, Moon, Sun, Smartphone, ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import { CustomModal } from '../components/ui/CustomModal';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { triggerEcosystemPrompt } = useAuthStore();
  const { themePreference, setThemePreference } = useThemeStore();
  const { colors, isDark } = useThemeColors();
  const styles = createStyles(colors, isDark);
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  const getThemeDisplayName = (pref: string) => {
    switch (pref) {
      case 'light': return 'Light Mode';
      case 'dark': return 'Dark Mode';
      default: return 'System Default';
    }
  };

  const handleThemePress = () => {
    setThemeModalVisible(true);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.menuItemLeft}>
            <User color={colors.primary} size={24} />
            <Text style={styles.menuItemText}>My Profile</Text>
          </View>
          <ChevronRight color={colors.text.secondary} size={20} />
        </TouchableOpacity>
      </View>



      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleThemePress}
        >
          <View style={styles.menuItemLeft}>
            <Smartphone color={colors.text.primary} size={24} />
            <Text style={styles.menuItemText}>Theme</Text>
          </View>
          <View style={styles.menuItemRight}>
            <Text style={styles.menuItemValue}>{getThemeDisplayName(themePreference)}</Text>
            <ChevronRight color={colors.text.secondary} size={20} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Ecosystems')}
        >
          <View style={styles.menuItemLeft}>
            <Layers color={colors.text.primary} size={24} />
            <Text style={styles.menuItemText}>My Ecosystems</Text>
          </View>
          <ChevronRight color={colors.text.secondary} size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Shield color={colors.text.primary} size={24} />
            <Text style={styles.menuItemText}>Privacy & Security</Text>
          </View>
          <ChevronRight color={colors.text.secondary} size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <HelpCircle color={colors.text.primary} size={24} />
            <Text style={styles.menuItemText}>Help Center</Text>
          </View>
          <ChevronRight color={colors.text.secondary} size={20} />
        </TouchableOpacity>
      </View>

      <CustomModal
        visible={themeModalVisible}
        onClose={() => setThemeModalVisible(false)}
        title="Select Theme"
        message="Choose your preferred appearance"
        actions={[
          { label: 'System Default', onPress: () => setThemePreference('system'), variant: themePreference === 'system' ? 'primary' : 'secondary' },
          { label: 'Light Mode', onPress: () => setThemePreference('light'), variant: themePreference === 'light' ? 'primary' : 'secondary' },
          { label: 'Dark Mode', onPress: () => setThemePreference('dark'), variant: themePreference === 'dark' ? 'primary' : 'secondary' },
          { label: 'Cancel', onPress: () => {}, variant: 'danger' }
        ]}
      />
    </ScrollView>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: 16,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemValue: {
    fontSize: 14,
    color: colors.text.secondary,
    marginRight: 8,
  },
});
