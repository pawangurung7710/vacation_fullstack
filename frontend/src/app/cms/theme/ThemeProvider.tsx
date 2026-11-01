import { createContext, useContext, ReactNode } from 'react';
import { useTheme } from './useTheme';
import { ThemeConfig, accentPresets } from './theme';

interface ThemeContextType {
  theme: ThemeConfig;
  mounted: boolean;
  setMode: (mode: 'light' | 'dark') => void;
  setAccent: (accent: 'ocean' | 'forest' | 'sunset' | 'glacier' | 'midnight') => void;
  setFontScale: (fontScale: 'small' | 'normal' | 'large') => void;
  toggleMode: () => void;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  accentPresets: typeof accentPresets;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();

  return <ThemeContext.Provider value={{ ...theme, accentPresets }}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

