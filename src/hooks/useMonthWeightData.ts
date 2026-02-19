import { db } from '@/src/db/database';
import type { Day } from '@/src/db/schema';
import { formatDateLocal } from '@/src/utils/dateUtils';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export interface WeightDayData {
  date: string;
  weight: number | null;
}

export function useMonthWeightData(year: number, month: number, refreshKey?: number): WeightDayData[] {
  const [monthData, setMonthData] = useState<WeightDayData[]>([]);

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
        `SELECT date, weight FROM days WHERE date IN (${placeholders})`,
        dates
      );

      // Create a map of date to weight
      const weightMap = new Map<string, number | null>();
      daysResult.forEach(day => {
        weightMap.set(day.date, day.weight);
      });

      // Build data for all dates in month
      const data: WeightDayData[] = dates.map(date => ({
        date,
        weight: weightMap.get(date) || null,
      }));

      setMonthData(data);
    } catch (error) {
      console.error('Error loading month weight data:', error);
      setMonthData([]);
    }
  }, [year, month]);

  useEffect(() => {
    loadMonthData();
  }, [loadMonthData, refreshKey]);

  useFocusEffect(
    useCallback(() => {
      loadMonthData();
    }, [loadMonthData])
  );

  return monthData;
}



