# E2E Testing with Playwright

Comprehensive end-to-end test suite for Gachapon Player Frontend, covering all critical user journeys and workflows.

## Test Structure

```
tests/e2e/
├── playwright.config.ts              # Playwright configuration
├── helpers/                          # Test utilities
│   ├── auth.ts                       # Authentication helpers
│   └── navigation.ts                 # Navigation helpers
├── 01-authentication.spec.ts         # Authentication flow tests
├── 02-complete-play-flow.spec.ts     # Critical path: Play flow tests
├── 03-events-exploration.spec.ts     # Events & promotions tests
├── 04-inventory-management.spec.ts   # Inventory tests
├── 05-navigation-routing.spec.ts     # Navigation & routing tests
└── reports/                          # Test reports (generated)
    ├── html/                         # HTML report
    └── results.json                  # JSON results
```

## Prerequisites

1. **Install Playwright browsers** (first time only):

   ```bash
   npx playwright install
   ```

2. **Ensure dev server can start**:
   ```bash
   pnpm run dev
   # Should start on http://localhost:5173
   ```

## Running Tests

### Basic Commands

```bash
# Run all E2E tests (headless)
pnpm run test:e2e

# Run with browser visible
pnpm run test:e2e:headed

# Run in UI mode (interactive)
pnpm run test:e2e:ui

# Run in debug mode (step through tests)
pnpm run test:e2e:debug

# View last test report
pnpm run test:e2e:report
```

### Targeted Testing

```bash
# Run only on Chromium
pnpm run test:e2e:chromium

# Run mobile tests only
pnpm run test:e2e:mobile

# Run specific test file
npx playwright test tests/e2e/01-authentication.spec.ts

# Run tests matching pattern
npx playwright test --grep "payment"

# Run specific test
npx playwright test --grep "Critical Path: Complete play flow"
```

## Test Suites Overview

### 01 - Authentication Flow (8 tests)

**Coverage**: Token extraction, session creation, authentication guards

- Home page loads without authentication
- Protected routes redirect when not authenticated
- Mock user authentication (Alice, Bob, Charlie)
- Session persistence across refreshes
- Session persistence across navigation
- Token parameter authentication
- Auth test page displays mock users

**Critical for**: User session management, WebView integration

---

### 02 - Complete Play Flow (9 tests)

**Coverage**: Dashboard → Machine → Payment → QR → Result → Inventory

**⭐ CRITICAL PATH TEST**: Complete play flow from dashboard to inventory

Additional tests:

- Dashboard displays machine information
- Machine detail page completeness
- Payment price calculations (6% tax)
- QR countdown timer functionality
- Prize result rarity badges
- "Play Again" button navigation

**Critical for**: Core business flow, revenue generation

---

### 03 - Events Exploration (10 tests)

**Coverage**: Events listing, event details, participation, discounts

- Events list displays active events
- Event detail page completeness
- Discount percentage display
- Event requirements visibility
- Participating machines navigation
- Event progress indicators
- Active event badges on dashboard
- Time remaining updates
- Navigation flows

**Critical for**: Engagement, promotions, event-driven sales

---

### 04 - Inventory Management (12 tests)

**Coverage**: Prize listing, details, status filtering, collection

- Inventory displays all won prizes
- Prize detail page completeness
- Status indicators (UNCLAIMED/CLAIMED/COLLECTED)
- Collection QR code generation
- Claim action buttons
- Collection details and timestamps
- Rarity badges in inventory
- Physical vs Digital prize types
- Empty inventory state
- Grid layout display
- Inventory updates after winning

**Critical for**: Prize fulfillment, user satisfaction

---

### 05 - Navigation & Routing (15 tests)

**Coverage**: Bottom nav, back button, deep linking, routing

- Bottom navigation tab switching
- Bottom nav persistence
- Back button navigation
- Deep linking (machines, events, inventory)
- Browser back/forward buttons
- Authentication state preservation
- 404 handling
- Page titles
- Complex navigation flows
- Active tab highlighting
- Broken link detection
- Scroll position reset
- Loading states

**Critical for**: User experience, app usability

---

## Test Coverage Summary

| Test Suite         | Test Count | Critical Path | Coverage              |
| ------------------ | ---------- | ------------- | --------------------- |
| Authentication     | 8          | ✅            | Session management    |
| Complete Play Flow | 9          | ⭐            | Revenue generation    |
| Events             | 10         | ✅            | Engagement features   |
| Inventory          | 12         | ✅            | Prize fulfillment     |
| Navigation         | 15         | ✅            | User experience       |
| **TOTAL**          | **54**     | **5 suites**  | **All user journeys** |

## Configuration

### Browser Projects

Tests run on three browser configurations:

1. **chromium**: Desktop Chrome (primary)
2. **mobile-chrome**: Pixel 5 (Android)
3. **mobile-safari**: iPhone 13 (iOS)

