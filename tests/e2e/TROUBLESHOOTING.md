# E2E Testing Troubleshooting Guide

## Common Issues and Solutions

### 1. Playwright Browser Installation Timeout

**Symptom**:

```
Error: Request to https://playwright.download.prss.microsoft.com/... timed out after 30000ms
```

**Solution**:

```bash
# The installer automatically retries - just wait for completion
# Or increase timeout manually:
PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT=60000 npx playwright install

# Alternative: Install specific browser only
npx playwright install chromium  # Fastest option for development
```

**Why it happens**: Large browser downloads (60-90MB) can timeout on slower connections. Playwright automatically retries from a mirror CDN.

---

### 2. Dev Server Not Starting

**Symptom**:

```
Error: connect ECONNREFUSED 127.0.0.1:5173
```

**Solution**:

```bash
# Check if port is already in use
lsof -i :5173

# Kill existing process if needed
kill -9 <PID>

# Start dev server manually in separate terminal
pnpm run dev

# Then run tests in another terminal
pnpm run test:e2e
```

---

### 3. Tests Timing Out

**Symptom**:

```
Error: Test timeout of 60000ms exceeded
```

**Solution**:

```bash
# Increase timeout in playwright.config.ts
timeout: 120000,  # 2 minutes instead of 1

# Or for specific long-running tests (like QR countdown)
test('long test', async ({ page }) => {
  test.setTimeout(180000); // 3 minutes
  // test code...
});
```

---

### 4. "data-testid" Not Found

**Symptom**:

```
Error: Locator [data-testid="some-element"] not found
```

**Solution**:

```bash
# 1. Check if element exists in browser
pnpm run test:e2e:headed  # Visual inspection

# 2. Use UI mode to inspect DOM
pnpm run test:e2e:ui

# 3. Add waitForSelector before click
await page.waitForSelector('[data-testid="some-element"]', { timeout: 10000 });
await page.click('[data-testid="some-element"]');

# 4. Check if component needs data-testid added
# Add to component: data-testid="some-element"
```

---

### 5. Session/Authentication Issues

**Symptom**:

```
Expected URL to be /dashboard but got /auth-test
```

**Solution**:

```bash
# Clear browser storage
rm -rf tests/e2e/.auth  # If auth folder exists

# Verify mock auth works
pnpm run dev
# Open http://localhost:5173/auth-test manually
# Click a user card - should redirect to dashboard

# If still failing, check hooks.server.ts handleMockAuth
```

---

### 6. Flaky Tests

**Symptom**: Tests pass sometimes, fail other times

**Solution**:

```typescript
// Add explicit waits
await page.waitForLoadState('networkidle');
await page.waitForTimeout(100); // Last resort only

// Use waitForPageLoad helper
import { waitForPageLoad } from './helpers/navigation';
await waitForPageLoad(page);

// Increase action timeout
await page.click('[data-testid="button"]', { timeout: 15000 });
```

---

### 7. QR Countdown Test Failing

**Symptom**: Test fails at QR countdown step

**Solution**:

```typescript
// Ensure sufficient timeout for 2-minute countdown
await page.waitForURL(/\/result\//, { timeout: 130000 }); // 130s = 2min + 10s buffer

// Or reduce mock countdown duration in development
// Edit mock QR service to use 10 seconds instead of 120
```

---

### 8. Mobile Tests Failing on Desktop

**Symptom**: Mobile viewport tests fail but desktop works

**Solution**:

```bash
# Run mobile tests specifically
pnpm run test:e2e:mobile

# Check viewport in config
mobile-chrome: { ...devices['Pixel 5'] }  # 393x851
mobile-safari: { ...devices['iPhone 13'] } # 390x844

# Verify responsive design in browser DevTools
# Check mobile breakpoints in Tailwind config
```

---

### 9. Screenshots/Videos Not Generated

**Symptom**: No artifacts in test-results/ after failure

**Solution**:

```typescript
// Verify config in playwright.config.ts
use: {
  screenshot: 'only-on-failure',  // Should be set
  video: 'retain-on-failure',     // Should be set
  trace: 'on-first-retry',        // Should be set
}

// Or force screenshot in test
await page.screenshot({ path: 'debug-screenshot.png' });
```

---

### 10. Tests Run Slowly

**Symptom**: Full suite takes >15 minutes

**Solution**:

