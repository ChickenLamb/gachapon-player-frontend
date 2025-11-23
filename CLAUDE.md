# Project Guide for Claude Code

> **Project Workflow Preferences**:
>
> - ✅ Use **Docker Compose Watch** for development (`docker compose watch`)
> - ✅ Use **Mock Data Services** - no active database queries
> - ✅ Use **Custom Mock Auth** for Unity WebView integration

---

## 📖 Project Documentation

**[doc/CLAUDE.md](./doc/CLAUDE.md)** - Documentation Navigation Guide

Central index for all project documentation. Start here to find:

- **Quick Start** - Docker development workflow
- **Core Documentation** - CLAUDE.md, DATAFLOW.md, AUTH.md
- **Type Organization** - src/lib/types/README.md
- **Technology Stack** - SvelteKit 5, Cloudflare Workers, Mock Services

**[DATAFLOW.md](./DATAFLOW.md)** - Complete SvelteKit Data Flow Reference

This visual guide is essential for understanding the project's architecture:

- **Data Flow Diagrams**: See how data moves from `app.d.ts` → `hooks` → `load` → `components`
- **Server vs Client Execution**: Color-coded breakdown of what runs where
- **Load Function Decision Tree**: When to use `+page.server.ts` vs `+page.ts`
- **Server Load → Universal Load Flow**: How data passes between them
- **TypeScript Integration**: Types-first development workflow
- **Authentication Patterns**: Complete auth flow examples
- **Best Practices**: Visual comparison of correct patterns vs anti-patterns

**Use this guide when**:

- Building new features (reference the workflow diagrams)
- Debugging data flow issues (check execution environment)
- Choosing between server/universal load (see decision tree)
- Onboarding new developers (comprehensive visual reference)

**[src/lib/types/README.md](./src/lib/types/README.md)** - Type Organization Guide

Quick reference for organizing TypeScript types in your project:

- **app.d.ts vs $lib/types**: When to use each
- **Type flow patterns**: How types integrate with data flow
- **Domain organization**: Structuring types as your app grows
- **Best practices**: Types-first development approach

---

## 📚 Official LLM Documentation

When you need deep technical reference, these URLs contain complete, up-to-date documentation for the stack:

### Core Framework & Tools

- **Svelte/SvelteKit**: https://svelte.dev/llms-full.txt
- **Svelte MCP Prompts**: https://svelte.dev/docs/mcp/prompts/llms.txt
  - Contains `svelte-task` prompt with workflow instructions
  - Includes documentation index with use cases for each section
  - Specifies autofixer workflow and playground link generation
- **Drizzle ORM**: https://orm.drizzle.team/llms-full.txt
- **Better Auth**: https://www.better-auth.com/llms.txt (for future reference)
- **Vite**: https://vite.dev/llms-full.txt

### Cloudflare Platform

**Core Infrastructure:**

- **Workers** (Runtime): https://developers.cloudflare.com/workers/llms-full.txt
- **Pages** (Deployment): https://developers.cloudflare.com/pages/llms-full.txt
- **Developer Platform**: https://developers.cloudflare.com/developer-platform/llms-full.txt

**Data Storage:**

- **D1** (SQLite Database): https://developers.cloudflare.com/d1/llms-full.txt
- **KV** (Key-Value): https://developers.cloudflare.com/kv/llms-full.txt
- **R2** (Object Storage): https://developers.cloudflare.com/r2/llms-full.txt
- **Durable Objects** (Stateful): https://developers.cloudflare.com/durable-objects/llms-full.txt
- **Vectorize** (Vector DB): https://developers.cloudflare.com/vectorize/llms-full.txt

> 💡 **Usage**: Fetch these URLs when you need authoritative answers about API signatures, configuration options, or framework conventions. The docs are always up-to-date and maintained by the official teams.

---

## Tech Stack Overview

```
SvelteKit 5 + Cloudflare Workers + Mock Services
```

**Architecture**:

- Frontend & Backend: SvelteKit (SSR)
- Runtime: Cloudflare Workers (serverless)
- Data: Mock services (src/lib/mocks/data/)
- Database: D1 configured but not actively queried
- Auth: Custom mock auth for Unity WebView
- i18n: Paraglide

