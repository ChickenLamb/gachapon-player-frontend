import { defineConfig } from 'drizzle-kit';

/**
 * Configuration for MIGRATION GENERATION
 *
 * Purpose: Generate SQL migrations from TypeScript schema
 *
 * Used by:
 *   - pnpm run db:generate → scripts/db-generate-migration.mjs
 *   - The wrapper script enforces context boundary naming
 *
 * How it works:
 *   1. Wrapper prompts for migration name (e.g., auth_add_oauth_providers)
 *   2. Validates name follows: <context>_<action>_<detail> pattern
 *   3. Calls: drizzle-kit generate --config=drizzle.config.generate.ts --name=<name>
 *   4. Reads: ./src/lib/server/db/schema.ts (TypeScript)
 *   5. Compares: Current schema vs previous migrations
 *   6. Generates: New migration SQL with meaningful name
 *   7. Writes: ./drizzle/migrations/<number>_<name>.sql
 *
 * ✅ NO .env needed - purely local file operations
 * ✅ NO database connection required
 * ✅ NO API credentials needed
 * ✅ Migration naming enforced by wrapper script
 *
 * Only requires:
 *   - schema: Where to read TypeScript definitions
 *   - out: Where to write SQL migrations
 *   - dialect: What SQL dialect to generate
 */

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle/migrations',
	dialect: 'sqlite',
	verbose: true,
	strict: true
});
