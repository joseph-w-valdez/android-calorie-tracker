import { useState, useEffect, useCallback } from 'react';
import { db } from '@/src/db/database';

/**
 * Generic hook for managing settings stored in the database
 * Replaces the pattern used in useBMR and useTargetWeight
 */
export function useSetting<T extends string | number>(
  key: string,
  parseValue: (value: string) => T,
  stringifyValue: (value: T) => string
) {
  const [value, setValue] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load setting from database
  useEffect(() => {
    try {
      const result = db.getAllSync<{ key: string; value: string }>(
        'SELECT * FROM settings WHERE key = ?',
        [key]
      );
      if (result.length > 0) {
        setValue(parseValue(result[0].value));
      }
    } catch (error) {
      console.error(`Error loading setting ${key}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [key, parseValue]);

  // Update setting
  const updateValue = useCallback(
    (newValue: T | null) => {
      try {
        if (newValue === null) {
          db.runSync('DELETE FROM settings WHERE key = ?', [key]);
          setValue(null);
        } else {
          db.runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
            key,
            stringifyValue(newValue),
          ]);
          setValue(newValue);
        }
      } catch (error) {
        console.error(`Error updating setting ${key}:`, error);
        throw error;
      }
    },
    [key, stringifyValue]
  );

  return { value, updateValue, isLoading };
}

