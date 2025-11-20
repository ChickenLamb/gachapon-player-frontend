# Better Auth - Authentication System Guide

Complete guide to the Better Auth authentication system in this SvelteKit + Cloudflare Workers + D1 project.

---

## 📚 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Complete Request Flow](#complete-request-flow)
- [Database Schema](#database-schema)
- [Server Configuration](#server-configuration)
- [Client Usage](#client-usage)
- [API Endpoints](#api-endpoints)
- [Security Features](#security-features)
- [Usage Examples](#usage-examples)
- [Common Tasks](#common-tasks)

---

## Overview

This project uses **Better Auth** - a modern, framework-agnostic authentication library for TypeScript:

- ✅ Email & Password authentication built-in
- ✅ 30-day sessions with automatic renewal (sliding window)
- ✅ Type-safe with TypeScript and Drizzle ORM
- ✅ Cloudflare Workers compatible (D1 + Drizzle adapter)
- ✅ Framework-agnostic core with SvelteKit integration
- ✅ Extensible plugin system

**Why Better Auth?**

- Modern, actively maintained framework
- Built-in authentication methods (email/password, OAuth, etc.)
- Official SvelteKit integration (`better-auth/svelte`)
- Drizzle ORM adapter for D1 database
- Automatic cookie management with `sveltekitCookies` plugin

**Documentation**: https://www.better-auth.com

---

## Architecture

### Core Components

```
better-auth (core library)
├── drizzleAdapter     → Database operations
├── emailAndPassword   → Built-in auth method
├── session            → Session management
└── plugins
    └── sveltekitCookies → Automatic cookie handling
```

### Project Structure

```
src/
├── lib/
│   ├── server/
│   │   └── auth.ts          # Better Auth server configuration (factory)
│   └── client/
│       └── auth.ts          # Better Auth client for Svelte components
├── hooks.server.ts          # Request middleware (auth validation)
└── routes/
    └── api/auth/*           # Better Auth API routes (automatic)

auth.config.ts               # CLI configuration (schema generation)
auth-schema.ts               # Generated schema (reference/backup)
```

---

## Complete Request Flow

### Visual Flow Diagram

```
User Request
    ↓
Cloudflare Workers
    ↓
SvelteKit Hooks (sequence)
    ↓
1. handleDatabase()
   → Create DB from platform.env.DB
   → Store in event.locals.db
    ↓
2. handleParaglide()
   → i18n processing
    ↓
3. handleAuth()
   → Create Better Auth instance with DB
   → Validate session via Better Auth API
   → Store user/session in event.locals
   → Handle Better Auth routes (/api/auth/*)
    ↓
4. Route Handler
   → Access user via event.locals.user
   → Access session via event.locals.session
    ↓
Response to User
```

### Key Points

1. **Per-Request Auth Instance**: Better Auth instance is created on each request with the DB from `event.locals`
2. **Automatic Session Validation**: Better Auth checks cookies and validates sessions
3. **Automatic Route Handling**: `svelteKitHandler` automatically handles `/api/auth/*` routes
4. **Event Locals**: Authenticated user and session available in `event.locals`

---

## Database Schema

Better Auth uses 4 core tables managed automatically:

### 1. User Table

```typescript
export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
	image: text('image'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`...`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`...`)
		.$onUpdate(() => new Date())
		.notNull()
});
```

**Key fields**:

- `email` - Unique email address for login
- `emailVerified` - Email verification status
- Timestamps managed automatically with `$onUpdate()`

### 2. Session Table

```typescript
export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`...`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.$onUpdate(() => new Date())
		.notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});
```

**Key fields**:

- `token` - Session token (hashed in Better Auth)
- `expiresAt` - Session expiration (30 days default)
- `ipAddress`, `userAgent` - Security tracking
- `userId` - Foreign key to user (cascade delete)

### 3. Account Table

```typescript
export const account = sqliteTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }),
	refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
	scope: text('scope'),
	password: text('password'), // For email/password auth
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`...`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.$onUpdate(() => new Date())
		.notNull()
});
```

**Purpose**: Stores authentication provider information

- Email/Password: `password` field (hashed by Better Auth)
- OAuth: `accessToken`, `refreshToken`, `idToken` fields

### 4. Verification Table

```typescript
export const verification = sqliteTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`...`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`...`)
		.$onUpdate(() => new Date())
		.notNull()
});
```

**Purpose**: Email verification, password reset tokens, etc.

---

## Server Configuration

### Auth Factory Function

**File**: `src/lib/server/auth.ts`

```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import type { DB } from '$lib/server/db';

export function createAuth(db: DB) {
	return betterAuth({
		database: drizzleAdapter(db, {
			provider: 'sqlite'
		}),
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false // Set to true in production
		},
		session: {
			expiresIn: 60 * 60 * 24 * 30, // 30 days
			updateAge: 60 * 60 * 24 * 15, // Update if older than 15 days
			cookieCache: {
				enabled: true,
				maxAge: 60 * 5 // Cache for 5 minutes
			}
		},
		plugins: [sveltekitCookies(getRequestEvent)] // MUST be last
	});
}

export type Auth = ReturnType<typeof createAuth>;
```

**Key Configuration Options**:

- **drizzleAdapter**: Connects Better Auth to your D1 database via Drizzle
- **emailAndPassword**: Enables email/password authentication
- **session.expiresIn**: Session duration (30 days)
- **session.updateAge**: Session renewal threshold (15 days)
- **session.cookieCache**: Cache session in cookie for performance
- **sveltekitCookies**: Plugin for automatic SvelteKit cookie management

**Why Factory Function?**

- DB instance is created per-request from `event.locals.db`
- Better Auth instance needs to be created per-request with the correct DB
- Matches the Cloudflare Workers + D1 pattern

### Hooks Integration

**File**: `src/hooks.server.ts`

```typescript
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { createAuth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';

const handleAuth: Handle = async ({ event, resolve }) => {
	// Create Better Auth instance with DB from event.locals
	const auth = createAuth(event.locals.db);

	// Fetch current session from Better Auth
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	// Populate event.locals with session data
	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	} else {
		event.locals.session = null;
		event.locals.user = null;
	}

	// Handle Better Auth routes (/api/auth/*)
	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = sequence(handleDatabase, handleParaglide, handleAuth);
```

**What Happens**:

1. Create auth instance with DB from `event.locals.db`
2. Call `auth.api.getSession()` to validate session from cookies
3. Store `user` and `session` in `event.locals`
4. `svelteKitHandler` automatically handles Better Auth API routes

---

## Client Usage

### Auth Client Setup

**File**: `src/lib/client/auth.ts`

```typescript
import { createAuthClient } from 'better-auth/svelte';

export const authClient = createAuthClient({
	baseURL: '' // Uses same origin by default
});

// Export commonly used methods for convenience
export const {
	signIn,
	signUp,
	signOut,
	useSession,
	updateUser,
	changePassword,
	forgetPassword,
	resetPassword
} = authClient;
```

### Using in Svelte Components

```svelte
<script lang="ts">
	import { signIn, signOut, useSession } from '$lib/client/auth';

	const session = useSession();
</script>

{#if $session.data}
	<p>Welcome, {$session.data.user.name}!</p>
	<button onclick={() => signOut()}>Sign Out</button>
{:else}
	<button
		onclick={() =>
			signIn.email({
				email: 'user@example.com',
				password: 'password123'
			})}
	>
		Sign In
	</button>
{/if}
```

**Reactive Session**:

- `useSession()` returns a Svelte store
- Automatically updates when session changes
- No manual fetching needed

---

## API Endpoints

Better Auth automatically handles these API routes:

### Authentication Endpoints

| Endpoint                  | Method | Purpose                       |
| ------------------------- | ------ | ----------------------------- |
| `/api/auth/sign-in/email` | POST   | Email/password sign in        |
| `/api/auth/sign-up/email` | POST   | Email/password registration   |
| `/api/auth/sign-out`      | POST   | Sign out (invalidate session) |
| `/api/auth/session`       | GET    | Get current session           |

### User Management Endpoints

| Endpoint                    | Method | Purpose                   |
| --------------------------- | ------ | ------------------------- |
| `/api/auth/update-user`     | POST   | Update user profile       |
| `/api/auth/change-password` | POST   | Change password           |
| `/api/auth/forget-password` | POST   | Request password reset    |
| `/api/auth/reset-password`  | POST   | Reset password with token |

**All endpoints are handled automatically by `svelteKitHandler` in hooks.server.ts**

---

## Security Features

### 1. Automatic Token Hashing

Better Auth automatically:

- Generates cryptographically secure session tokens
- Hashes tokens before storing in database (SHA-256)
- Only stores hashed values (database compromise doesn't leak active sessions)

### 2. Secure Cookie Management

Better Auth with `sveltekitCookies` plugin automatically sets:

- `httpOnly: true` - JavaScript can't access (prevents XSS)
- `secure: true` - HTTPS only in production (prevents MITM)
- `sameSite: 'lax'` - Basic CSRF protection
- Proper expiration matching session lifetime

### 3. Session Renewal (Sliding Window)

```typescript
session: {
  expiresIn: 60 * 60 * 24 * 30, // 30 days
  updateAge: 60 * 60 * 24 * 15  // Renew if older than 15 days
}
```

**Behavior**:

- Active users: Sessions automatically renewed every 15 days
- Inactive users: Logged out after 30 days of inactivity
- Smooth UX: No "session expired" errors for regular users

### 4. Password Security

Better Auth automatically:

- Hashes passwords with bcrypt (configurable)
- Validates password strength (configurable)
- Protects against timing attacks

---

## Usage Examples

### Protected Route

**File**: `src/routes/dashboard/+page.server.ts`

```typescript
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Check if user is authenticated
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// User is authenticated - fetch their data
	return {
		user: locals.user,
		session: locals.session
	};
};
```

### Sign Up Form

**File**: `src/routes/signup/+page.svelte`

```svelte
<script lang="ts">
	import { signUp } from '$lib/client/auth';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let name = '';
	let error = '';

	async function handleSignUp() {
		try {
			await signUp.email({
				email,
				password,
				name
			});
			goto('/dashboard');
		} catch (err) {
			error = err.message;
		}
	}
</script>

<form onsubmit={handleSignUp}>
	<input bind:value={name} placeholder="Name" required />
	<input bind:value={email} type="email" placeholder="Email" required />
	<input bind:value={password} type="password" placeholder="Password" required />
	{#if error}<p class="error">{error}</p>{/if}
	<button type="submit">Sign Up</button>
</form>
```

### Sign In Form

**File**: `src/routes/login/+page.svelte`

```svelte
<script lang="ts">
	import { signIn } from '$lib/client/auth';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let error = '';

	async function handleSignIn() {
		try {
			await signIn.email({ email, password });
			goto('/dashboard');
		} catch (err) {
			error = err.message;
		}
	}
</script>

<form onsubmit={handleSignIn}>
	<input bind:value={email} type="email" placeholder="Email" required />
	<input bind:value={password} type="password" placeholder="Password" required />
	{#if error}<p class="error">{error}</p>{/if}
	<button type="submit">Sign In</button>
</form>
```

### Password Reset

```svelte
<script lang="ts">
	import { forgetPassword, resetPassword } from '$lib/client/auth';

	// Step 1: Request password reset
	async function requestReset(email: string) {
		await forgetPassword({ email });
		// User receives email with reset token
	}

	// Step 2: Reset password with token
	async function resetPass(token: string, newPassword: string) {
		await resetPassword({ token, newPassword });
	}
</script>
```

---

## Common Tasks

### Check Authentication Status

```typescript
// In +page.server.ts
export const load: PageServerLoad = async ({ locals }) => {
	return {
		isAuthenticated: !!locals.user,
		user: locals.user
	};
};
```

### Protect API Endpoints

```typescript
// src/routes/api/protected/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// User is authenticated
	return json({ data: 'secret data' });
};
```

### Update User Profile

```typescript
import { updateUser } from '$lib/client/auth';

await updateUser({
	name: 'New Name',
	image: 'https://example.com/avatar.jpg'
});
```

### Sign Out

```svelte
<script lang="ts">
	import { signOut } from '$lib/client/auth';
	import { goto } from '$app/navigation';

	async function handleSignOut() {
		await signOut();
		goto('/');
	}
</script>

<button onclick={handleSignOut}>Sign Out</button>
```

---

## Schema Updates

When Better Auth releases updates or you need to regenerate the schema:

```bash
# 1. Regenerate Better Auth schema
pnpm run auth:generate
# Creates/updates: auth-schema.ts

# 2. Review changes
cat auth-schema.ts

# 3. Manually merge if needed
# Update the Better Auth tables in src/lib/server/db/schema.ts
# Look for the "BETTER AUTH TABLES" comment block

# 4. Generate Drizzle migration
pnpm run db:generate

# 5. Test locally
npx wrangler d1 migrations apply etee --local

# 6. Deploy to production
npx wrangler d1 migrations apply etee --remote
```

**Important**: The CLI generates to `auth-schema.ts` but never modifies your `schema.ts`. You control what goes into your main schema.

---

## Configuration Options

### Enable Email Verification

```typescript
export function createAuth(db: DB) {
	return betterAuth({
		// ...
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: true // Require email verification
		}
		// Add email provider configuration
	});
}
```

### Adjust Session Duration

```typescript
export function createAuth(db: DB) {
	return betterAuth({
		// ...
		session: {
			expiresIn: 60 * 60 * 24 * 7, // 7 days
			updateAge: 60 * 60 * 24 * 3 // Renew if older than 3 days
		}
	});
}
```

### Add OAuth Providers

```typescript
export function createAuth(db: DB) {
	return betterAuth({
		// ...
		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET
			},
			github: {
				clientId: env.GITHUB_CLIENT_ID,
				clientSecret: env.GITHUB_CLIENT_SECRET
			}
		}
	});
}
```

---

## Troubleshooting

### User Not Authenticated After Login

**Possible causes**:

1. Cookie not being set (check browser DevTools)
2. Session not created in database
3. Better Auth API routes not handling correctly

**Debug**:

```typescript
// Add logging in hooks.server.ts
const session = await auth.api.getSession({ headers: event.request.headers });
console.log('Session:', session);
```

### Session Lost on Page Reload

**Possible causes**:

1. Cookie not persisting (check cookie settings)
2. Session expired
3. Database connection issues

**Check**:

- Browser cookies in DevTools → Application → Cookies
- Session in database: `SELECT * FROM session;`

### Better Auth CLI Not Working

**Cause**: Node v25 incompatibility with `better-sqlite3`

**Solution**: Use Node v24 temporarily:

```bash
nvm use 24
pnpm run auth:generate
nvm use 25  # or system version
```

---

## Additional Resources

- **Better Auth Documentation**: https://www.better-auth.com
- **SvelteKit Integration**: https://www.better-auth.com/docs/integrations/sveltekit
- **Drizzle Adapter**: https://www.better-auth.com/docs/adapters/drizzle
- **Cloudflare D1**: https://developers.cloudflare.com/d1

---

_Last updated: 2025-11-11_
