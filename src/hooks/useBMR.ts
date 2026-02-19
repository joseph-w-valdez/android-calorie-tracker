import { useState, useEffect, useCallback } from 'react';
import { db } from '@/src/db/database';

const BMR_KEY = 'bmr';

export function useBMR() {
  const [bmr, setBMR] = useState<number | null>(null);

  // Load BMR from database
  useEffect(() => {
    try {
      const result = db.getAllSync<{ key: string; value: string }>(
        'SELECT * FROM settings WHERE key = ?',
        [BMR_KEY]
      );
      if (result.length > 0) {
        setBMR(parseFloat(result[0].value));
      }
    } catch (error) {
      console.error('Error loading BMR:', error);
    }
  }, []);

  // Update BMR
  const updateBMR = useCallback((value: number | null) => {
    try {
      if (value === null) {
        db.runSync('DELETE FROM settings WHERE key = ?', [BMR_KEY]);
        setBMR(null);
      } else {
        db.runSync(
          'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
          [BMR_KEY, value.toString()]
        );
        setBMR(value);
      }
    } catch (error) {
      console.error('Error updating BMR:', error);
    }
  }, []);

  return { bmr, updateBMR };
}

