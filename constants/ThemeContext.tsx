import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getThemeColors, THEMES, type ThemeColors, type ThemeId, type ThemeMode } from './theme';

export type { ThemeColors, ThemeId, ThemeMode } from './theme';

const STORAGE_MODE = 'settings_theme_mode';
const STORAGE_THEME = 'settings_theme_id';

interface ThemeContextType {
  themeId: ThemeId;
  mode: ThemeMode;
  colors: ThemeColors;
  setTheme: (themeId: ThemeId) => void;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeId: 'sand',
  mode: 'dark',
  colors: getThemeColors('sand', 'dark'),
  setTheme: () => {},
  setMode: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>('sand');
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_THEME).then((id) => {
      if (id && THEMES.some((t) => t.id === id)) setThemeId(id as ThemeId);
    });
    AsyncStorage.getItem(STORAGE_MODE).then((m) => {
      if (m === 'light' || m === 'dark') setModeState(m);
    });
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id);
    AsyncStorage.setItem(STORAGE_THEME, id);
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_MODE, m);
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(STORAGE_MODE, next);
      return next;
    });
  }, []);

  const colors = useMemo(() => getThemeColors(themeId, mode), [themeId, mode]);

  const value = useMemo(
    () => ({ themeId, mode, colors, setTheme, setMode, toggle }),
    [themeId, mode, colors, setTheme, setMode, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
