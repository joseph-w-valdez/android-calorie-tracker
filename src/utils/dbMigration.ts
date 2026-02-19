import { db } from '@/src/db/database';
import type { Day } from '@/src/db/schema';
import { formatDateLocal, parseDateLocal } from './dateUtils';

/**
 * Check if dates in database need migration from UTC to local timezone
 * Returns true if migration is needed
 */
export function checkIfMigrationNeeded(): boolean {
  try {
    const days = db.getAllSync<Day>('SELECT * FROM days ORDER BY date DESC LIMIT 10');
    
    if (days.length === 0) return false;

    const today = formatDateLocal(new Date());
    const todayDate = parseDateLocal(today);
    
    // Check if most recent dates are 1 day ahead (UTC issue)
    let aheadCount = 0;
    for (const day of days) {
      const dayDate = parseDateLocal(day.date);
      const diffDays = Math.floor((dayDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        aheadCount++;
      }
    }
    
    // If more than half of recent dates are 1 day ahead, migration is needed
    return aheadCount > days.length / 2;
  } catch (error) {
    console.error('Error checking migration:', error);
    return false;
  }
}

/**
 * Migrate dates from UTC format to local timezone format
 * This shifts all dates back by 1 day if they were stored in UTC
 */
export function migrateDatesUTCToLocal(): void {
  try {
    const days = db.getAllSync<Day>('SELECT * FROM days');
    
    if (days.length === 0) {
      console.log('No days to migrate');
      return;
    }

    console.log(`Migrating ${days.length} days...`);

    // For each day, check if date needs adjustment
    for (const day of days) {
      const currentDate = parseDateLocal(day.date);
      const today = new Date();
      const todayLocal = formatDateLocal(today);
      const todayDate = parseDateLocal(todayLocal);
      
      // Calculate difference in days
      const diffDays = Math.floor((currentDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // If date is 1 day ahead, it's likely a UTC date - shift it back
      if (diffDays === 1) {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 1);
        const newDateString = formatDateLocal(newDate);
        
        // Check if new date already exists
        const existing = db.getAllSync<Day>('SELECT * FROM days WHERE date = ?', [newDateString]);
        
        if (existing.length === 0) {
          // Update the date
          db.runSync('UPDATE days SET date = ? WHERE id = ?', [newDateString, day.id]);
          console.log(`Migrated day ${day.date} -> ${newDateString}`);
        } else {
          // Date already exists, merge entries
          console.log(`Day ${newDateString} already exists, merging entries...`);
          const existingDay = existing[0];
          
          // Move all entries to existing day
          db.runSync('UPDATE entries SET dayId = ? WHERE dayId = ?', [existingDay.id, day.id]);
          
          // Delete the duplicate day
          db.runSync('DELETE FROM days WHERE id = ?', [day.id]);
          console.log(`Merged and deleted duplicate day ${day.id}`);
        }
      }
    }
    
    console.log('Migration complete');
  } catch (error) {
    console.error('Error migrating dates:', error);
    throw error;
  }
}

/**
 * Get all dates in database for inspection
 */
export function getAllDates(): Day[] {
  try {
    return db.getAllSync<Day>('SELECT * FROM days ORDER BY date DESC');
  } catch (error) {
    console.error('Error getting dates:', error);
    return [];
  }
}

