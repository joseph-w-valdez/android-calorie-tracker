import * as SQLite from 'expo-sqlite';

// Open SQLite database named "tracker.db"
export const db = SQLite.openDatabaseSync('tracker.db');

// Initialize database by creating tables
export function initDatabase(): void {
  // Enable foreign keys
  db.execSync('PRAGMA foreign_keys = ON;');
  
  // Create days table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS days (
      id TEXT PRIMARY KEY,
      date TEXT UNIQUE NOT NULL,
      weight REAL,
      notes TEXT
    );
  `);
  
  // Create entries table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      dayId TEXT NOT NULL,
      type TEXT CHECK(type IN ('food','exercise')) NOT NULL,
      name TEXT NOT NULL,
      calories REAL NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(dayId) REFERENCES days(id) ON DELETE CASCADE
    );
  `);
  
  // Create settings table for BMR
  db.execSync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

// Initialize database immediately when module loads
initDatabase();

// Run migration after a short delay to ensure all modules are loaded
setTimeout(() => {
  try {
    // Dynamic import to avoid circular dependencies
    import('@/src/utils/dbMigration').then(({ checkIfMigrationNeeded, migrateDatesUTCToLocal }) => {
      if (checkIfMigrationNeeded()) {
        console.log('Migrating dates from UTC to local timezone...');
        migrateDatesUTCToLocal();
      }
    }).catch(() => {
      // Migration module might not be available, that's okay
    });
  } catch (error) {
    // Ignore migration errors
  }
}, 100);

