/**
 * Theme constants for consistent styling across the app
 * Centralizes all hardcoded values for easy maintenance
 */

// Colors
export const colors = {
  // Primary colors
  primary: '#556b2f',
  primaryLight: 'rgba(85, 107, 47, 0.1)',
  primaryMedium: 'rgba(85, 107, 47, 0.3)',
  primaryDark: 'rgba(85, 107, 47, 0.8)',
  
  // Background colors
  background: '#e8ede0',
  backgroundLight: '#fafafa',
  backgroundWhite: 'rgba(255, 255, 255, 0.95)',
  backgroundTransparent: 'rgba(255, 255, 255, 0.2)',
  backgroundSemiTransparent: 'rgba(255, 255, 255, 0.7)',
  
  // Text colors
  textPrimary: '#2a2a2a',
  textSecondary: '#666',
  textMuted: '#888',
  textWhite: '#fff',
  
  // Border colors
  borderLight: '#e0e0e0',
  borderMedium: 'rgba(0, 0, 0, 0.3)',
  borderPrimary: '#556b2f',
  
  // Status colors
  danger: '#d32f2f',
  success: '#4CAF50',
  
  // Overlay colors
  overlayDark: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.6)',
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border radius
export const borderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  round: 9999,
};

// Font sizes
export const fontSize = {
  xs: 9,
  sm: 11,
  md: 13,
  lg: 15,
  xl: 20,
  xxl: 24,
  xxxl: 48,
};

// Font weights
export const fontWeight = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// Shadows
export const shadows = {
  sm: '0 1px 3px rgba(0, 0, 0, 0.12)',
  md: '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
  xl: '0 8px 32px rgba(0, 0, 0, 0.25)',
  primaryGlow: '0 0 0 2px rgba(85, 107, 47, 0.3), 0 4px 12px rgba(85, 107, 47, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1)',
};

// Z-index layers
export const zIndex = {
  base: 1,
  dropdown: 10,
  sticky: 20,
  fixed: 100,
  modal: 1000,
  tooltip: 9999,
};

// Dimensions
export const dimensions = {
  cardWidth: 800,
  cardHeight: 600,
  itemsPanelWidth: 220,
  droppedItemSize: 20,
  inputWidth: 100,
  labelWidth: 80,
  treeEditCardWidth: 220,
};

// Transitions
export const transitions = {
  fast: '0.1s ease',
  normal: '0.2s ease',
  slow: '0.3s ease',
};

// Common style mixins (can be spread into StyleSheet)
export const mixins = {
  flexCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  buttonBase: {
    borderRadius: borderRadius.xs,
    alignItems: 'center',
    boxShadow: shadows.sm,
    elevation: 2,
  },
  inputBase: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.xs,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  cardBase: {
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSemiTransparent,
    boxShadow: shadows.lg,
    elevation: 4,
    borderWidth: 2,
    borderColor: colors.borderPrimary,
    borderStyle: 'solid',
  },
  modalBase: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.xl,
    elevation: 12,
    backdropFilter: 'blur(10px)',
  },
  textButton: {
    color: colors.textWhite,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.3,
  },
  labelText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
  zIndex,
  dimensions,
  transitions,
  mixins,
};