### Timeouts

- Action timeout: 10 seconds
- Navigation timeout: 30 seconds
- Global test timeout: 60 seconds
- QR countdown wait: 130 seconds (special case)

### Execution Settings

- **Parallel execution**: Disabled (sequential to avoid session conflicts)
- **Workers**: 1 (prevents concurrent session issues)
- **Retries**: 2 in CI, 0 locally

## Test Data

Tests use mock data from:

- `src/lib/mock/mockMachines.ts` - 6 gachapon machines
- `src/lib/mock/mockEvents.ts` - 5 promotional events
- `src/lib/mock/mockInventory.ts` - Sample prizes
- `src/lib/mock/mockUsers.ts` - Alice, Bob, Charlie test users

## Writing New Tests

### Using Test Helpers

```typescript
import { test, expect } from '@playwright/test';
import { loginAsMockUser, MOCK_USERS } from './helpers/auth';
import { waitForPageLoad, clickBottomNav } from './helpers/navigation';

test.describe('My Test Suite', () => {
	test.beforeEach(async ({ page }) => {
		// Authenticate as test user
		await loginAsMockUser(page, MOCK_USERS.alice);
	});

	test('My test case', async ({ page }) => {
		// Navigate
		await clickBottomNav(page, 'events');

		// Wait for page load
		await waitForPageLoad(page);

		// Assertions
		await expect(page).toHaveURL('/events');
	});
});
```

### Data Test IDs

All components use `data-testid` attributes for reliable selection:

```html
<!-- Good -->
<button data-testid="play-now-button">Play Now</button>
<div data-testid="machine-card-123">...</div>

<!-- Avoid CSS selectors or text matching -->
```

## Debugging Tests

### Visual Debugging

```bash
# UI Mode (recommended)
pnpm run test:e2e:ui
# Interactive test explorer with timeline

# Headed Mode
pnpm run test:e2e:headed
# Watch tests run in real browser

# Debug Mode
pnpm run test:e2e:debug
# Step through tests with debugger
```

### Screenshots & Videos

On failure, tests automatically capture:

- Screenshot of failure point → `test-results/`
- Video of test execution → `test-results/`
- Trace file for timeline debugging → `test-results/`

View trace:

```bash
npx playwright show-trace test-results/.../trace.zip
```

### Console Logs

Enable verbose logging:

```bash
DEBUG=pw:api npx playwright test
```

## CI/CD Integration

Tests are designed for CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: pnpm run test:e2e

- name: Upload test report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: tests/e2e/reports/html
```

## Known Behaviors (Mock Phase)

These behaviors are expected in mock mode:

1. **Payment always succeeds** - Mock payment after 1-2s delay
2. **QR auto-scan** - QR codes automatically validate after countdown
3. **Random prizes** - Weighted randomization (60% common, 30% rare, 10% legendary)
4. **Event auto-apply** - Event discounts apply without join flow
5. **Session in D1** - Sessions stored in local database

## Troubleshooting

### Dev server not starting

```bash
# Check if port 5173 is already in use
lsof -i :5173

# Kill existing process
kill -9 <PID>

# Restart dev server
pnpm run dev
```

### Tests timing out

- Increase timeout in `playwright.config.ts`
- Check network conditions
- Verify dev server is responding

### Flaky tests

- Check for race conditions
- Add explicit waits with `waitForPageLoad()`
- Verify element visibility before interaction

### Browser installation issues

```bash
# Reinstall browsers
npx playwright install --force

# Install system dependencies (Linux)
npx playwright install-deps
```

## Performance Benchmarks

Expected test execution times (on MacBook Pro M1):

- **Authentication suite**: ~15 seconds
- **Complete Play Flow**: ~3-5 minutes (includes 2-minute QR countdown)
- **Events Exploration**: ~30 seconds
- **Inventory Management**: ~2-3 minutes (includes play flow)
- **Navigation & Routing**: ~1 minute

**Total suite**: ~7-10 minutes (sequential execution)

## Maintenance

### Updating Test Data

When mock data changes:

1. Update mock files in `src/lib/mock/`
2. Verify tests still pass: `pnpm run test:e2e`
3. Update test expectations if needed

### Adding Test IDs

When adding new components:

1. Add `data-testid` attribute
2. Use kebab-case naming
3. Prefix with component type (e.g., `machine-card-`, `event-detail-`)

### Baseline Screenshots

Generate baseline screenshots:

```bash
npx playwright test --update-snapshots
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Test Generator](https://playwright.dev/docs/codegen)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)

## Support

For issues or questions:

1. Check test logs in `test-results/`
2. Review HTML report: `pnpm run test:e2e:report`
3. Run in debug mode: `pnpm run test:e2e:debug`
4. Check dev server logs

---

**Test Status**: ✅ Ready for execution
**Last Updated**: November 20, 2025
**Test Coverage**: Complete user journeys validated
