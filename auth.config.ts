import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './src/lib/server/db/schema';

/**
 * Better Auth configuration for CLI
 *
 * This file is only used by @better-auth/cli for schema generation.
 * The actual runtime auth is created per-request in src/lib/server/auth.ts
 *
 * WORKFLOW:
 * 1. Run: pnpm run auth:generate
 *    → Generates Better Auth schema to auth-schema.ts
 *
 * 2. Review the generated schema in auth-schema.ts
 *    → Check what tables and columns were created/updated
 *
 * 3. Manually copy relevant schema from auth-schema.ts to:
 *    → src/lib/server/db/schema.ts (BETTER AUTH TABLES section)
 *
 * 4. Generate Drizzle migration:
 *    → pnpm run db:generate
 *
 * 5. Apply migration:
 *    → npx wrangler d1 migrations apply etee --local  (test first)
 *    → npx wrangler d1 migrations apply etee --remote (production)
 *
 * IMPORTANT:
 * - auth-schema.ts is generated output (reference/backup)
 * - schema.ts is the single source of truth
 * - You control what goes into schema.ts via manual merge
 */

// Mock DB instance for CLI (won't actually connect)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockDb = drizzle({} as any, { schema });

export const auth = betterAuth({
	database: drizzleAdapter(mockDb, {
		provider: 'sqlite'
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false
	},
	session: {
		expiresIn: 60 * 60 * 24 * 30, // 30 days
		updateAge: 60 * 60 * 24 * 15 // Update if older than 15 days
	}
});
