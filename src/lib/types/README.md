# Type Organization Guide

This directory contains all **business logic types** for your application.

## 📂 Directory Structure

```
src/lib/types/
├── index.ts           # Main types export (domain models, API types, utilities)
├── README.md          # This file
└── [your-types].ts    # Add domain-specific type files as needed
```

## 🎯 What Goes Where?

### ✅ app.d.ts (SvelteKit Ambient Types ONLY)

Use `app.d.ts` **ONLY** for the `App` namespace:

```typescript
// app.d.ts
declare global {
	namespace App {
		interface Locals {
			user: User | null;
			db: Database;
		}

		interface PageData {
			// Shared page data type
		}

		interface Error {
			message: string;
			code?: string;
		}

		interface Platform {
			env: {
				DB: D1Database;
			};
		}
	}
}
```

### ✅ $lib/types (Business Logic Types)

Use `$lib/types` for **everything else**:

- **Domain Models**: User, Post, Product, Order
- **API Types**: Request/response shapes, pagination
- **Component Props**: Complex prop type definitions
- **Utility Types**: Shared type helpers and transformations
- **Enums & Constants**: Type-safe constant values

```typescript
// src/lib/types/index.ts
export interface User {
	id: string;
	email: string;
	name: string;
}

export interface Post {
	id: string;
	title: string;
	content: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
```

## 📖 Usage in Components

### Importing Types

```svelte
<script lang="ts">
	import type { User, Post, LoadingState } from '$lib/types';
	import type { PageProps } from './$types'; // SvelteKit generated

	let { data }: { data: PageProps } = $props();
	let loadingState: LoadingState = $state('idle');
</script>
```

### Using with Load Functions

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';
import type { Post } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	const posts: Post[] = await locals.db.select().from(postsTable);

	return {
		posts
	};
};
```

## 🔄 Data Flow with Types

See **[DATAFLOW.md](../../../DATAFLOW.md)** for visual guide on:

- How types flow from `app.d.ts` → hooks → load → components
- When to use server vs universal load functions
- TypeScript integration patterns in the request lifecycle

## 📁 Organizing Types by Domain

As your app grows, organize types by domain:

```
src/lib/types/
├── index.ts              # Re-export all types
├── auth.ts               # Authentication types
├── user.ts               # User domain types
├── post.ts               # Post domain types
├── api.ts                # API request/response types
└── common.ts             # Shared utility types
```

Then re-export from `index.ts`:

```typescript
// src/lib/types/index.ts
export * from './auth';
export * from './user';
export * from './post';
export * from './api';
export * from './common';
```

## 💡 Best Practices

1. **Types-First Development**: Define types before implementation
2. **Explicit Imports**: Use `import type` for type-only imports
3. **Colocate Related Types**: Keep domain types together
4. **Document Complex Types**: Add JSDoc comments for clarity
5. **Use Type Inference**: Let TypeScript infer when obvious
6. **Avoid Type Assertions**: Use type guards instead

## 🚀 Quick Examples

### API Response Type

```typescript
// src/lib/types/api.ts
export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
}

// Usage
import type { ApiResponse, User } from '$lib/types';

const response: ApiResponse<User> = await fetch('/api/user').then((r) => r.json());
```

### Form Status Type

```typescript
// src/lib/types/common.ts
export interface FormStatus {
	state: 'idle' | 'loading' | 'success' | 'error';
	message?: string;
	errors?: Record<string, string>;
}

// Usage in component
let formStatus: FormStatus = $state({ state: 'idle' });
```

### Type Guard

```typescript
// src/lib/types/index.ts
export function isUser(value: unknown): value is User {
	return typeof value === 'object' && value !== null && 'id' in value && 'email' in value;
}
```

## 🔗 Related Documentation

- **[DATAFLOW.md](../../../DATAFLOW.md)** - Data flow and execution environments
- **[CLAUDE.md](../../../CLAUDE.md)** - Complete developer workflows
- **[README.md](../../../README.md)** - Project overview and quick start
