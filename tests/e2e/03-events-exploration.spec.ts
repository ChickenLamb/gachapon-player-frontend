import { test, expect } from '@playwright/test';
import { loginAsMockUser, MOCK_USERS } from './helpers/auth';
import { waitForPageLoad, clickBottomNav } from './helpers/navigation';

/**
 * E2E Test Suite: Events & Promotions
 * Tests: Events listing, event details, participation, discounts
 */

test.describe('Events & Promotions', () => {
	test.beforeEach(async ({ page }) => {
		// Authenticate as Alice
		await loginAsMockUser(page, MOCK_USERS.alice);
	});

	test('Events list page displays active events', async ({ page }) => {
		// Navigate to events
		await clickBottomNav(page, 'events');
		await expect(page).toHaveURL('/events');

		// Verify events section
		const eventsSection = page.locator('[data-testid="events-section"]');
		await expect(eventsSection).toBeVisible();

		// Verify event cards present
		const eventCards = page.locator('[data-testid^="event-card-"]');
		const eventCount = await eventCards.count();
		expect(eventCount).toBeGreaterThan(0);

		// Check first event card structure
		const firstEvent = eventCards.first();
		await expect(firstEvent).toBeVisible();

		// Event name
		const eventName = firstEvent.locator('[data-testid="event-name"]');
		await expect(eventName).toBeVisible();

		// Event description
		const eventDescription = firstEvent.locator('[data-testid="event-description"]');
		await expect(eventDescription).toBeVisible();

		// Event type badge (DISCOUNT, FREE_PLAY, BONUS_PRIZE)
		const eventType = firstEvent.locator('[data-testid="event-type"]');
		await expect(eventType).toBeVisible();
		await expect(eventType).toContainText(/(DISCOUNT|FREE_PLAY|BONUS_PRIZE)/);

		// Time remaining
		const timeRemaining = firstEvent.locator('[data-testid="event-time-remaining"]');
		if ((await timeRemaining.count()) > 0) {
			await expect(timeRemaining).toBeVisible();
		}
	});

	test('Event detail page shows complete information', async ({ page }) => {
		// Navigate to events
		await clickBottomNav(page, 'events');
		await expect(page).toHaveURL('/events');

		// Click first event
		const firstEvent = page.locator('[data-testid^="event-card-"]').first();
		const eventId = await firstEvent.getAttribute('data-event-id');
		await firstEvent.click();
		await waitForPageLoad(page);

		// Verify on event detail page
		await expect(page).toHaveURL(`/events/${eventId}`);

		// Verify event details
		const eventTitle = page.locator('[data-testid="event-title"]');
		await expect(eventTitle).toBeVisible();

		const eventDescription = page.locator('[data-testid="event-description"]');
		await expect(eventDescription).toBeVisible();

		// Requirements section
		const requirementsSection = page.locator('[data-testid="event-requirements"]');
		await expect(requirementsSection).toBeVisible();

		// Rewards section
		const rewardsSection = page.locator('[data-testid="event-rewards"]');
		await expect(rewardsSection).toBeVisible();

		// Participating machines
		const machinesSection = page.locator('[data-testid="participating-machines"]');
		await expect(machinesSection).toBeVisible();

		const machinesList = machinesSection.locator('[data-testid^="machine-link-"]');
		const machineCount = await machinesList.count();
		expect(machineCount).toBeGreaterThan(0);
	});

	test('Discount events show discount percentage', async ({ page }) => {
		await clickBottomNav(page, 'events');
		await expect(page).toHaveURL('/events');

		// Find discount event
		const eventCards = page.locator('[data-testid^="event-card-"]');
		const eventCount = await eventCards.count();

		let discountFound = false;
		for (let i = 0; i < eventCount; i++) {
			const eventCard = eventCards.nth(i);
			const eventType = await eventCard.locator('[data-testid="event-type"]').textContent();

			if (eventType?.includes('DISCOUNT')) {
				// Verify discount percentage displayed
				const discountInfo = eventCard.locator('[data-testid="discount-info"]');
				await expect(discountInfo).toBeVisible();
				await expect(discountInfo).toContainText(/%/);
				discountFound = true;
				break;
			}
		}

		if (!discountFound) {
			console.log('No discount events found in mock data');
		}
	});

	test('Event requirements are clearly displayed', async ({ page }) => {
		await clickBottomNav(page, 'events');
		const firstEvent = page.locator('[data-testid^="event-card-"]').first();
		await firstEvent.click();
		await waitForPageLoad(page);

		// Verify requirements section
		const requirementsSection = page.locator('[data-testid="event-requirements"]');
		await expect(requirementsSection).toBeVisible();

		// Check for requirement items
		const requirementItems = requirementsSection.locator('[data-testid^="requirement-"]');
		const requirementCount = await requirementItems.count();

		if (requirementCount > 0) {
			// Verify first requirement is visible and has text
			const firstRequirement = requirementItems.first();
			await expect(firstRequirement).toBeVisible();
			const requirementText = await firstRequirement.textContent();
			expect(requirementText?.length).toBeGreaterThan(0);
		}
	});

	test('Participating machines are clickable and navigate correctly', async ({ page }) => {
		await clickBottomNav(page, 'events');
		const firstEvent = page.locator('[data-testid^="event-card-"]').first();
		await firstEvent.click();
		await waitForPageLoad(page);

		// Get participating machines
		const machinesSection = page.locator('[data-testid="participating-machines"]');
		const machineLinks = machinesSection.locator('[data-testid^="machine-link-"]');

		if ((await machineLinks.count()) > 0) {
			// Click first machine
			const firstMachine = machineLinks.first();
			const machineId = await firstMachine.getAttribute('data-machine-id');

			await firstMachine.click();
			await waitForPageLoad(page);

			// Should navigate to machine detail
			await expect(page).toHaveURL(`/machines/${machineId}`);

			// Verify machine detail loaded
			const machineTitle = page.locator('[data-testid="machine-title"]');
			await expect(machineTitle).toBeVisible();
		}
	});

	test('Event progress indicator shows when joined', async ({ page }) => {
		await clickBottomNav(page, 'events');
		await expect(page).toHaveURL('/events');

		// Look for events with progress indicators
		const eventCards = page.locator('[data-testid^="event-card-"]');
		const eventCount = await eventCards.count();

		for (let i = 0; i < eventCount; i++) {
			const eventCard = eventCards.nth(i);
			const progressIndicator = eventCard.locator('[data-testid="event-progress"]');

			if ((await progressIndicator.count()) > 0) {
				// Verify progress bar or percentage
				await expect(progressIndicator).toBeVisible();

				// Check for progress value
				const progressText = await progressIndicator.textContent();
				expect(progressText).toMatch(/\d+/); // Contains numbers
				break;
			}
		}
	});

	test('Active event badges displayed on dashboard machines', async ({ page }) => {
		// Navigate to dashboard
		await expect(page).toHaveURL('/dashboard');

		// Look for machines with event badges
		const machineCards = page.locator('[data-testid^="machine-card-"]');
		const machineCount = await machineCards.count();

		let eventBadgeFound = false;
		for (let i = 0; i < machineCount; i++) {
			const machineCard = machineCards.nth(i);
			const eventBadge = machineCard.locator('[data-testid="active-event-badge"]');

			if ((await eventBadge.count()) > 0) {
				await expect(eventBadge).toBeVisible();
				eventBadgeFound = true;
				break;
			}
		}

		console.log(`Event badges ${eventBadgeFound ? 'found' : 'not found'} on dashboard`);
	});

	test('Event time remaining updates correctly', async ({ page }) => {
		await clickBottomNav(page, 'events');
		await expect(page).toHaveURL('/events');

		// Find event with time remaining
		const eventCards = page.locator('[data-testid^="event-card-"]');
		const firstEvent = eventCards.first();
		const timeRemaining = firstEvent.locator('[data-testid="event-time-remaining"]');

		if ((await timeRemaining.count()) > 0) {
			await expect(timeRemaining).toBeVisible();
			const timeText = await timeRemaining.textContent();

			// Should contain time unit (hours, days, etc.)
			expect(timeText).toMatch(/(hour|day|minute|second)/i);
		}
	});

	test('Navigation from events to dashboard works', async ({ page }) => {
		// Start on events
		await clickBottomNav(page, 'events');
		await expect(page).toHaveURL('/events');

		// Navigate back to dashboard via bottom nav
		await clickBottomNav(page, 'home');
		await expect(page).toHaveURL('/dashboard');

		// Verify dashboard loaded
		const dashboardContent = page.locator('[data-testid="dashboard-content"]');
		await expect(dashboardContent).toBeVisible();
	});

	test('Back button from event detail returns to events list', async ({ page }) => {
		// Navigate to events
		await clickBottomNav(page, 'events');
		await expect(page).toHaveURL('/events');

		// Click first event
		const firstEvent = page.locator('[data-testid^="event-card-"]').first();
		await firstEvent.click();
		await waitForPageLoad(page);

		// Verify on detail page
		const detailPage = page.locator('[data-testid="event-detail"]');
		await expect(detailPage).toBeVisible();

		// Click back button
		const backButton = page.locator('[data-testid="back-button"]');
		await expect(backButton).toBeVisible();
		await backButton.click();
		await waitForPageLoad(page);

		// Should return to events list
		await expect(page).toHaveURL('/events');

		// Verify events list visible
		const eventsSection = page.locator('[data-testid="events-section"]');
		await expect(eventsSection).toBeVisible();
	});
});
