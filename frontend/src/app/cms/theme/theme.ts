// Theme configuration for CMS

export type ThemeMode = 'light' | 'dark';
export type AccentPreset =
  | 'ocean'
  | 'forest'
  | 'sunset'
  | 'glacier'
  | 'midnight'
  | 'rose'
  | 'indigo'
  | 'teal'
  | 'yellow'
  | 'red'
  | 'sky'
  | 'peach'
  | 'plum'
  | 'mint'
  | 'cobalt'
  | 'sand';
export type FontScale = 'small' | 'normal' | 'large';

export interface ThemeConfig {
  mode: ThemeMode;
  accent: AccentPreset;
  sidebarColor: AccentPreset;
  fontScale: FontScale;
}

// Accent color presets - Mac-style colors
export const accentPresets: Record<AccentPreset, { primary: string; primaryHover: string; primaryForeground: string }> = {
  ocean: {
    primary: '#007AFF', // Apple Blue
    primaryHover: '#0051D5',
    primaryForeground: '#ffffff',
  },
  forest: {
    primary: '#34C759', // Apple Green
    primaryHover: '#28A745',
    primaryForeground: '#ffffff',
  },
  sunset: {
    primary: '#FF9500', // Apple Orange
    primaryHover: '#E68900',
    primaryForeground: '#ffffff',
  },
  glacier: {
    primary: '#5AC8FA', // Apple Light Blue
    primaryHover: '#4AB8EA',
    primaryForeground: '#ffffff',
  },
  midnight: {
    primary: '#5856D6', // Apple Purple
    primaryHover: '#4A48C8',
    primaryForeground: '#ffffff',
  },
  rose: {
    primary: '#FF2D55', // Apple Pink
    primaryHover: '#E61E4A',
    primaryForeground: '#ffffff',
  },
  indigo: {
    primary: '#5856D6', // Apple Indigo
    primaryHover: '#4A48C8',
    primaryForeground: '#ffffff',
  },
  teal: {
    primary: '#5AC8FA', // Apple Teal
    primaryHover: '#4AB8EA',
    primaryForeground: '#ffffff',
  },
  yellow: {
    primary: '#FFCC00', // Apple Yellow
    primaryHover: '#E6B800',
    primaryForeground: '#000000',
  },
  red: {
    primary: '#FF3B30', // Apple Red
    primaryHover: '#E62E24',
    primaryForeground: '#ffffff',
  },
  sky: {
    primary: '#4DA3FF',
    primaryHover: '#2F8AF0',
    primaryForeground: '#ffffff',
  },
  peach: {
    primary: '#FF9E7A',
    primaryHover: '#F58961',
    primaryForeground: '#ffffff',
  },
  plum: {
    primary: '#7C4DFF',
    primaryHover: '#6A3FE3',
    primaryForeground: '#ffffff',
  },
  mint: {
    primary: '#4FD1C5',
    primaryHover: '#3CB9AE',
    primaryForeground: '#ffffff',
  },
  cobalt: {
    primary: '#2F5BFF',
    primaryHover: '#2447DB',
    primaryForeground: '#ffffff',
  },
  sand: {
    primary: '#D8B98A',
    primaryHover: '#C7A576',
    primaryForeground: '#1d1d1f',
  },
};

// Font scale multipliers
export const fontScales: Record<FontScale, number> = {
  small: 0.875,
  normal: 1,
  large: 1.125,
};

// Default theme
export const defaultTheme: ThemeConfig = {
  mode: 'light',
  accent: 'forest',
  sidebarColor: 'midnight',
  fontScale: 'normal',
};

// Storage key
export const THEME_STORAGE_KEY = 'trekkers-cms-theme';
