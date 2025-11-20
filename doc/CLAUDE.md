# Documentation Guide for AI Assistants

> This guide helps AI assistants navigate project documentation and understand when to use each resource.

## Documentation Structure

### 📋 Product Requirements & Planning

#### **PRD.md** (Current, Implementation-Focused)

**File**: [PRD.md](./PRD.md)
**Size**: ~24KB
**Language**: English
**Format**: Technical specification with Mermaid diagrams

**Contents**:

- System architecture with visual diagrams
- Team structure and boundaries (You, Friend A, Friend B, Unity Team)
- Complete user journeys and flows
- Technical implementation details (SvelteKit 5, Cloudflare Workers, D1)
- API integration patterns
- Development timeline and testing strategy

**Use this when**:

- ✅ Implementing features
- ✅ Understanding technical architecture
- ✅ Planning development work
- ✅ Need clear team boundaries
- ✅ Writing code with AI assistance

#### **Gachapon Capsule Machine Module Integration Plan (Embedded in OMMiii App).md** (Original)

**File**: `Gachapon Capsule Machine Module Integration Plan (Embedded in OMMiii App).md`
**Size**: ~356KB
**Language**: Bilingual (English + 繁体中文)
**Format**: Comprehensive planning document with embedded images

**Contents**:

- Complete bilingual documentation
- Visual UI mockups and wireframes
- Broader stakeholder context
- Detailed business requirements
- Original planning questions and discussions

**Use this when**:

- ✅ Need business context and stakeholder perspective
- ✅ Require Chinese language version
- ✅ Want to see original UI mockups
- ✅ Understanding project history and evolution
- ✅ Need comprehensive context beyond implementation

**PRD Evolution Note**:
The condensed PRD.md represents a 93% size reduction while preserving all core technical requirements. The condensation process:

- Replaced prose with Mermaid diagrams
- Removed bilingual duplication (kept English only)
- Removed embedded images (visual mockups)
- Added technical implementation specifics
- Optimized for AI-assisted development
- Maintained all functional requirements

---

### 🔌 API Integration Reference

#### **PLAYER_API_DOCUMENTATION.md**

**File**: [PLAYER_API_DOCUMENTATION.md](./PLAYER_API_DOCUMENTATION.md)
**Size**: ~68KB
**Format**: Complete API reference with TypeScript examples

**Contents**:

- JWT authentication patterns and flows
- Complete API endpoint documentation
  - Machine endpoints
  - QR code generation
  - Payment processing
  - Event/promotion system
- TypeScript client implementation patterns
- Mock service implementation guide
- Error codes and handling

**Use this when**:

- ✅ Implementing API calls
- ✅ Debugging backend integration
- ✅ Understanding data contracts and types
- ✅ Setting up mock services for development
- ✅ Handling API errors and edge cases

---

### 🛠️ Technical Implementation Guide

#### **../CLAUDE.md** (Root Project Guide)

**File**: [../CLAUDE.md](../CLAUDE.md)
**Size**: ~1,183 lines
**Format**: Comprehensive technical reference

**Contents**:

- Database workflows (Drizzle + Wrangler hybrid approach)
- SvelteKit data flow patterns (see DATAFLOW.md)
- TypeScript type organization (app.d.ts vs $lib/types)
- Project structure and file organization
- Development commands and troubleshooting
- Git workflow and code quality hooks
- Cloudflare Workers configuration

**Use this when**:

- ✅ Writing code and implementing features
- ✅ Setting up database workflows
- ✅ Understanding SvelteKit patterns
- ✅ Organizing TypeScript types
- ✅ Running development commands
- ✅ Troubleshooting common issues

---

## Quick Reference for AI Assistants

### When Implementing a New Feature

```
1. Check PRD.md
   → Understand requirements, scope, and architecture

2. Check PLAYER_API_DOCUMENTATION.md
   → Get API contracts and data structures

3. Check ../CLAUDE.md
   → Follow technical patterns and workflows

4. Check ../DATAFLOW.md (referenced in CLAUDE.md)
   → Understand SvelteKit data flow patterns
```

### When Debugging

```
1. ../CLAUDE.md → Troubleshooting section
   → Database issues, common errors

2. PLAYER_API_DOCUMENTATION.md → API error codes
   → Backend integration issues

3. PRD.md → Expected behavior and constraints
   → Verify against requirements
```

### When Seeking Context

```
For Implementation Context:
   → Use PRD.md (condensed, technical)

For Business Context:
   → Reference original PRD (comprehensive, bilingual)

For API Integration:
   → Use PLAYER_API_DOCUMENTATION.md

For Code Patterns:
   → Use ../CLAUDE.md
```

---

## Documentation Decision Tree

```
Need to understand...

├─ "What should this feature do?"
│  └─ → PRD.md (requirements and user journeys)
│
├─ "How does the backend API work?"
│  └─ → PLAYER_API_DOCUMENTATION.md (endpoints and contracts)
│
├─ "How do I implement this in SvelteKit?"
│  └─ → ../CLAUDE.md (technical patterns and workflows)
│
├─ "What was the original business context?"
│  └─ → Original PRD (stakeholder document)
│
└─ "Where are the project docs?"
   └─ → You're reading it! (this file)
```

---

## Documentation Maintenance Guidelines

### Keeping Docs in Sync

**When Code Changes**:

- Update ../CLAUDE.md if new patterns or workflows emerge
- Update PRD.md if requirements evolve
- Update PLAYER_API_DOCUMENTATION.md if API contracts change

**When Requirements Change**:

- Update PRD.md with new requirements
- Keep original PRD for historical reference (don't modify)
- Ensure PLAYER_API_DOCUMENTATION.md reflects backend changes

**When Adding New Documentation**:

- Add reference to this file (doc/CLAUDE.md)
- Update root CLAUDE.md if it's implementation-focused
- Keep this guide simple and scannable

### Documentation Quality Standards

- ✅ Keep PRD.md focused on implementation requirements
- ✅ Keep API docs in sync with backend team (Friend B)
- ✅ Keep CLAUDE.md updated with proven workflows
- ✅ Preserve original PRD for historical context
- ✅ Use clear "when to use" guidance for each doc

---

## Additional Resources

### Referenced in Root CLAUDE.md

- **DATAFLOW.md** - Complete SvelteKit data flow visual guide
- **src/lib/types/README.md** - TypeScript type organization guide

### E2E Test Documentation (Development Phase)

Generated during E2E test development and validation:

- **IMPLEMENTATION_STATUS.md** - Discovery report of complete play flow pages
- **E2E_TEST_PROGRESS.md** - Test implementation progress and results
- **TEST_RESULTS.md** - Quick summary of test suite results
- **JOURNEY_VALIDATION.md** - Comprehensive validation status report
- **E2E_TEST_IMPLEMENTATION_COMPLETE.md** - Final implementation status
- **E2E_TEST_DIAGNOSTIC_REPORT.md** - Detailed diagnostic information

**Note**: These documents were generated during the E2E test development phase to track progress and document findings. They capture the journey of implementing production-grade authentication and validating all user journeys.

### External Documentation

See root CLAUDE.md for official LLM documentation URLs:

- Svelte/SvelteKit: https://svelte.dev/llms-full.txt
- Drizzle ORM: https://orm.drizzle.team/llms-full.txt
- Better Auth: https://www.better-auth.com/llms.txt
- Cloudflare (Workers, D1, etc.): Various cloudflare.com URLs

---

**Document Version**: 1.1
**Last Updated**: November 2025 (Added E2E test documentation section)
**Purpose**: Navigation guide for AI assistants working with project documentation
**Maintainer**: Development team
