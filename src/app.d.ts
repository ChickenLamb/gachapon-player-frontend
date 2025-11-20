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
			// Gachapon-specific auth (JWT from Unity WebView)
			user: import('$lib/types').GachaponUser | null;
			session: import('$lib/types').GachaponSession | null;
		}
	}
}

export {};