---

## Docker Development with Cloudflare Workers

### Quick Start

```bash
# Navigate to Docker development directory
cd docker/dev

# Start development environment (with hot reload)
docker compose watch

# Container includes:
# - Vite dev server with HMR
# - Cloudflare Workers emulation (workerd)
# - Persistent D1 database state
# - Access via Traefik: https://gachapon-frontend.findhawker.food
```

### Stop Development Environment

```bash
# Stop containers
docker compose down

# Stop and remove volumes (reset database)
docker compose down -v
```

### Architecture

- **Base Image**: `node:22-slim` (Debian for glibc compatibility with workerd)
- **Runtime**: Cloudflare Workers (full production parity)
- **Adapter**: `@sveltejs/adapter-cloudflare`
- **Hot Reload**: Vite HMR for instant code updates
- **Config Restart**: Docker Compose Watch for config file changes
- **Database**: Local D1 in `.wrangler/state/` (persisted in named volume)

### File Watching Strategy

**Vite HMR** (via bind mounts):

- `src/` - Instant code updates
- `static/` - Asset changes

**Docker Compose Watch** (sync + restart):

- `svelte.config.js` - Adapter configuration
- `vite.config.ts` - Build tool configuration
- `tsconfig.json` - TypeScript configuration

**Docker Rebuild** (on changes):

- `package.json` - Dependency changes require rebuild

### Why Debian Instead of Alpine?

The Cloudflare Workers runtime binary (`workerd`) requires **glibc**, which is only available in Debian-based images. Alpine Linux uses **musl libc** and is incompatible.

- ✅ `node:22-slim` (Debian + glibc) - Works with workerd
- ❌ `node:22-alpine` (Alpine + musl) - `workerd` binary fails with ENOENT

### Configuration Files

```
docker/dev/
├── Dockerfile              # Debian-based with workerd support
├── docker-compose.yml      # Traefik integration, named volumes
├── svelte.config.js        # Cloudflare adapter for development
└── vite.config.ts          # Vite + Wrangler integration
```

### Persistent Storage

Named volume `gachapon-wrangler-state` persists:

- Local D1 database state
- Miniflare cache
- Wrangler session data

**Reset database**:

```bash
docker compose down -v  # Remove volumes
docker compose watch     # Recreate fresh database
```

### Accessing the Application

- **Via Traefik** (requires Traefik running): https://gachapon-frontend.findhawker.food
- **Direct access** (uncomment ports in docker-compose.yml): http://localhost:5173

### Logs and Debugging

```bash
# View logs
docker compose -f docker/dev/docker-compose.yml logs -f

# Execute commands in container
docker compose -f docker/dev/docker-compose.yml exec gachapon-player-frontend sh

# Check container status
docker compose -f docker/dev/docker-compose.yml ps
```

---

## Authentication System

### Current Implementation: Custom Mock Auth

The project uses a custom JWT token-based authentication system designed for Unity WebView integration.

**Status**: `USE_MOCK_AUTH = true` in hooks.server.ts

**Why Mock Auth?**

- Unity app integration requires simple token-based flow
- No real backend yet - all data is mocked
- Faster development iteration
- Production auth can be added later

#### Implementation Files

- **src/hooks.server.ts** (line 55): `USE_MOCK_AUTH = true`
- **src/lib/server/auth-mock.ts**: Token validation and mock users

#### Token Flow

```
Unity App → URL with token → SvelteKit validates → Session cookie → Mock user data
```

1. **Unity sends token**: `https://app.com/?token=user1_token`
2. **hooks.server.ts extracts token**: From URL or existing cookie
3. **Validates against mockTokens**: Check if token exists in auth-mock.ts
4. **Creates session**: Store in cookie with 30-day expiration
5. **Populates event.locals.user**: Mock user data available throughout app

#### Available Test Users

```typescript
// Available tokens (from src/lib/server/auth-mock.ts)
'user1_token' → user1
'user2_token' → user2
```

#### Testing Authentication

```bash
# Login as user1
open "https://gachapon-frontend.findhawker.food?token=user1_token"

# Login as user2
open "https://gachapon-frontend.findhawker.food?token=user2_token"
```

