import { useState, useEffect, useCallback } from 'react';
import { db } from '@/src/db/database';

const TARGET_WEIGHT_KEY = 'targetWeight';
const TARGET_DATE_KEY = 'targetDate';

export interface TargetWeightData {
  targetWeight: number | null;
  targetDate: string | null; // YYYY-MM-DD format
}

export function useTargetWeight() {
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [targetDate, setTargetDate] = useState<string | null>(null);

  // Load target weight and date from database
  useEffect(() => {
    try {
      const weightResult = db.getAllSync<{ key: string; value: string }>(
        'SELECT * FROM settings WHERE key = ?',
        [TARGET_WEIGHT_KEY]
      );
      if (weightResult.length > 0) {
        setTargetWeight(parseFloat(weightResult[0].value));
      }

      const dateResult = db.getAllSync<{ key: string; value: string }>(
        'SELECT * FROM settings WHERE key = ?',
        [TARGET_DATE_KEY]
      );
      if (dateResult.length > 0) {
        setTargetDate(dateResult[0].value);
      }
    } catch (error) {
      console.error('Error loading target weight:', error);
    }
  }, []);

  // Update target weight
  const updateTargetWeight = useCallback((value: number | null) => {
    try {
      if (value === null) {
        db.runSync('DELETE FROM settings WHERE key = ?', [TARGET_WEIGHT_KEY]);
        setTargetWeight(null);
      } else {
        db.runSync(
          'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
          [TARGET_WEIGHT_KEY, value.toString()]
        );
        setTargetWeight(value);
      }
    } catch (error) {
      console.error('Error updating target weight:', error);
    }
  }, []);

  // Update target date
  const updateTargetDate = useCallback((value: string | null) => {
    try {
      if (value === null || value === '') {
        db.runSync('DELETE FROM settings WHERE key = ?', [TARGET_DATE_KEY]);
        setTargetDate(null);
      } else {
        db.runSync(
          'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
          [TARGET_DATE_KEY, value]
        );
        setTargetDate(value);
      }
    } catch (error) {
      console.error('Error updating target date:', error);
    }
  }, []);

  // Update both at once
  const updateTarget = useCallback((weight: number | null, date: string | null) => {
    updateTargetWeight(weight);
    updateTargetDate(date);
  }, [updateTargetWeight, updateTargetDate]);

  return { targetWeight, targetDate, updateTargetWeight, updateTargetDate, updateTarget };
}



