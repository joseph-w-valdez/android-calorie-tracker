// Database schema definitions

export interface Day {
  id: string;
  date: string;
  weight: number | null;
  notes: string | null;
}

export interface Entry {
  id: string;
  dayId: string;
  type: 'food' | 'exercise';
  name: string;
  calories: number;
  createdAt: string;
}

// SQL schema for reference
export const SCHEMA = {
  days: `
    CREATE TABLE IF NOT EXISTS days (
      id TEXT PRIMARY KEY,
      date TEXT UNIQUE NOT NULL,
      weight REAL,
      notes TEXT
    );
  `,
  entries: `
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      dayId TEXT NOT NULL,
      type TEXT CHECK(type IN ('food','exercise')) NOT NULL,
      name TEXT NOT NULL,
      calories REAL NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(dayId) REFERENCES days(id) ON DELETE CASCADE
    );
  `,
};

