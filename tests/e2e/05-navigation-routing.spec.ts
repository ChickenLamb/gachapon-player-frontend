import { test, expect } from '@playwright/test';
import { loginAsMockUser, MOCK_USERS } from './helpers/auth';
import { waitForPageLoad, clickBottomNav, verifyBottomNavActive } from './helpers/navigation';

/**
 * E2E Test Suite: Navigation & Routing
 * Tests: Bottom nav, back button, breadcrumbs, deep linking
 */

test.describe('Navigation & Routing', () => {
	test.beforeEach(async ({ page }) => {
		// Authenticate as Alice
		await loginAsMockUser(page, MOCK_USERS.alice);
	});

	test('Bottom navigation switches between all tabs', async ({ page }) => {
		// Start on dashboard (Home tab)
		await expect(page).toHaveURL('/dashboard');

		// Click Events tab
		await clickBottomNav(page, 'events');
		await expect(page).toHaveURL('/events');
		await verifyBottomNavActive(page, 'events');

		// Click Inventory tab
		await clickBottomNav(page, 'inventory');
		await expect(page).toHaveURL('/inventory');
		await verifyBottomNavActive(page, 'inventory');

		// Click Home tab
		await clickBottomNav(page, 'home');
		await expect(page).toHaveURL('/dashboard');
		await verifyBottomNavActive(page, 'home');
	});

	test('Bottom nav persists across page navigation', async ({ page }) => {
		await expect(page).toHaveURL('/dashboard');

		// Navigate to machine detail
		const firstMachine = page.locator('[data-testid^="machine-card-"]').first();
		await firstMachine.click();
		await waitForPageLoad(page);

		// Verify bottom nav still visible
		const bottomNav = page.locator('[data-testid="bottom-nav"]');
		await expect(bottomNav).toBeVisible();

		// Verify can still use bottom nav
		await clickBottomNav(page, 'events');
		await expect(page).toHaveURL('/events');
	});

	test('Back button navigation works throughout app', async ({ page }) => {
		// Dashboard → Machine Detail
		const firstMachine = page.locator('[data-testid^="machine-card-"]').first();
		const machineId = await firstMachine.getAttribute('data-machine-id');
		await firstMachine.click();
		await waitForPageLoad(page);

		await expect(page).toHaveURL(`/machines/${machineId}`);

		// Back to dashboard
		const backButton = page.locator('[data-testid="back-button"]');
		await expect(backButton).toBeVisible();
		await backButton.click();
		await waitForPageLoad(page);

		await expect(page).toHaveURL('/dashboard');
	});

	test('Deep linking to machine detail works', async ({ page }) => {
		// Get a machine ID
		const firstMachine = page.locator('[data-testid^="machine-card-"]').first();
		const machineId = await firstMachine.getAttribute('data-machine-id');

		// Navigate directly via URL
		await page.goto(`/machines/${machineId}`);
		await waitForPageLoad(page);

		// Verify machine detail loaded
		await expect(page).toHaveURL(`/machines/${machineId}`);
		const machineTitle = page.locator('[data-testid="machine-title"]');
		await expect(machineTitle).toBeVisible();
	});

	test('Deep linking to event detail works', async ({ page }) => {
		// Navigate to events to get an event ID
		await clickBottomNav(page, 'events');
		const firstEvent = page.locator('[data-testid^="event-card-"]').first();
		const eventId = await firstEvent.getAttribute('data-event-id');

		// Navigate directly via URL
		await page.goto(`/events/${eventId}`);
		await waitForPageLoad(page);

		// Verify event detail loaded
		await expect(page).toHaveURL(`/events/${eventId}`);
		const eventTitle = page.locator('[data-testid="event-title"]');
		await expect(eventTitle).toBeVisible();
	});

	test('Deep linking to inventory prize detail works', async ({ page }) => {
		// Navigate to inventory to get a prize ID
		await clickBottomNav(page, 'inventory');
		const firstItem = page.locator('[data-testid^="inventory-item-"]').first();

		if ((await firstItem.count()) > 0) {
			const prizeId = await firstItem.getAttribute('data-prize-id');

			// Navigate directly via URL
			await page.goto(`/inventory/${prizeId}`);
			await waitForPageLoad(page);

			// Verify prize detail loaded
			await expect(page).toHaveURL(`/inventory/${prizeId}`);
			const prizeName = page.locator('[data-testid="prize-name"]');
			await expect(prizeName).toBeVisible();
		}
	});

	test('Browser back button works correctly', async ({ page }) => {
		// Navigate: Dashboard → Events → Event Detail
		await clickBottomNav(page, 'events');
		await expect(page).toHaveURL('/events');

		const firstEvent = page.locator('[data-testid^="event-card-"]').first();
		await firstEvent.click();
		await waitForPageLoad(page);

		// Use browser back button
		await page.goBack();
		await waitForPageLoad(page);

		// Should be on events list
		await expect(page).toHaveURL('/events');

		// Use browser back again
		await page.goBack();
		await waitForPageLoad(page);

		// Should be on dashboard
		await expect(page).toHaveURL('/dashboard');

		// Use browser forward button
		await page.goForward();
		await waitForPageLoad(page);

		// Should be on events list again
		await expect(page).toHaveURL('/events');
	});

	test('Navigation preserves authentication state', async ({ page }) => {
		// Navigate through multiple pages
		await clickBottomNav(page, 'events');
		await expect(page).toHaveURL('/events');

		await clickBottomNav(page, 'inventory');
		await expect(page).toHaveURL('/inventory');

		// Refresh page
		await page.reload();
		await waitForPageLoad(page);

		// Should still be authenticated and on inventory
		await expect(page).toHaveURL('/inventory');

		// Navigate to another page to confirm session active
		await clickBottomNav(page, 'home');
		await expect(page).toHaveURL('/dashboard');
	});

	test('404 page displays for invalid routes', async ({ page }) => {
		// Navigate to non-existent route
		await page.goto('/this-route-does-not-exist');
		await waitForPageLoad(page);

		// Should show 404 page or redirect
		const pageContent = await page.content();
		const is404 =
			page.url().includes('404') ||
			pageContent.includes('404') ||
			pageContent.includes('not found');

		// If not 404, might redirect to dashboard (acceptable)
		if (!is404) {
			await expect(page).toHaveURL('/dashboard');
		}
	});

	test('Navigation header displays correct title', async ({ page }) => {
		// Dashboard title
		await expect(page).toHaveURL('/dashboard');
		const dashboardTitle = page.locator('[data-testid="page-title"]');
		if ((await dashboardTitle.count()) > 0) {
			const titleText = await dashboardTitle.textContent();
			expect(titleText).toMatch(/dashboard|home|machines/i);
		}

		// Events title
		await clickBottomNav(page, 'events');
		const eventsTitle = page.locator('[data-testid="page-title"]');
		if ((await eventsTitle.count()) > 0) {
			const titleText = await eventsTitle.textContent();
			expect(titleText).toMatch(/events|promotions/i);
		}

		// Inventory title
		await clickBottomNav(page, 'inventory');
		const inventoryTitle = page.locator('[data-testid="page-title"]');
		if ((await inventoryTitle.count()) > 0) {
			const titleText = await inventoryTitle.textContent();
			expect(titleText).toMatch(/inventory|prizes|collection/i);
		}
	});

	test('Complex navigation flow: Dashboard → Machine → Payment → Back', async ({ page }) => {
		// Dashboard
		await expect(page).toHaveURL('/dashboard');

		// Navigate to machine
		const firstMachine = page.locator('[data-testid^="machine-card-"]').first();
		const machineId = await firstMachine.getAttribute('data-machine-id');
		await firstMachine.click();
		await waitForPageLoad(page);

		// Machine detail
		await expect(page).toHaveURL(`/machines/${machineId}`);

		// Navigate to payment
		await page.locator('[data-testid="play-now-button"]').click();
		await waitForPageLoad(page);

		// Payment page
		await expect(page).toHaveURL(`/machines/${machineId}/payment`);

		// Back to machine detail
		const backButton = page.locator('[data-testid="back-button"]');
		await backButton.click();
		await waitForPageLoad(page);

		await expect(page).toHaveURL(`/machines/${machineId}`);

		// Back to dashboard
		await backButton.click();
		await waitForPageLoad(page);

		await expect(page).toHaveURL('/dashboard');
	});

	test('Bottom nav highlights correct active tab on direct navigation', async ({ page }) => {
		// Navigate directly to events via URL
		await page.goto('/events');
		await waitForPageLoad(page);

		// Verify events tab is active
		await verifyBottomNavActive(page, 'events');

		// Navigate directly to inventory
		await page.goto('/inventory');
		await waitForPageLoad(page);

		// Verify inventory tab is active
		await verifyBottomNavActive(page, 'inventory');

		// Navigate directly to dashboard
		await page.goto('/dashboard');
		await waitForPageLoad(page);

		// Verify home tab is active
		await verifyBottomNavActive(page, 'home');
	});

	test('No broken links on main pages', async ({ page }) => {
		const pagesToCheck = ['/dashboard', '/events', '/inventory'];

		for (const pageUrl of pagesToCheck) {
			await page.goto(pageUrl);
			await waitForPageLoad(page);

			// Get all links on page
			const links = page.locator('a[href]');
			const linkCount = await links.count();

			for (let i = 0; i < Math.min(linkCount, 10); i++) {
				// Check first 10 links
				const link = links.nth(i);
				const href = await link.getAttribute('href');

				// Skip external links and anchors
				if (href && !href.startsWith('http') && !href.startsWith('#')) {
					// Click link
					await link.click();
					await waitForPageLoad(page);

					// Verify no 404
					const content = await page.content();
					expect(content).not.toContain('404');
					expect(content).not.toContain('Page not found');

					// Go back
					await page.goBack();
					await waitForPageLoad(page);
				}
			}
		}
	});

	test('Scroll position resets on navigation', async ({ page }) => {
		// Scroll down on dashboard
		await page.evaluate(() => window.scrollTo(0, 500));
		await page.waitForTimeout(500);

		const scrollPosition1 = await page.evaluate(() => window.scrollY);
		expect(scrollPosition1).toBeGreaterThan(0);

		// Navigate to events
		await clickBottomNav(page, 'events');
		await waitForPageLoad(page);

		// Should be scrolled to top
		const scrollPosition2 = await page.evaluate(() => window.scrollY);
		expect(scrollPosition2).toBeLessThan(100);
	});

	test('Navigation loading states display correctly', async ({ page }) => {
		// Click navigation that triggers loading
		const firstMachine = page.locator('[data-testid^="machine-card-"]').first();
		await firstMachine.click();

		// Check for loading indicator (may be very fast)
		const loadingIndicator = page.locator('[data-testid="loading-spinner"]');
		if ((await loadingIndicator.count()) > 0) {
			// If loading indicator appears, verify it disappears
			await loadingIndicator.waitFor({ state: 'detached', timeout: 10000 });
		}

		// Page should be loaded
		const machineTitle = page.locator('[data-testid="machine-title"]');
		await expect(machineTitle).toBeVisible();
	});
});
