import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Navigation Helper Functions
 * Utilities for testing navigation flows and bottom nav
 */

export type BottomNavTab = 'home' | 'events' | 'inventory' | 'profile';

/**
 * Click bottom navigation tab
 */
export async function clickBottomNav(page: Page, tab: BottomNavTab): Promise<void> {
	await page.click(`[data-testid="bottom-nav-${tab}"]`);
	await page.waitForLoadState('networkidle');
}

/**
 * Verify bottom nav tab is active
 */
export async function verifyBottomNavActive(page: Page, tab: BottomNavTab): Promise<void> {
	const activeTab = await page.locator(`[data-testid="bottom-nav-${tab}"]`);
	await expect(activeTab).toHaveClass(/active|selected/);
}

/**
 * Click back button
 */
export async function clickBackButton(page: Page): Promise<void> {
	await page.click('[data-testid="back-button"]');
	await page.waitForLoadState('networkidle');
}

/**
 * Verify page title
 */
export async function verifyPageTitle(page: Page, expectedTitle: string): Promise<void> {
	const title = await page.locator('[data-testid="page-title"]').textContent();
	expect(title).toContain(expectedTitle);
}

/**
 * Wait for page load with loading indicator
 */
export async function waitForPageLoad(page: Page): Promise<void> {
	// Wait for loading spinner to appear and disappear
	try {
		await page.waitForSelector('[data-testid="loading-spinner"]', { timeout: 2000 });
		await page.waitForSelector('[data-testid="loading-spinner"]', {
			state: 'detached',
			timeout: 10000
		});
	} catch {
		// Loading spinner may not appear for fast loads
	}
	await page.waitForLoadState('networkidle');
}

/**
 * Assert page is at expected pathname
 * Note: Mock auth is stateless and includes ?token=xxx in URL
 * This helper checks only the pathname, ignoring query parameters
 * @param page - Playwright page object
 * @param expectedPath - Expected pathname (e.g., '/dashboard', '/events/123')
 */
export async function expectPathname(page: Page, expectedPath: string): Promise<void> {
	const url = new URL(page.url());
	await expect(url.pathname).toBe(expectedPath);
}