#### Protected Route Example

```typescript
// src/routes/dashboard/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/?token=user1_token');
	}

	return {
		user: locals.user
		// Mock data from src/lib/mocks/data/
	};
};
```

### Future Integration: Better Auth

Better Auth is installed but **NOT active** (`USE_MOCK_AUTH = true`).

**When ready to switch**:

1. Set `USE_MOCK_AUTH = false` in hooks.server.ts
2. Follow [AUTH.md](./AUTH.md) for Better Auth configuration
3. Update Unity integration to send real JWT tokens
4. Migrate mock data to real database queries

See [AUTH.md](./AUTH.md) for complete Better Auth documentation.

---

## Request Flow

```
User Request (Unity WebView)
    ↓
Cloudflare Workers
    ↓
SvelteKit Request Handler
    ↓
1. handleDatabase()
   → Creates DB from platform.env.DB
   → Stores in event.locals.db
    ↓
2. handleParaglide()
   → i18n processing
    ↓
3. handleAuth()
   → Validates token from URL or cookie (MOCK AUTH)
   → Stores user in event.locals.user
   → Stores session in cookie
    ↓
4. Route Handler (+server.ts / +page.server.ts)
   → Access user via event.locals.user
   → Access mock data from src/lib/mocks/data/
    ↓
Response to User
```

---

## D1 Database (Future Integration Reference)

### Currently Not Used

This project uses **mock data services**. D1 database is configured but **not actively queried**.

All data comes from:

- `src/lib/mocks/data/` - Mock data files
- `src/lib/mocks/services/` - Mock service functions

### Basic Configuration

- **Database Name**: `gachapon-player-frontend-db`
- **Binding**: `DB` (in wrangler.jsonc)
- **ORM**: Drizzle ORM (configured but not used)
- **Schema**: `src/lib/server/db/schema.ts`

### Database Access Pattern

```typescript
// In +server.ts, hooks.server.ts, or +page.server.ts
const db = event.locals.db; // Database instance from platform binding

// Type-safe queries (when you start using D1)
const users = await db.select().from(userTable);
```

**How it works**:

1. `hooks.server.ts` → `handleDatabase` creates DB instance from `platform.env.DB`
2. Stored in `event.locals.db`
3. Available in all server code
4. No API keys needed (uses Wrangler binding)

### Schema Location

```
src/lib/server/db/
├── schema.ts          # Table definitions (TypeScript)
└── index.ts           # DB factory function
```

### Quick Commands (For Future Use)

```bash
# Generate migration from schema changes
pnpm run db:generate

# Apply migration locally (Docker environment)
npx wrangler d1 migrations apply gachapon-player-frontend-db --local

# Apply migration to production
npx wrangler d1 migrations apply gachapon-player-frontend-db --remote

# Execute SQL locally
npx wrangler d1 execute gachapon-player-frontend-db --command "SELECT * FROM user" --local

# Execute SQL in production
npx wrangler d1 execute gachapon-player-frontend-db --command "SELECT * FROM user" --remote

# Export production backup
npx wrangler d1 export gachapon-player-frontend-db --output backup.sql --remote
```

### Drizzle Studio (Local Database Inspection)

When you start using D1, you can inspect the local database:

```bash
# 1. Make sure dev environment created the database
docker compose watch  # Creates .wrangler/state/... database
# Stop with Ctrl+C

# 2. Open Drizzle Studio (auto-detects local database)
pnpm run db:studio    # Opens GUI at http://localhost:4983
```

**No API credentials needed** for local inspection! The script automatically finds and connects to your local D1 database.

### When You Need D1

See [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/llms-full.txt) for:

- Production database setup and deployment
- Migration workflow best practices
- Drizzle ORM integration patterns
- Query optimization and performance
- Backup and restore strategies

---

## Project Structure