```bash
# Run only changed tests
npx playwright test --only-changed

# Run specific suite
npx playwright test tests/e2e/01-authentication.spec.ts

# Skip slow tests during development
test.skip('slow test', async ({ page }) => { ... });

# Use faster browser (Chromium only)
pnpm run test:e2e:chromium
```

---

## Quick Diagnostics

### Check System Health

```bash
# Verify Node version (should be 20+)
node --version

# Verify Playwright installation
npx playwright --version

# List installed browsers
npx playwright list-files

# Check dev server
curl http://localhost:5173
# Should return HTML
```

### Debug Single Test

```bash
# Run specific test with UI mode
npx playwright test --grep "Critical Path" --ui

# Run with verbose logging
DEBUG=pw:api npx playwright test

# Step through test
pnpm run test:e2e:debug
# Then select test to debug
```

### Generate Trace

```bash
# Run test with trace
npx playwright test --trace on

# View trace
npx playwright show-trace test-results/.../trace.zip
```

---

## Network Issues

### Slow Downloads

If browser downloads are slow:

```bash
# Use faster mirror
PLAYWRIGHT_DOWNLOAD_HOST=https://playwright.azureedge.net npx playwright install

# Or install from cache (if available)
npx playwright install --no-download
```

### Proxy Issues

If behind corporate proxy:

```bash
# Set proxy environment variables
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080

npx playwright install
```

---

## Getting Help

### Useful Commands

```bash
# Test health check
pnpm run test:e2e:chromium --grep "Home page"
# Should pass quickly if setup is correct

# Generate test
npx playwright codegen http://localhost:5173
# Records actions as test code

# Inspector
PWDEBUG=1 npx playwright test
# Opens Playwright Inspector
```

### Log Files

```bash
# Check test results
cat tests/e2e/reports/results.json | jq

# View HTML report
pnpm run test:e2e:report

# Check browser console logs (in test)
page.on('console', msg => console.log(msg.text()));
```

### Reset Everything

If all else fails:

```bash
# 1. Clear Playwright cache
rm -rf ~/Library/Caches/ms-playwright

# 2. Reinstall Playwright
pnpm install @playwright/test --save-dev

# 3. Reinstall browsers
npx playwright install --force

# 4. Clear test results
rm -rf tests/e2e/reports test-results

# 5. Restart dev server
pnpm run dev

# 6. Run tests fresh
pnpm run test:e2e
```

---

## Platform-Specific Issues

### macOS

**Permission denied errors**:

```bash
# Give Terminal full disk access
# System Preferences → Security & Privacy → Privacy → Full Disk Access
# Add Terminal.app or your IDE
```

**Webkit crashes**:

```bash
# Install Xcode Command Line Tools
xcode-select --install
```

### Linux

**Missing dependencies**:

```bash
# Install system dependencies
npx playwright install-deps

# Or manually install required packages
sudo apt-get install libgbm1 libgtk-3-0 libnss3
```

### Windows

**Path issues**:

```powershell
# Use PowerShell, not CMD
# Or use Git Bash

# Set environment variable
$env:PLAYWRIGHT_BROWSERS_PATH="$HOME\pw-browsers"
npx playwright install
```

---

## Performance Optimization

### Speed Up Tests

```typescript
// 1. Skip unnecessary waits
// Don't use: await page.waitForTimeout(5000)
// Use: await page.waitForSelector('[data-testid="element"]')

// 2. Reuse authentication
// Use test.beforeEach with stored auth state

// 3. Parallel execution (if no session conflicts)
// Set workers: 2 in config

// 4. Reduce retries in development
retries: 0; // Only retry in CI
```

---

## CI/CD Specific

### GitHub Actions Timeout

```yaml
# Increase timeout
- name: Run E2E tests
  run: pnpm run test:e2e
  timeout-minutes: 15 # Default is 360
```

### Artifact Upload

```yaml
# Always upload reports
- name: Upload test report
  if: always() # Run even if tests fail
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: tests/e2e/reports/html
```

---

## Contact Support

If issues persist:

1. **Check Playwright Docs**: https://playwright.dev/docs/troubleshooting
2. **GitHub Issues**: https://github.com/microsoft/playwright/issues
3. **Discord Community**: https://aka.ms/playwright/discord
4. **Stack Overflow**: Tag `playwright`

---

**Last Updated**: November 20, 2025
**Playwright Version**: 1.55+
**Platform**: macOS, Linux, Windows
