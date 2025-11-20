import type { Page } from '@playwright/test';

/**
 * Authentication Helper Functions
 * Utilities for managing mock authentication in E2E tests
 */

export interface MockUser {
	id: string;
	name: string;
	email: string;
	token: string;
}

export const MOCK_USERS = {
	alice: {
		id: 'user_mock_alice',
		name: 'Alice Chen',
		email: 'alice@example.com',
		token: 'mock_token_alice'
	},
	bob: {
		id: 'user_mock_bob',
		name: 'Bob Wang',
		email: 'bob@example.com',
		token: 'mock_token_bob'
	},
	charlie: {
		id: 'user_mock_charlie',
		name: 'Charlie Liu',
		email: 'charlie@example.com',
		token: 'mock_token_charlie'
	}
} as const;

/**
 * Authenticate as mock user using production-grade cookie flow
 *
 * Flow matches real-world behavior:
 * 1. Navigate with token parameter (Unity WebView entry point)
 * 2. Server validates token and sets httpOnly session cookie
 * 3. Navigate to dashboard with clean URL (cookie sent automatically)
 * 4. Server validates session from cookie
 *
 * This tests the complete SSR authentication flow with proper session management.
 */
export async function loginAsMockUser(page: Page, user: MockUser): Promise<void> {
	// Step 1: Initial auth with token - server sets session cookie
	await page.goto(`/auth-test?token=${user.token}`);

	// Small wait for cookie to be set
	await page.waitForTimeout(500);

	// Step 2: Navigate to dashboard - cookie sent automatically, clean URL
	await page.goto('/dashboard');

	// Verify dashboard loaded with authentication
	await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 15000 });
}

/**
 * Verify user is authenticated by checking dashboard access
 */
export async function verifyAuthenticated(page: Page): Promise<boolean> {
	try {
		await page.goto('/dashboard');
		await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 5000 });
		return true;
	} catch {
		return false;
	}
}

/**
 * Logout (clear session cookie)
 *
 * Note: In production, you'd call a logout API endpoint that clears the cookie server-side.
 * For mock auth, we can clear cookies client-side for testing purposes.
 */
export async function logout(page: Page): Promise<void> {
	// Clear session cookie
	await page.context().clearCookies();

	// Navigate to home page (unauthenticated)
	await page.goto('/');
}
