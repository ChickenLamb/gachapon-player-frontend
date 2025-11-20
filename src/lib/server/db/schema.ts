import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ============================================================================
// GACHAPON SESSION TABLE
// ============================================================================
// Minimal session storage for JWT tokens from Unity WebView
// User data comes from JWT payload, we only store session metadata
// ============================================================================

export const gachaponSession = sqliteTable('gachapon_session', {
	id: text('id').primaryKey(),
	token: text('token').notNull().unique(),
	userId: text('user_id').notNull(), // From JWT payload
	expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	lastAccessedAt: integer('last_accessed_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent')
});

// ============================================================================
// CUSTOM APPLICATION TABLES
// ============================================================================
// Add your custom tables below this line
// Future: prize cache, user preferences, etc.
// ============================================================================

// Type exports
export type GachaponSessionDB = typeof gachaponSession.$inferSelect;
