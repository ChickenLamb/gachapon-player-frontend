import { defineConfig } from 'drizzle-kit';

/**
 * Configuration for REMOTE Drizzle Kit operations
 *
 * Purpose: Connect to remote Cloudflare D1 database
 *
 * ⚠️ REQUIRES .env with Cloudflare API credentials
 *
 * Used by:
 *   - pnpm run db:push (push schema directly to remote)
 *   - pnpm run db:migrate (apply migrations to remote)
 *   - pnpm run db:studio:remote (inspect production database)
 *
 * NOT used by:
 *   - pnpm run db:generate (uses drizzle.config.generate.ts)
 *   - pnpm run db:studio (uses drizzle.config.local.ts)
 *
 * Setup: Copy .env.example to .env and fill in your Cloudflare credentials
 */

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle/migrations',
	dialect: 'sqlite',
	driver: 'd1-http',
	dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
	verbose: true,
	strict: true
});
