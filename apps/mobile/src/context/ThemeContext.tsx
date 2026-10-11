import React, { createContext, useContext, useState } from 'react';
import { brightTheme, darkTheme } from '../theme/tokens';

type ThemeMode = 'bright' | 'dark';

export type AppTheme = typeof brightTheme;

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  theme: AppTheme;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('bright');

  const toggleTheme = () => {
    setMode((prev) => (prev === 'bright' ? 'dark' : 'bright'));
  };

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const theme: AppTheme = mode === 'dark' ? (darkTheme as unknown as AppTheme) : brightTheme;

  return (
    <ThemeContext.Provider
      value={{
        mode,
        isDark: mode === 'dark',
        theme,
        toggleTheme,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
