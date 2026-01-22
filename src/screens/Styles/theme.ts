// src/styles/theme.ts

import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#0F6B5B',
  secondary: '#F3AF1D',
  background: '#FFFCF1',
  lightGrey: '#E0E0E0',
  darkText: '#333',
  greyText: '#666',
  darkerGrey: '#DEDEDE',
  lighterGrey: '#F3F4F7',
  white: '#FFFFFF',
};

export const FONT_SIZES = {
  small: 12,
  medium: 14,
  large: 16,
  xl: 22,
  xxl: 28,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 32,
};

export const COMMON_STYLES = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  headerText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bodyText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.darkText,
  },
});
