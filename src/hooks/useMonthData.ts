import { db } from '@/src/db/database';
import type { Day, Entry } from '@/src/db/schema';
import { formatDateLocal } from '@/src/utils/dateUtils';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';

export interface DayData {
  date: string;
  net: number;
}

export function useMonthData(year: number, month: number, refreshKey?: number): DayData[] {
  const [monthData, setMonthData] = useState<DayData[]>([]);

  const loadMonthData = useCallback(() => {
    try {
      // Get all dates in the month
      const dates: string[] = [];
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month - 1, day);
        dates.push(formatDateLocal(date));
      }

      if (dates.length === 0) {
        setMonthData([]);
        return;
      }

      // Fetch days for this month
      const placeholders = dates.map(() => '?').join(',');
      const daysResult = db.getAllSync<Day>(
        `SELECT * FROM days WHERE date IN (${placeholders})`,
        dates
      );

      // Create a map of dayId to date
      const dayMap = new Map<string, string>();
      daysResult.forEach(day => {
        dayMap.set(day.id, day.date);
      });

      // Fetch all entries for these days
      const dayIds = daysResult.map(d => d.id);
      if (dayIds.length === 0) {
        // No days found, return zero data for all dates
        setMonthData(dates.map(date => ({ date, net: 0 })));
        return;
      }

      const entriesPlaceholders = dayIds.map(() => '?').join(',');
      const entriesResult = db.getAllSync<Entry>(
        `SELECT * FROM entries WHERE dayId IN (${entriesPlaceholders})`,
        dayIds
      );

      // Calculate net calories for each day
      const dayCalories = new Map<string, { in: number; out: number }>();
      entriesResult.forEach(entry => {
        const date = dayMap.get(entry.dayId);
        if (!date) return;

        if (!dayCalories.has(date)) {
          dayCalories.set(date, { in: 0, out: 0 });
        }

        const current = dayCalories.get(date)!;
        if (entry.type === 'food') {
          current.in += entry.calories;
        } else {
          current.out += entry.calories;
        }
      });

      // Build data for all dates in month
      const data: DayData[] = dates.map(date => {
        const calories = dayCalories.get(date) || { in: 0, out: 0 };
        return {
          date,
          net: calories.in - calories.out,
        };
      });

      setMonthData(data);
    } catch (error) {
      console.error('Error loading month data:', error);
      setMonthData([]);
    }
  }, [year, month]);

  // Load data on mount, when year/month changes, or when refreshKey changes
  useEffect(() => {
    loadMonthData();
  }, [loadMonthData, refreshKey]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadMonthData();
    }, [loadMonthData])
  );

  return monthData;
}

