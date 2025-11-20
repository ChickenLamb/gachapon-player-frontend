import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import type { DB } from '$lib/server/db';

// Better Auth configuration factory
// This is called per-request with the DB instance from event.locals
export function createAuth(db: DB) {
	return betterAuth({
		database: drizzleAdapter(db, {
			provider: 'sqlite'
		}),
		// Email & Password authentication
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false // Set to true in production with email provider
		},
		// Session configuration
		session: {
			expiresIn: 60 * 60 * 24 * 30, // 30 days
			updateAge: 60 * 60 * 24 * 15, // Update session if older than 15 days
			cookieCache: {
				enabled: true,
				maxAge: 60 * 5 // Cache for 5 minutes
			}
		},
		// SvelteKit cookie helper plugin (MUST be last in plugins array)
		plugins: [sveltekitCookies(getRequestEvent)]
	});
}

// Type exports for use in hooks, endpoints, and app.d.ts
export type Auth = ReturnType<typeof createAuth>;

// Infer session types from the auth instance
// These automatically include any custom fields or plugin additions
export type Session = Auth['$Infer']['Session'];
export type User = Session['user'];
export type SessionInfo = Session['session'];
