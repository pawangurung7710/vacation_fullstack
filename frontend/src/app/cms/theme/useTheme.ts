import { useCallback, useEffect, useState } from 'react';
import { ThemeConfig, ThemeMode, AccentPreset, FontScale, defaultTheme, THEME_STORAGE_KEY, accentPresets, fontScales } from './theme';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    let userTheme: Partial<ThemeConfig> | null = null;

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        userTheme = parsedUser?.settings?.theme || null;
      } catch (e) {
        // Invalid stored user, ignore
      }
    }

    if (userTheme) {
      const nextTheme = { ...defaultTheme, ...userTheme };
      setTheme(nextTheme);
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(nextTheme));
    } else {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setTheme({ ...defaultTheme, ...parsed });
        } catch (e) {
          // Invalid stored theme, use default
        }
      }
    }
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const accent = accentPresets[theme.accent];
    const sidebarAccent = accentPresets[theme.sidebarColor || theme.accent];
    const fontMultiplier = fontScales[theme.fontScale];

    // Apply accent colors
    root.style.setProperty('--cms-primary', accent.primary);
    root.style.setProperty('--cms-primary-hover', accent.primaryHover);
    root.style.setProperty('--cms-primary-foreground', accent.primaryForeground);

    // Apply font scale
    root.style.setProperty('--cms-font-scale', fontMultiplier.toString());

    // Sidebar gradient
    root.style.setProperty(
      '--cms-sidebar-gradient',
      `radial-gradient(circle at top left, rgba(255, 255, 255, 0.22), transparent 55%), linear-gradient(145deg, ${sidebarAccent.primary} 0%, ${sidebarAccent.primaryHover} 45%, #243247 82%, #1b2233 100%)`
    );

    // Apply mode - Apple-style colors
    if (theme.mode === 'dark') {
      root.classList.add('dark');
      root.style.setProperty('--cms-background', '#1d1d1f');
      root.style.setProperty('--cms-foreground', '#f5f5f7');
      root.style.setProperty('--cms-card', '#2c2c2e');
      root.style.setProperty('--cms-card-foreground', '#f5f5f7');
      root.style.setProperty('--cms-popover', '#2c2c2e');
      root.style.setProperty('--cms-popover-foreground', '#f5f5f7');
      root.style.setProperty('--cms-primary-foreground', '#ffffff');
      root.style.setProperty('--cms-secondary', '#3a3a3c');
      root.style.setProperty('--cms-secondary-foreground', '#f5f5f7');
      root.style.setProperty('--cms-muted', '#3a3a3c');
      root.style.setProperty('--cms-muted-foreground', '#98989d');
      root.style.setProperty('--cms-accent', '#3a3a3c');
      root.style.setProperty('--cms-accent-foreground', '#f5f5f7');
      root.style.setProperty('--cms-destructive', '#ff3b30');
      root.style.setProperty('--cms-destructive-foreground', '#ffffff');
      root.style.setProperty('--cms-border', '#38383a');
      root.style.setProperty('--cms-input', '#38383a');
      root.style.setProperty('--cms-ring', accent.primary);
    } else {
      root.classList.remove('dark');
      // Apple-style light mode colors
      root.style.setProperty('--cms-background', '#f5f5f7');
      root.style.setProperty('--cms-foreground', '#1d1d1f');
      root.style.setProperty('--cms-card', '#ffffff');
      root.style.setProperty('--cms-card-foreground', '#1d1d1f');
      root.style.setProperty('--cms-popover', '#ffffff');
      root.style.setProperty('--cms-popover-foreground', '#1d1d1f');
      root.style.setProperty('--cms-primary-foreground', '#ffffff');
      root.style.setProperty('--cms-secondary', '#f5f5f7');
      root.style.setProperty('--cms-secondary-foreground', '#1d1d1f');
      root.style.setProperty('--cms-muted', '#f5f5f7');
      root.style.setProperty('--cms-muted-foreground', '#6e6e73');
      root.style.setProperty('--cms-accent', '#f5f5f7');
      root.style.setProperty('--cms-accent-foreground', '#1d1d1f');
      root.style.setProperty('--cms-destructive', '#ff3b30');
      root.style.setProperty('--cms-destructive-foreground', '#ffffff');
      root.style.setProperty('--cms-border', '#d2d2d7');
      root.style.setProperty('--cms-input', '#d2d2d7');
      root.style.setProperty('--cms-ring', accent.primary);
    }

    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  }, [theme, mounted]);

  const updateTheme = useCallback((updates: Partial<ThemeConfig>) => {
    setTheme((prev) => ({ ...prev, ...updates }));
  }, []);

  const setMode = useCallback(
    (mode: ThemeMode) => {
      updateTheme({ mode });
    },
    [updateTheme]
  );

  const setAccent = useCallback(
    (accent: AccentPreset) => {
      updateTheme({ accent });
    },
    [updateTheme]
  );

  const setFontScale = useCallback(
    (fontScale: FontScale) => {
      updateTheme({ fontScale });
    },
    [updateTheme]
  );

  const toggleMode = useCallback(() => {
    setMode(theme.mode === 'light' ? 'dark' : 'light');
  }, [setMode, theme.mode]);

  return {
    theme,
    mounted,
    setMode,
    setAccent,
    setFontScale,
    toggleMode,
    updateTheme,
  };
}
