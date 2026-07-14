import { create } from 'zustand';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeStoreState {
  themePreference: ThemePreference;
  setThemePreference: (theme: ThemePreference) => void;
}

export const useThemeStore = create<ThemeStoreState>((set) => ({
  themePreference: 'system',
  setThemePreference: (theme) => set({ themePreference: theme }),
}));
