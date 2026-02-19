import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Custom hook to manage refresh keys for data that needs to refresh on focus
 * and when dependencies change
 */
export function useRefreshKeys(dependencies: unknown[] = []) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [trendRefreshKey, setTrendRefreshKey] = useState(0);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
  const [weightRefreshKey, setWeightRefreshKey] = useState(0);

  // Refresh all keys when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setRefreshTrigger(prev => prev + 1);
      setTrendRefreshKey(prev => prev + 1);
      setCalendarRefreshKey(prev => prev + 1);
      setWeightRefreshKey(prev => prev + 1);
    }, [])
  );

  // Refresh specific keys when dependencies change
  const refreshTrend = useCallback(() => {
    setTrendRefreshKey(prev => prev + 1);
  }, []);

  const refreshCalendar = useCallback(() => {
    setCalendarRefreshKey(prev => prev + 1);
  }, []);

  const refreshWeight = useCallback(() => {
    setWeightRefreshKey(prev => prev + 1);
  }, []);

  const refreshAll = useCallback(() => {
    setTrendRefreshKey(prev => prev + 1);
    setCalendarRefreshKey(prev => prev + 1);
    setWeightRefreshKey(prev => prev + 1);
  }, []);

  return {
    refreshTrigger,
    trendRefreshKey,
    calendarRefreshKey,
    weightRefreshKey,
    refreshTrend,
    refreshCalendar,
    refreshWeight,
    refreshAll,
  };
}

