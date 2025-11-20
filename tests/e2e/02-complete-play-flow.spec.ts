import { test, expect } from '@playwright/test';
import { loginAsMockUser, MOCK_USERS } from './helpers/auth';
import { waitForPageLoad } from './helpers/navigation';

/**
 * E2E Test Suite: Complete Play Flow
 * Tests: Dashboard → Machine → Payment → QR → Result → Inventory
 * This is the critical path for the gachapon application
 */

test.describe('Complete Play Flow', () => {
	test.beforeEach(async ({ page }) => {
		// Authenticate as Alice for all play flow tests
		await loginAsMockUser(page, MOCK_USERS.alice);
	});

	test('Critical Path: Complete play flow from dashboard to inventory', async ({ page }) => {
		// STEP 1: Dashboard - Verify machines displayed
		await expect(page).toHaveURL('/dashboard');
		const machineCards = page.locator('[data-testid^="machine-card-"]');
		const machineCount = await machineCards.count();
		expect(machineCount).toBeGreaterThan(0);

		// STEP 2: Select first available machine
		const firstMachine = machineCards.first();
		await expect(firstMachine).toBeVisible();

		// Extract machine ID from card
		const machineId = await firstMachine.getAttribute('data-machine-id');
		expect(machineId).toBeTruthy();

		// Click machine card
		await firstMachine.click();
		await waitForPageLoad(page);

		// STEP 3: Machine Detail - Verify page loaded
		await expect(page).toHaveURL(`/machines/${machineId}`);

		// Verify machine details displayed
		const machineTitle = page.locator('[data-testid="machine-title"]');
		await expect(machineTitle).toBeVisible();

		const machineDescription = page.locator('[data-testid="machine-description"]');
		await expect(machineDescription).toBeVisible();

		// Verify prizes displayed
		const prizeList = page.locator('[data-testid="prize-list"]');
		await expect(prizeList).toBeVisible();

		// Verify play button
		const playButton = page.locator('[data-testid="play-now-button"]');
		await expect(playButton).toBeVisible();
		await expect(playButton).toBeEnabled();

		// STEP 4: Click Play Now
		await playButton.click();
		await waitForPageLoad(page);

		// STEP 5: Payment Page - Verify payment preview
		await expect(page).toHaveURL(`/machines/${machineId}/payment`);

		// Verify price breakdown
		const subtotal = page.locator('[data-testid="payment-subtotal"]');
		const tax = page.locator('[data-testid="payment-tax"]');
		const total = page.locator('[data-testid="payment-total"]');

		await expect(subtotal).toBeVisible();
		await expect(tax).toBeVisible();
		await expect(total).toBeVisible();

		// Verify confirm button
		const confirmButton = page.locator('[data-testid="confirm-payment-button"]');
		await expect(confirmButton).toBeVisible();
		await expect(confirmButton).toBeEnabled();

		// STEP 6: Confirm payment
		await confirmButton.click();

		// Wait for payment processing
		const loadingIndicator = page.locator('[data-testid="payment-processing"]');
		if ((await loadingIndicator.count()) > 0) {
			await loadingIndicator.waitFor({ state: 'detached', timeout: 5000 });
		}

		await waitForPageLoad(page);

		// STEP 7: QR Display Page - Verify QR generated
		await expect(page.url()).toContain(`/machines/${machineId}/qr/`);

		// Verify QR code displayed
		const qrCode = page.locator('[data-testid="qr-code"]');
		await expect(qrCode).toBeVisible();

		// Verify countdown timer
		const countdown = page.locator('[data-testid="qr-countdown"]');
		await expect(countdown).toBeVisible();
		await expect(countdown).toContainText(/\d+/); // Contains numbers

		// Wait for auto-navigation to result (max 2 minutes + buffer)
		await page.waitForURL(/\/machines\/.*\/result\/.*/, { timeout: 130000 });

		// STEP 8: Prize Result Page - Verify prize displayed
		await expect(page.url()).toContain(`/machines/${machineId}/result/`);

		// Verify prize image
		const prizeImage = page.locator('[data-testid="prize-image"]');
		await expect(prizeImage).toBeVisible();

		// Verify prize name
		const prizeName = page.locator('[data-testid="prize-name"]');
		await expect(prizeName).toBeVisible();

		// Verify rarity badge
		const rarityBadge = page.locator('[data-testid="prize-rarity"]');
		await expect(rarityBadge).toBeVisible();
		await expect(rarityBadge).toContainText(/(COMMON|RARE|LEGENDARY)/);

		// STEP 9: Navigate to Inventory
		const viewInventoryButton = page.locator('[data-testid="view-inventory-button"]');
		await expect(viewInventoryButton).toBeVisible();
		await viewInventoryButton.click();
		await waitForPageLoad(page);

		// STEP 10: Inventory Page - Verify prize in inventory
		await expect(page).toHaveURL('/inventory');

		const inventoryItems = page.locator('[data-testid^="inventory-item-"]');
		const inventoryCount = await inventoryItems.count();
		expect(inventoryCount).toBeGreaterThan(0);

		// Verify newly won prize is in inventory
		const newPrize = inventoryItems.first();
		await expect(newPrize).toBeVisible();
	});

	test('Dashboard displays all machine information correctly', async ({ page }) => {
		await expect(page).toHaveURL('/dashboard');

		// Verify machines section
		const machinesSection = page.locator('[data-testid="machines-section"]');
		await expect(machinesSection).toBeVisible();

		// Check first machine card has all required elements
		const firstMachine = page.locator('[data-testid^="machine-card-"]').first();

		// Machine image
		const machineImage = firstMachine.locator('[data-testid="machine-image"]');
		await expect(machineImage).toBeVisible();

		// Machine name
		const machineName = firstMachine.locator('[data-testid="machine-name"]');
		await expect(machineName).toBeVisible();

		// Status badge
		const statusBadge = firstMachine.locator('[data-testid="machine-status"]');
		await expect(statusBadge).toBeVisible();
		await expect(statusBadge).toContainText(/(AVAILABLE|IN_USE|MAINTENANCE)/);

		// Price display
		const priceDisplay = firstMachine.locator('[data-testid="machine-price"]');
		await expect(priceDisplay).toBeVisible();
		await expect(priceDisplay).toContainText(/\$/);

		// Featured prizes preview
		const featuredPrizes = firstMachine.locator('[data-testid="featured-prizes"]');
		await expect(featuredPrizes).toBeVisible();
	});

	test('Machine detail page shows complete information', async ({ page }) => {
		// Navigate to first machine
		const firstMachine = page.locator('[data-testid^="machine-card-"]').first();
		const machineId = await firstMachine.getAttribute('data-machine-id');
		await firstMachine.click();
		await waitForPageLoad(page);

		await expect(page).toHaveURL(`/machines/${machineId}`);

		// Verify all sections present
		const machineImage = page.locator('[data-testid="machine-image"]');
		await expect(machineImage).toBeVisible();

		const machineTitle = page.locator('[data-testid="machine-title"]');
		await expect(machineTitle).toBeVisible();

		const machineLocation = page.locator('[data-testid="machine-location"]');
		if ((await machineLocation.count()) > 0) {
			await expect(machineLocation).toBeVisible();
		}

		const machineDescription = page.locator('[data-testid="machine-description"]');
		await expect(machineDescription).toBeVisible();

		const statusBadge = page.locator('[data-testid="machine-status"]');
		await expect(statusBadge).toBeVisible();

		const priceDisplay = page.locator('[data-testid="machine-price"]');
		await expect(priceDisplay).toBeVisible();

		// Verify prizes section
		const prizesSection = page.locator('[data-testid="prizes-section"]');
		await expect(prizesSection).toBeVisible();

		const prizeList = page.locator('[data-testid="prize-list"]');
		await expect(prizeList).toBeVisible();

		const prizes = prizeList.locator('[data-testid^="prize-item-"]');
		const prizeCount = await prizes.count();
		expect(prizeCount).toBeGreaterThan(0);

		// Check first prize has rarity badge
		const firstPrize = prizes.first();
		const rarityBadge = firstPrize.locator('[data-testid="prize-rarity"]');
		await expect(rarityBadge).toBeVisible();

		// Verify back button
		const backButton = page.locator('[data-testid="back-button"]');
		await expect(backButton).toBeVisible();
	});

	test('Payment page calculates prices correctly', async ({ page }) => {
		// Navigate to machine and initiate payment
		const firstMachine = page.locator('[data-testid^="machine-card-"]').first();
		const machineId = await firstMachine.getAttribute('data-machine-id');
		await firstMachine.click();
		await waitForPageLoad(page);

		const playButton = page.locator('[data-testid="play-now-button"]');
		await playButton.click();
		await waitForPageLoad(page);

		await expect(page).toHaveURL(`/machines/${machineId}/payment`);

		// Get price values
		const subtotalText = await page.locator('[data-testid="payment-subtotal"]').textContent();
		const taxText = await page.locator('[data-testid="payment-tax"]').textContent();
		const totalText = await page.locator('[data-testid="payment-total"]').textContent();

		// Extract numbers (remove $ and other characters)
		const subtotal = parseFloat(subtotalText?.replace(/[^0-9.]/g, '') || '0');
		const tax = parseFloat(taxText?.replace(/[^0-9.]/g, '') || '0');
		const total = parseFloat(totalText?.replace(/[^0-9.]/g, '') || '0');

		// Verify tax is 6% of subtotal
		const expectedTax = Math.round(subtotal * 0.06 * 100) / 100;
		expect(Math.abs(tax - expectedTax)).toBeLessThan(0.01);

		// Verify total = subtotal + tax (considering discounts)
		expect(total).toBeGreaterThanOrEqual(subtotal + tax - 0.01);
	});

	test('QR countdown timer counts down correctly', async ({ page }) => {
		// Navigate through to QR page
		const firstMachine = page.locator('[data-testid^="machine-card-"]').first();
		const machineId = await firstMachine.getAttribute('data-machine-id');
		await firstMachine.click();
		await waitForPageLoad(page);

		await page.locator('[data-testid="play-now-button"]').click();
		await waitForPageLoad(page);

		await page.locator('[data-testid="confirm-payment-button"]').click();
		await waitForPageLoad(page);

		await expect(page.url()).toContain(`/machines/${machineId}/qr/`);

		// Get initial countdown value
		const countdownText1 = await page.locator('[data-testid="qr-countdown"]').textContent();
		const seconds1 = parseInt(countdownText1?.replace(/[^0-9]/g, '') || '0');

		// Wait 2 seconds
		await page.waitForTimeout(2000);

		// Get updated countdown value
		const countdownText2 = await page.locator('[data-testid="qr-countdown"]').textContent();
		const seconds2 = parseInt(countdownText2?.replace(/[^0-9]/g, '') || '0');

		// Verify countdown decreased
		expect(seconds2).toBeLessThan(seconds1);
		expect(seconds1 - seconds2).toBeGreaterThanOrEqual(1);
	});

	test('Prize result shows correct rarity badges', async ({ page }) => {
		// Complete play flow to result page
		const firstMachine = page.locator('[data-testid^="machine-card-"]').first();
		await firstMachine.click();
		await waitForPageLoad(page);

		await page.locator('[data-testid="play-now-button"]').click();
		await waitForPageLoad(page);

		await page.locator('[data-testid="confirm-payment-button"]').click();
		await waitForPageLoad(page);

		// Wait for auto-navigation to result
		await page.waitForURL(/\/machines\/.*\/result\/.*/, { timeout: 130000 });

		// Verify rarity badge
		const rarityBadge = page.locator('[data-testid="prize-rarity"]');
		await expect(rarityBadge).toBeVisible();

		const rarityText = await rarityBadge.textContent();
		expect(rarityText).toMatch(/(COMMON|RARE|LEGENDARY)/);

		// Verify badge has appropriate color/style based on rarity
		const badgeClass = await rarityBadge.getAttribute('class');
		if (rarityText?.includes('LEGENDARY')) {
			expect(badgeClass).toContain('legendary');
		} else if (rarityText?.includes('RARE')) {
			expect(badgeClass).toContain('rare');
		} else {
			expect(badgeClass).toContain('common');
		}
	});

	test('Play Again button returns to machine detail', async ({ page }) => {
		// Complete play flow to result page
		const firstMachine = page.locator('[data-testid^="machine-card-"]').first();
		const machineId = await firstMachine.getAttribute('data-machine-id');
		await firstMachine.click();
		await waitForPageLoad(page);

		await page.locator('[data-testid="play-now-button"]').click();
		await waitForPageLoad(page);

		await page.locator('[data-testid="confirm-payment-button"]').click();
		await waitForPageLoad(page);

		await page.waitForURL(/\/machines\/.*\/result\/.*/, { timeout: 130000 });

		// Click Play Again
		const playAgainButton = page.locator('[data-testid="play-again-button"]');
		await expect(playAgainButton).toBeVisible();
		await playAgainButton.click();
		await waitForPageLoad(page);

		// Should return to machine detail page
		await expect(page).toHaveURL(`/machines/${machineId}`);

		// Verify can play again
		const playButton = page.locator('[data-testid="play-now-button"]');
		await expect(playButton).toBeVisible();
		await expect(playButton).toBeEnabled();
	});
});
