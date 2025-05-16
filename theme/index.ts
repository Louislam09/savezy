import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Colors based on Material You palette
const lightColors = {
  primary: '#3B82F6', // Blue
  secondary: '#0EA5E9', // Sky blue
  tertiary: '#F97316', // Orange
  surface: '#FFFFFF',
  background: '#F9FAFB',
  error: '#EF4444',
  success: '#10B981',
  warning: '#FBBF24',
  outline: '#6B7280',
  outlineVariant: '#E5E7EB',
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onTertiary: '#FFFFFF',
  onSurface: '#1F2937',
  onBackground: '#1F2937',
  elevation: {
    level0: 'transparent',
    level1: '#F3F4F6',
    level2: '#E5E7EB',
    level3: '#D1D5DB',
    level4: '#9CA3AF',
    level5: '#6B7280',
  },
};

const darkColors = {
  primary: '#60A5FA', // Lighter blue for dark mode
  secondary: '#38BDF8', // Lighter sky blue for dark mode
  tertiary: '#FB923C', // Lighter orange for dark mode
  surface: '#1F2937',
  background: '#111827',
  error: '#F87171',
  success: '#34D399',
  warning: '#FCD34D',
  outline: '#9CA3AF',
  outlineVariant: '#374151',
  onPrimary: '#111827',
  onSecondary: '#111827',
  onTertiary: '#111827',
  onSurface: '#F9FAFB',
  onBackground: '#F9FAFB',
  elevation: {
    level0: 'transparent',
    level1: '#374151',
    level2: '#4B5563',
    level3: '#6B7280',
    level4: '#9CA3AF',
    level5: '#D1D5DB',
  },
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
  },
  roundness: 8,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
  roundness: 8,
};