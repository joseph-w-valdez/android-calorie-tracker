import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '@/src/db/database';
import type { Entry, Day } from '@/src/db/schema';
import { generateId } from '@/src/utils/idGenerator';
import { logError } from '@/src/utils/errorHandler';

interface UseDayResult {
  entries: Entry[];
  caloriesIn: number;
  caloriesOut: number;
  net: number;
  weight: number | null;
  addEntry: (type: 'food' | 'exercise', name: string, calories: number) => void;
  updateEntry: (id: string, type: 'food' | 'exercise', name: string, calories: number) => void;
  deleteEntry: (id: string) => void;
  updateWeight: (weight: number | null) => void;
}

export function useDay(date: string, refreshTrigger?: number): UseDayResult {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [day, setDay] = useState<Day | null>(null);
  const [dayId, setDayId] = useState<string | null>(null);

  // Ensure day exists, create if not
  const ensureDay = useCallback((): string => {
    try {
      // Try to find existing day
      const result = db.getAllSync<Day>(
        'SELECT * FROM days WHERE date = ?',
        [date]
      );

      if (result.length > 0) {
        const existingDay = result[0];
        setDay(existingDay);
        setDayId(existingDay.id);
        return existingDay.id;
      }

      // Create new day
      const newDayId = generateId('day');
      db.runSync('INSERT INTO days (id, date) VALUES (?, ?)', [newDayId, date]);
      
      const newDay: Day = {
        id: newDayId,
        date,
        weight: null,
        notes: null,
      };
      setDay(newDay);
      setDayId(newDayId);
      return newDayId;
    } catch (error) {
      logError('useDay.ensureDay', error);
      throw error;
    }
  }, [date]);

  // Load entries for the day
  const loadEntries = useCallback((currentDayId: string) => {
    try {
      const result = db.getAllSync<Entry>(
        'SELECT * FROM entries WHERE dayId = ? ORDER BY createdAt ASC',
        [currentDayId]
      );
      setEntries(result);
    } catch (error) {
      logError('useDay.loadEntries', error);
    }
  }, []);

  // Initialize: ensure day exists
  useEffect(() => {
    ensureDay();
  }, [date, ensureDay]);

  // Load entries when dayId is available or refreshTrigger changes
  useEffect(() => {
    if (dayId) {
      loadEntries(dayId);
    }
  }, [dayId, loadEntries, refreshTrigger]);

  // Compute calories (memoized for performance)
  const caloriesIn = useMemo(
    () => entries.filter(e => e.type === 'food').reduce((sum, e) => sum + e.calories, 0),
    [entries]
  );

  const caloriesOut = useMemo(
    () => entries.filter(e => e.type === 'exercise').reduce((sum, e) => sum + e.calories, 0),
    [entries]
  );

  const net = useMemo(() => caloriesIn - caloriesOut, [caloriesIn, caloriesOut]);

  // Add entry
  const addEntry = useCallback((type: 'food' | 'exercise', name: string, calories: number) => {
    const currentDayId = dayId || ensureDay();
    if (!currentDayId) return;

    const entryId = generateId('entry');
    const createdAt = new Date().toISOString();

    try {
      db.runSync(
        'INSERT INTO entries (id, dayId, type, name, calories, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [entryId, currentDayId, type, name, calories, createdAt]
      );

      // Reload entries to ensure consistency
      loadEntries(currentDayId);
    } catch (error) {
      logError('useDay.addEntry', error);
    }
  }, [dayId, ensureDay, loadEntries]);

  // Update entry
  const updateEntry = useCallback((id: string, type: 'food' | 'exercise', name: string, calories: number) => {
    if (!dayId) return;
    
    try {
      db.runSync(
        'UPDATE entries SET type = ?, name = ?, calories = ? WHERE id = ?',
        [type, name, calories, id]
      );

      // Reload entries to ensure consistency
      loadEntries(dayId);
    } catch (error) {
      logError('useDay.updateEntry', error);
    }
  }, [dayId, loadEntries]);

  // Delete entry
  const deleteEntry = useCallback((id: string) => {
    if (!dayId) return;
    
    try {
      db.runSync('DELETE FROM entries WHERE id = ?', [id]);
      
      // Reload entries to ensure consistency
      loadEntries(dayId);
    } catch (error) {
      logError('useDay.deleteEntry', error);
    }
  }, [dayId, loadEntries]);

  // Update weight
  const updateWeight = useCallback((weight: number | null) => {
    const currentDayId = dayId || ensureDay();
    if (!currentDayId) return;

    try {
      db.runSync('UPDATE days SET weight = ? WHERE id = ?', [weight, currentDayId]);
      setDay(prev => prev ? { ...prev, weight } : null);
    } catch (error) {
      logError('useDay.updateWeight', error);
    }
  }, [dayId, ensureDay]);

  return {
    entries,
    caloriesIn,
    caloriesOut,
    net,
    weight: day?.weight ?? null,
    addEntry,
    updateEntry,
    deleteEntry,
    updateWeight,
  };
}

