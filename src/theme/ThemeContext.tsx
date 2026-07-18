import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { darkTheme, lightTheme, Theme } from '../theme';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  isDark: false,
  mode: 'system',
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const mode = useAppStore((s) => s.themeMode);
  const setMode = useAppStore((s) => s.setThemeMode);

  const isDark = mode === 'system' ? system === 'dark' : mode === 'dark';
  const value = useMemo<ThemeContextValue>(
    () => ({ theme: isDark ? darkTheme : lightTheme, isDark, mode, setMode }),
    [isDark, mode, setMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

// Pomocnik: buduje style z aktywnego motywu i przelicza je przy zmianie trybu.
export function useThemedStyles<T>(factory: (theme: Theme) => T): T {
  const { theme } = useTheme();
  return useMemo(() => factory(theme), [theme, factory]);
}