```
src/
├── routes/                      # SvelteKit pages & API
│   ├── +layout.svelte          # Root layout
│   ├── +page.svelte            # Homepage
│   ├── +page.server.ts         # Server data loading
│   └── +server.ts              # API endpoints
├── lib/
│   ├── types/                  # Business logic types (⚠️ NOT app.d.ts types!)
│   │   ├── index.ts            # Domain models, API types, utilities
│   │   └── README.md           # Type organization guide
│   ├── mocks/                  # Mock data and services
│   │   ├── data/               # Mock data files
│   │   └── services/           # Mock service functions
│   └── server/                 # Server-only code (⚠️ never exposed to client)
│       ├── db/
│       │   ├── schema.ts       # Database schema (TypeScript)
│       │   └── index.ts        # DB factory (createDB)
│       └── auth-mock.ts        # Mock authentication logic
├── hooks.server.ts             # Request middleware
│   ├── handleDatabase          # Initialize DB from platform.env.DB
│   ├── handleParaglide         # i18n middleware
│   └── handleAuth              # Session validation (MOCK)
└── app.d.ts                    # SvelteKit App namespace types ONLY

docker/dev/                     # Docker development environment
├── Dockerfile                  # Debian-based with workerd support
├── docker-compose.yml          # Traefik integration, named volumes
├── svelte.config.js            # Cloudflare adapter config
└── vite.config.ts              # Vite + Wrangler integration

drizzle/
└── migrations/                 # SQL migration files (git tracked, for future use)

scripts/                        # Automation scripts (Node.js)
└── db-studio-autodetect.mjs   # Auto-detect local D1 for Drizzle Studio

wrangler.jsonc                  # Cloudflare Workers config
drizzle.config.*.ts             # Drizzle ORM configurations
```

---

## Important Notes

### Server-Only Code

```typescript
// ✅ Good: Access DB in server functions
export async function load({ locals }) {
	const users = await locals.db.select().from(userTable);
	return { users };
}

// ❌ Bad: Never try to access DB in client code
// DB is only available in:
// - +server.ts
// - +page.server.ts
// - hooks.server.ts
// - src/lib/server/*
```

### Mock Data Pattern

```typescript
// ✅ Good: Use mock services
import { mockUserService } from '$lib/mocks/services/user';

export async function load({ locals }) {
	const userData = mockUserService.getUserProfile(locals.user.id);
	return { userData };
}

// ❌ Bad: Don't query database directly yet
// Database is configured but not actively used
```

---

## Common Tasks

### Adding a New Feature with Mock Data

1. **Define types** in `src/lib/types/index.ts`
2. **Add mock data** to `src/lib/mocks/data/`
3. **Create mock service** in `src/lib/mocks/services/`
4. **Build route** with server load function
5. **Test** with mock auth tokens

### Testing with Different Users

```bash
# User 1
open "https://gachapon-frontend.findhawker.food?token=user1_token"

# User 2
open "https://gachapon-frontend.findhawker.food?token=user2_token"
```

### Adding Protected Route

```typescript
// src/routes/protected/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Check authentication
	if (!locals.user) {
		throw redirect(302, '/?token=user1_token');
	}

	// User is authenticated - return data
	return {
		user: locals.user
	};
};
```

### Creating API Endpoint

```typescript
// src/routes/api/data/+server.ts
import { json } from '@sveltejs/kit';
import { mockDataService } from '$lib/mocks/services/data';

export async function GET({ locals }) {
	// Optional: Check authentication
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Get mock data
	const data = mockDataService.getData(locals.user.id);
	return json(data);
}
```

---

## Troubleshooting

### "workerd ENOENT" Error

**Cause**: Using Alpine Linux base image (musl libc incompatible with workerd)
**Solution**: Use `node:22-slim` (Debian with glibc) in Dockerfile

### Docker Compose Watch Not Updating

**Issue**: Changes not reflected
**Solutions**:

- Check if file is in bind mount (src/, static/) or watch section (config files)
- For package.json changes: rebuild with `docker compose build`
- For src/ changes: Vite HMR should update instantly
- For config changes: Docker Watch should restart container

### "DB is not defined"

**Cause**: Trying to use database at module level
**Solution**: Always access via `event.locals.db` in request context (though currently using mock data)

### Cannot Access Application

**Issue**: Can't reach https://gachapon-frontend.findhawker.food
**Solutions**:

- Check Traefik is running on traefik-net network
- Check container is healthy: `docker compose ps`
- Try direct access: uncomment ports in docker-compose.yml, use http://localhost:5173

