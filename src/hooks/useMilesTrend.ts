import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { db } from '@/src/db/database';
import type { Day, Entry } from '@/src/db/schema';
import { formatDateLocal, getTodayLocal } from '@/src/utils/dateUtils';

export interface MilesDay {
  date: string;
  miles: number;
}

// Parse miles from entry name (e.g., "3.5 miles" or "1 mile")
function parseMilesFromName(name: string): number | null {
  const match = name.match(/(\d+\.?\d*)\s*miles?/i);
  return match ? parseFloat(match[1]) : null;
}

export function useMilesTrend(days: number = 7, refreshKey?: number): MilesDay[] {
  const [milesData, setMilesData] = useState<MilesDay[]>([]);

  const loadMilesData = useCallback(() => {
    try {
      // Get dates for the last N days using local timezone
      const dates: string[] = [];
      const todayStr = getTodayLocal();
      const [todayYear, todayMonth, todayDay] = todayStr.split('-').map(Number);
      
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

      // Fetch all exercise entries for these days
      const dayIds = daysResult.map(d => d.id);
      if (dayIds.length === 0) {
        // No days found, return empty data for all dates
        setMilesData(dates.map(date => ({ date, miles: 0 })));
        return;
      }

      const entriesPlaceholders = dayIds.map(() => '?').join(',');
      const entriesResult = db.getAllSync<Entry>(
        `SELECT * FROM entries WHERE dayId IN (${entriesPlaceholders}) AND type = 'exercise'`,
        dayIds
      );

      // Calculate total miles for each day
      const dayMiles = new Map<string, number>();
      entriesResult.forEach(entry => {
        const date = dayMap.get(entry.dayId);
        if (!date) return;

        const miles = parseMilesFromName(entry.name);
        if (miles !== null) {
          const current = dayMiles.get(date) || 0;
          dayMiles.set(date, current + miles);
        }
      });

      // Build miles data for all dates (including days with no entries)
      const miles: MilesDay[] = dates.map(date => ({
        date,
        miles: dayMiles.get(date) || 0,
      }));

      setMilesData(miles);
    } catch (error) {
      console.error('Error loading miles trend data:', error);
      setMilesData([]);
    }
  }, [days]);

  // Load data on mount, when days changes, or when refreshKey changes
  useEffect(() => {
    loadMilesData();
  }, [loadMilesData, refreshKey]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadMilesData();
    }, [loadMilesData])
  );

  return milesData;
}

