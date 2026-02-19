import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { db } from '@/src/db/database';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from database
  useEffect(() => {
    try {
      const result = db.getAllSync<{ key: string; value: string }>(
        'SELECT * FROM settings WHERE key = ?',
        ['themePreference']
      );
      if (result.length > 0) {
        const value = result[0].value;
        if (value === 'light' || value === 'dark' || value === 'system') {
          setThemePreferenceState(value as ThemePreference);
        }
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update theme preference
  const setThemePreference = useCallback((preference: ThemePreference) => {
    try {
      db.runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
        'themePreference',
        preference,
      ]);
      setThemePreferenceState(preference);
    } catch (error) {
      console.error('Error updating theme preference:', error);
      throw error;
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ themePreference, setThemePreference, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Export ThemeProvider as alias for convenience
export const ThemeProvider = AppThemeProvider;

export function useThemePreference() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemePreference must be used within a ThemeProvider');
  }
  return context;
}

