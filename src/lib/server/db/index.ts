import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// Factory function to create database instance from platform binding
export function createDB(database: D1Database) {
	return drizzle(database, { schema });
}

// Type for the database instance
export type DB = ReturnType<typeof createDB>;
