import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { colors } from '../theme/colors';

export const useThemeColors = () => {
  const { themePreference } = useThemeStore();
  const systemTheme = useColorScheme();

  const activeTheme = themePreference === 'system' 
    ? (systemTheme === 'dark' ? 'dark' : 'light') 
    : themePreference;

  return {
    colors: colors[activeTheme],
    isDark: activeTheme === 'dark',
  };
};