---

## Code Quality & Git Hooks

### Pre-Commit Hooks (Automatic)

**What happens on `git commit`**:

1. Husky triggers pre-commit hook
2. Lint-staged runs on staged files only
3. Auto-fixes issues when possible
4. Blocks commit if unfixable errors found

**Checks performed**:

```bash
# JavaScript/TypeScript/Svelte files:
- prettier --write        # Auto-format code
- eslint --fix           # Auto-fix linting issues

# JSON/Markdown/CSS/HTML files:
- prettier --write        # Auto-format

# Svelte files (additional):
- svelte-check           # Type checking
```

**Configuration**:

- Pre-commit hook: `.husky/pre-commit`
- Lint rules: `package.json` → `lint-staged`
- Skip hooks: `git commit --no-verify` (not recommended)

**Manual commands** (run without commit):

```bash
pnpm run lint      # Check for issues (no auto-fix)
pnpm run format    # Format all files
pnpm run check     # TypeScript + Svelte type checking
```

---

## TypeScript Type Organization

### Understanding Type Locations

**Critical Distinction**: `app.d.ts` vs `$lib/types` serve completely different purposes.

### app.d.ts (SvelteKit Ambient Types ONLY)

Use `app.d.ts` **exclusively** for the `App` namespace:

```typescript
// app.d.ts
import type { User } from '$lib/types';

declare global {
	namespace App {
		// Data available in event.locals (populated by hooks)
		interface Locals {
			user: User | null;
			db: Database;
		}

		// Custom error shape for handleError
		interface Error {
			message: string;
			code?: string;
		}

		// Page data type (from load functions)
		interface PageData {
			// Leave empty or add shared page data type
		}

		// Platform bindings (Cloudflare Workers)
		interface Platform {
			env: {
				DB: D1Database;
			};
		}
	}
}

export {};
```

**What goes here**:

- ✅ `App.Locals` - Data flowing through `event.locals`
- ✅ `App.Error` - Custom error shapes
- ✅ `App.PageData` - Shared page data types
- ✅ `App.Platform` - Platform-specific bindings

**What does NOT go here**:

- ❌ Domain models (User, Post, Product)
- ❌ API request/response types
- ❌ Component prop types
- ❌ Utility types
- ❌ Any non-App namespace types

### $lib/types (Business Logic Types)

Use `src/lib/types/` for **all other types**:

```typescript
// src/lib/types/index.ts
export interface User {
	id: string;
	email: string;
	name: string;
	role: 'admin' | 'user';
}

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
```

**What goes here**:

- ✅ Domain models and entities
- ✅ API request/response shapes
- ✅ Component prop types
- ✅ Utility types and type helpers
- ✅ Enums and constants
- ✅ Type guards and validators

For detailed type organization guide, see **[src/lib/types/README.md](./src/lib/types/README.md)**.
For visual data flow understanding with types, see **[DATAFLOW.md](./DATAFLOW.md)**.

---

## When Creating New Features

1. ✅ **Define types first** ($lib/types/index.ts)
2. ✅ **Add mock data** (src/lib/mocks/data/)
3. ✅ **Create mock service** (src/lib/mocks/services/)
4. ✅ **Write route logic** (+server.ts, +page.server.ts)
5. ✅ **Test with mock auth** (use ?token=user1_token)
6. ✅ **Test thoroughly** (docker compose watch)

---

## Summary

**Current workflow**: Docker development with mock services

**Key tools**:

- `docker compose watch` - Development environment with hot reload
- Mock auth - Simple token-based authentication
- Mock services - All data from src/lib/mocks/

**Remember**:

- Database configured but NOT actively used
- All data from mock services
- Auth is mock-based for Unity WebView
- Docker provides production parity (Cloudflare Workers)
- Always test in Docker environment

---

## Additional Resources

- SvelteKit Docs: https://kit.svelte.dev
- Cloudflare Workers: https://developers.cloudflare.com/workers
- Docker Compose: https://docs.docker.com/compose/
- Traefik: https://doc.traefik.io/traefik/

---

_This project uses Docker Compose for development with full Cloudflare Workers emulation and mock data services._
