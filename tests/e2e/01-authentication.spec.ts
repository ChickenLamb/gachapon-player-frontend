import { test, expect } from '@playwright/test';
import { loginAsMockUser, verifyAuthenticated, MOCK_USERS } from './helpers/auth';

/**
 * E2E Test Suite: Authentication Flow
 * Tests: Token extraction, session creation, authentication guards
 */

test.describe('Authentication Flow', () => {
	test.beforeEach(async ({ page }) => {
		// Start from home page
		await page.goto('/');
	});

	test('Home page loads without authentication', async ({ page }) => {
		// Verify home page renders
		await expect(page).toHaveURL('/');
		await expect(page.locator('h1')).toContainText('Gachapon Player');

		// Verify "Launch Dashboard" button exists (use first() since there are multiple)
		const launchButton = page.locator('[data-testid="launch-dashboard"]').first();
		await expect(launchButton).toBeVisible();
	});

	test('Protected routes redirect to auth when not authenticated', async ({ page }) => {
		// Try to access dashboard directly
		await page.goto('/dashboard');

		// Should redirect to auth or home
		const url = page.url();
		expect(url).toMatch(/\/(auth-test|$)/);
	});

	test('Mock user authentication flow - Alice', async ({ page }) => {
		// Login as Alice
		await loginAsMockUser(page, MOCK_USERS.alice);

		// Verify on dashboard
		await expect(page).toHaveURL('/dashboard');

		// Verify dashboard content loaded
		const dashboardContent = page.locator('[data-testid="dashboard-content"]');
		await expect(dashboardContent).toBeVisible();

		// Verify user context
		const userGreeting = page.locator('[data-testid="user-greeting"]');
		if ((await userGreeting.count()) > 0) {
			await expect(userGreeting).toContainText('Alice');
		}
	});

	test('Mock user authentication flow - Bob', async ({ page }) => {
		await loginAsMockUser(page, MOCK_USERS.bob);

		await expect(page).toHaveURL('/dashboard');
		const dashboardContent = page.locator('[data-testid="dashboard-content"]');
		await expect(dashboardContent).toBeVisible();
	});

	test('Session persists across page refreshes', async ({ page }) => {
		// Login as Alice
		await loginAsMockUser(page, MOCK_USERS.alice);

		// Verify authenticated
		expect(await verifyAuthenticated(page)).toBe(true);

		// Refresh page
		await page.reload();

		// Should still be on dashboard
		await expect(page).toHaveURL('/dashboard');
		const dashboardContent = page.locator('[data-testid="dashboard-content"]');
		await expect(dashboardContent).toBeVisible();
	});

	test('Session persists across navigation', async ({ page }) => {
		// Login as Alice
		await loginAsMockUser(page, MOCK_USERS.alice);

		// Navigate to different protected routes
		await page.goto('/events');
		await expect(page).toHaveURL('/events');

		await page.goto('/inventory');
		await expect(page).toHaveURL('/inventory');

		// Navigate back to dashboard
		await page.goto('/dashboard');
		await expect(page).toHaveURL('/dashboard');

		// Still authenticated
		expect(await verifyAuthenticated(page)).toBe(true);
	});

	test('Token parameter authentication flow', async ({ page }) => {
		// Simulate Unity WebView token parameter
		await page.goto('/?token=mock_token_alice');

		// Should automatically authenticate and redirect
		await page.waitForURL('/dashboard', { timeout: 10000 });

		// Verify authenticated
		expect(await verifyAuthenticated(page)).toBe(true);
	});

	test('Auth test page displays all mock users', async ({ page }) => {
		await page.goto('/auth-test');

		// Verify page title
		await expect(page.locator('h1')).toContainText('Mock Authentication');

		// Verify all three user cards present
		const aliceCard = page.locator('[data-testid="mock-user-user_mock_alice"]');
		const bobCard = page.locator('[data-testid="mock-user-user_mock_bob"]');
		const charlieCard = page.locator('[data-testid="mock-user-user_mock_charlie"]');

		await expect(aliceCard).toBeVisible();
		await expect(bobCard).toBeVisible();
		await expect(charlieCard).toBeVisible();

		// Verify user details
		await expect(aliceCard).toContainText('Alice Chen');
		await expect(bobCard).toContainText('Bob Wang');
		await expect(charlieCard).toContainText('Charlie Liu');
	});
});
