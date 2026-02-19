import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { db } from '@/src/db/database';
import type { Day, Entry } from '@/src/db/schema';
import { formatDateLocal, getTodayLocal, parseDateLocal } from '@/src/utils/dateUtils';

export interface TrendDay {
  date: string;
  net: number;
  caloriesIn: number;
  caloriesOut: number;
}

export function useTrend(days: number = 7, refreshKey?: number): TrendDay[] {
  const [trendData, setTrendData] = useState<TrendDay[]>([]);

  const loadTrendData = useCallback(() => {
    try {
      // Get dates for the last N days using local timezone
      // Calculate dates directly without Date manipulation to avoid timezone issues
      const dates: string[] = [];
      const todayStr = getTodayLocal();
      const [todayYear, todayMonth, todayDay] = todayStr.split('-').map(Number);
      const todayDate = new Date(todayYear, todayMonth - 1, todayDay);
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(todayYear, todayMonth - 1, todayDay - i);
        dates.push(formatDateLocal(date));
      }

      // Fetch days and entries
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
        // No days found, return empty data for all dates
        setTrendData(dates.map(date => ({ date, net: 0, caloriesIn: 0, caloriesOut: 0 })));
        return;
      }

      const entriesPlaceholders = dayIds.map(() => '?').join(',');
      const entriesResult = db.getAllSync<Entry>(
        `SELECT * FROM entries WHERE dayId IN (${entriesPlaceholders})`,
        dayIds
      );

      // Calculate calories for each day
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

      // Build trend data for all dates (including days with no entries)
      const trend: TrendDay[] = dates.map(date => {
        const calories = dayCalories.get(date) || { in: 0, out: 0 };
        return {
          date,
          net: calories.in - calories.out,
          caloriesIn: calories.in,
          caloriesOut: calories.out,
        };
      });

      setTrendData(trend);
    } catch (error) {
      console.error('Error loading trend data:', error);
      setTrendData([]);
    }
  }, [days]);

  // Load data on mount, when days changes, or when refreshKey changes
  useEffect(() => {
    loadTrendData();
  }, [loadTrendData, refreshKey]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTrendData();
    }, [loadTrendData])
  );

  return trendData;
}

