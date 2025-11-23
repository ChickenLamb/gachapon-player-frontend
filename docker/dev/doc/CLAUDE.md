# Project Documentation Navigation

Quick navigation guide for all project documentation files.

---

## Quick Start

**New Developer Setup:**

```bash
# Clone repository
git clone <repo-url>
cd gachapon-player-frontend

# Start Docker development environment
cd docker/dev
docker compose watch
```

**Daily Development:**

```bash
cd docker/dev
docker compose watch    # Start with hot reload
```

**Access Application:**

- Via Traefik: https://gachapon-frontend.findhawker.food
- Direct: http://localhost:5173 (after uncommenting ports in docker-compose.yml)

---

## Core Documentation

### [../CLAUDE.md](../CLAUDE.md) - Main Developer Guide

Complete reference for developers working on this project.

**Topics covered:**

- **Docker Development** - Cloudflare Workers development environment
- **Authentication** - Custom mock auth system for Unity WebView
- **Database Reference** - D1 basic configuration (not actively used)
- **Project Structure** - File organization and conventions
- **Common Tasks** - Adding features, testing, troubleshooting
- **Type Organization** - TypeScript type management

**When to use:**

- Setting up development environment
- Understanding project architecture
- Adding new features
- Troubleshooting issues
- Learning the codebase

---

### [../DATAFLOW.md](../DATAFLOW.md) - SvelteKit Architecture

Visual guide to SvelteKit's data flow and execution environments.

**Topics covered:**

- **Complete Data Flow** - app.d.ts → hooks → load → components
- **Server vs Client** - What runs where
- **Load Function Decisions** - When to use +page.server.ts vs +page.ts
- **TypeScript Integration** - Types-first development
- **Authentication Patterns** - Mock auth implementation examples
- **Best Practices** - Correct patterns vs anti-patterns

**When to use:**

- Building new routes or pages
- Debugging data flow issues
- Choosing between server/universal load
- Understanding SvelteKit architecture
- Onboarding new developers

---

### [../AUTH.md](../AUTH.md) - Authentication Reference

Documentation for current mock auth system and future Better Auth integration.

**Topics covered:**

- **Current: Custom Mock Auth** - Token-based auth for Unity WebView
- **Mock Users** - Available test users and tokens
- **Token Flow** - How authentication works
- **Protected Routes** - Implementation examples
- **Future: Better Auth** - Complete Better Auth guide for when ready

**When to use:**

- Testing with different users
- Implementing protected routes
- Understanding authentication flow
- Planning migration to real auth

---

## Type Organization

### [../src/lib/types/README.md](../src/lib/types/README.md)

Guide for organizing TypeScript types in the project.

**Topics covered:**

- **app.d.ts vs $lib/types** - When to use each
- **Type flow patterns** - Integration with data flow
- **Domain organization** - Structuring types as app grows
- **Best practices** - Types-first development

---

## Technology Stack

### Current Architecture

```
SvelteKit 5 + Cloudflare Workers + Mock Services
```

- **Frontend & Backend**: SvelteKit (SSR)
- **Runtime**: Cloudflare Workers (via Docker)
- **Data**: Mock services (src/lib/mocks/)
- **Database**: D1 configured but not actively used
- **Auth**: Custom mock auth for Unity WebView
- **i18n**: Paraglide

### Key Points

- ✅ **Docker development** with full Cloudflare production parity
- ✅ **Mock data services** - no active database queries
- ✅ **Custom mock auth** - Unity WebView token-based flow
- ✅ **Hot reload** - Vite HMR + Docker Compose Watch

---

## Development Workflow

### 1. Setup

```bash
# First time setup
cd docker/dev
docker compose watch
```

### 2. Daily Development

```bash
# Start dev environment
docker compose watch

# View logs
docker compose logs -f

# Stop
docker compose down
```

### 3. Testing Authentication

```bash
# Test as user1
open "https://gachapon-frontend.findhawker.food?token=user1_token"

# Test as user2
open "https://gachapon-frontend.findhawker.food?token=user2_token"
```

### 4. Adding New Features

1. Define types in `src/lib/types/index.ts`
2. Add mock data to `src/lib/mocks/data/`
3. Create mock service in `src/lib/mocks/services/`
4. Build route with server load function
5. Test with mock auth tokens

---

## Quick Reference

| Need                | File                    | Section                 |
| ------------------- | ----------------------- | ----------------------- |
| Docker setup        | CLAUDE.md               | Docker Development      |
| Authentication flow | AUTH.md                 | Custom Mock Auth        |
| SvelteKit patterns  | DATAFLOW.md             | Complete Data Flow      |
| Type organization   | src/lib/types/README.md | When to use each        |
| Protected routes    | AUTH.md                 | Protected Route Example |
| Mock data           | CLAUDE.md               | Common Tasks            |

---

## Additional Resources

### Official Documentation

- **SvelteKit**: https://kit.svelte.dev
- **Cloudflare Workers**: https://developers.cloudflare.com/workers
- **Docker Compose**: https://docs.docker.com/compose/

### LLM-Optimized Docs

See [CLAUDE.md - Official LLM Documentation](../CLAUDE.md#-official-llm-documentation) for complete list of LLM-optimized documentation URLs for:

- Svelte/SvelteKit
- Cloudflare Platform (Workers, D1, KV, R2, etc.)
- Drizzle ORM
- Better Auth (future reference)

---

_This is a SvelteKit 5 project running on Cloudflare Workers with Docker development environment and mock data services._
