// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Platform {
			env: Record<string, never>; // Add environment bindings here when needed
			cf: CfProperties;
			ctx: ExecutionContext;
		}

		interface Locals {
			// Gachapon-specific auth (JWT from Unity WebView)
			user: import('$lib/types').GachaponUser | null;
			session: import('$lib/types').GachaponSession | null;
		}
	}

	// Unity WebView interface
	interface Window {
		Unity?: {
			call: (method: string) => void;
		};
	}
}

export {};
