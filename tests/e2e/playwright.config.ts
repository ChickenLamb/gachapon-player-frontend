import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * Tests the complete Gachapon Player Frontend user journeys
 */
export default defineConfig({
	testDir: './',

	// Test execution settings
	fullyParallel: false, // Run tests sequentially to avoid session conflicts
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : 1, // Single worker to avoid session conflicts

	// Reporter configuration
	reporter: [
		['html', { outputFolder: 'tests/e2e/reports/html' }],
		['json', { outputFile: 'tests/e2e/reports/results.json' }],
		['list']
	],

	// Test settings
	use: {
		// Base URL for testing
		baseURL: 'http://localhost:5173',

		// Collect trace on first retry
		trace: 'on-first-retry',

		// Screenshot on failure
		screenshot: 'only-on-failure',

		// Video on failure
		video: 'retain-on-failure',

		// Timeout for actions
		actionTimeout: 10000,

		// Timeout for navigation
		navigationTimeout: 30000
	},

	// Global timeout
	timeout: 60000,

	// Expect timeout
	expect: {
		timeout: 5000
	},

	// Projects for different browsers
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		},
		{
			name: 'mobile-chrome',
			use: { ...devices['Pixel 5'] }
		},
		{
			name: 'mobile-safari',
			use: { ...devices['iPhone 13'] }
		}
	],

	// Dev server configuration
	webServer: {
		command: 'pnpm run dev',
		url: 'http://localhost:5173',
		reuseExistingServer: !process.env.CI,
		timeout: 120000
	}
});
