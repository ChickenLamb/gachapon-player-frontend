// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Platform {
			env: {
				DB: D1Database;
			};
			cf: CfProperties;
			ctx: ExecutionContext;
		}

		interface Locals {
			db: import('$lib/server/db').DB;
			user: import('$lib/server/auth').User | null;
			session: import('$lib/server/auth').SessionInfo | null;
		}
	}
}

export {};
