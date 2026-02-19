import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { db } from '@/src/db/database';
import type { Day } from '@/src/db/schema';
import { formatDateLocal, getTodayLocal, parseDateLocal } from '@/src/utils/dateUtils';

export interface WeightDay {
  date: string;
  weight: number | null;
}

export function useWeightTrend(days: number = 7, refreshKey?: number): WeightDay[] {
  const [weightData, setWeightData] = useState<WeightDay[]>([]);

  const loadWeightData = useCallback(() => {
    try {
      // Get dates for the last N days using local timezone
      const dates: string[] = [];
      const todayStr = getTodayLocal();
      const [todayYear, todayMonth, todayDay] = todayStr.split('-').map(Number);
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(todayYear, todayMonth - 1, todayDay - i);
        dates.push(formatDateLocal(date));
      }

      // Fetch days with weight data
      const placeholders = dates.map(() => '?').join(',');
      const daysResult = db.getAllSync<Day>(
        `SELECT date, weight FROM days WHERE date IN (${placeholders}) AND weight IS NOT NULL`,
        dates
      );

      // Create a map of date to weight
      const weightMap = new Map<string, number>();
      daysResult.forEach(day => {
        if (day.weight !== null) {
          weightMap.set(day.date, day.weight);
        }
      });

      // Build weight data for all dates (including days with no weight)
      const weight: WeightDay[] = dates.map(date => ({
        date,
        weight: weightMap.get(date) || null,
      }));

      setWeightData(weight);
    } catch (error) {
      console.error('Error loading weight data:', error);
      setWeightData([]);
    }
  }, [days]);

  // Load data on mount, when days changes, or when refreshKey changes
  useEffect(() => {
    loadWeightData();
  }, [loadWeightData, refreshKey]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadWeightData();
    }, [loadWeightData])
  );

  return weightData;
}



