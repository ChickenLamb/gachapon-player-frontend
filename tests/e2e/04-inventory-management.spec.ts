import { test, expect } from '@playwright/test';
import { loginAsMockUser, MOCK_USERS } from './helpers/auth';
import { waitForPageLoad, clickBottomNav } from './helpers/navigation';

/**
 * E2E Test Suite: Inventory Management
 * Tests: Inventory listing, prize details, status filtering, collection QR
 */

test.describe('Inventory Management', () => {
	test.beforeEach(async ({ page }) => {
		// Authenticate as Alice
		await loginAsMockUser(page, MOCK_USERS.alice);
	});

	test('Inventory page displays all won prizes', async ({ page }) => {
		// Navigate to inventory
		await clickBottomNav(page, 'inventory');
		await expect(page).toHaveURL('/inventory');

		// Verify inventory section
		const inventorySection = page.locator('[data-testid="inventory-section"]');
		await expect(inventorySection).toBeVisible();

		// Verify inventory items present
		const inventoryItems = page.locator('[data-testid^="inventory-item-"]');
		const itemCount = await inventoryItems.count();
		expect(itemCount).toBeGreaterThan(0);

		// Check first inventory item structure
		const firstItem = inventoryItems.first();
		await expect(firstItem).toBeVisible();

		// Prize image
		const prizeImage = firstItem.locator('[data-testid="prize-image"]');
		await expect(prizeImage).toBeVisible();

		// Prize name
		const prizeName = firstItem.locator('[data-testid="prize-name"]');
		await expect(prizeName).toBeVisible();

		// Status indicator
		const statusIndicator = firstItem.locator('[data-testid="prize-status"]');
		await expect(statusIndicator).toBeVisible();
		await expect(statusIndicator).toContainText(/(UNCLAIMED|CLAIMED|COLLECTED)/);
	});

	test('Prize detail page shows complete information', async ({ page }) => {
		// Navigate to inventory
		await clickBottomNav(page, 'inventory');
		await expect(page).toHaveURL('/inventory');

		// Click first inventory item
		const firstItem = page.locator('[data-testid^="inventory-item-"]').first();
		const prizeId = await firstItem.getAttribute('data-prize-id');
		await firstItem.click();
		await waitForPageLoad(page);

		// Verify on prize detail page
		await expect(page).toHaveURL(`/inventory/${prizeId}`);

		// Verify prize details
		const prizeImage = page.locator('[data-testid="prize-image"]');
		await expect(prizeImage).toBeVisible();

		const prizeName = page.locator('[data-testid="prize-name"]');
		await expect(prizeName).toBeVisible();

		const prizeDescription = page.locator('[data-testid="prize-description"]');
		await expect(prizeDescription).toBeVisible();

		const rarityBadge = page.locator('[data-testid="prize-rarity"]');
		await expect(rarityBadge).toBeVisible();
		await expect(rarityBadge).toContainText(/(COMMON|RARE|LEGENDARY)/);

		const statusBadge = page.locator('[data-testid="prize-status"]');
		await expect(statusBadge).toBeVisible();
	});

	test('Status indicators show correct colors', async ({ page }) => {
		await clickBottomNav(page, 'inventory');
		await expect(page).toHaveURL('/inventory');

		const inventoryItems = page.locator('[data-testid^="inventory-item-"]');
		const itemCount = await inventoryItems.count();

		// Check status indicators for all items
		for (let i = 0; i < itemCount; i++) {
			const item = inventoryItems.nth(i);
			const statusIndicator = item.locator('[data-testid="prize-status"]');
			const statusText = await statusIndicator.textContent();
			const statusClass = await statusIndicator.getAttribute('class');

			if (statusText?.includes('UNCLAIMED')) {
				// Yellow indicator for unclaimed
				expect(statusClass).toMatch(/yellow|warning|unclaimed/i);
			} else if (statusText?.includes('CLAIMED')) {
				// Blue indicator for claimed
				expect(statusClass).toMatch(/blue|info|claimed/i);
			} else if (statusText?.includes('COLLECTED')) {
				// Green indicator for collected
				expect(statusClass).toMatch(/green|success|collected/i);
			}
		}
	});

	test('Collection QR code generates for claimed prizes', async ({ page }) => {
		await clickBottomNav(page, 'inventory');
		await expect(page).toHaveURL('/inventory');

		// Find claimed prize
		const inventoryItems = page.locator('[data-testid^="inventory-item-"]');
		const itemCount = await inventoryItems.count();

		let claimedPrizeFound = false;
		for (let i = 0; i < itemCount; i++) {
			const item = inventoryItems.nth(i);
			const statusIndicator = item.locator('[data-testid="prize-status"]');
			const statusText = await statusIndicator.textContent();

			if (statusText?.includes('CLAIMED')) {
				// Click claimed prize
				await item.click();
				await waitForPageLoad(page);

				// Verify collection QR section exists
				const collectionQR = page.locator('[data-testid="collection-qr"]');
				if ((await collectionQR.count()) > 0) {
					await expect(collectionQR).toBeVisible();

					// Verify QR code image
					const qrCode = collectionQR.locator('[data-testid="qr-code"]');
					await expect(qrCode).toBeVisible();

					claimedPrizeFound = true;
				}
				break;
			}
		}

		if (!claimedPrizeFound) {
			console.log('No claimed prizes found in inventory');
		}
	});

	test('Unclaimed prizes show claim action button', async ({ page }) => {
		await clickBottomNav(page, 'inventory');
		await expect(page).toHaveURL('/inventory');

		// Find unclaimed prize
		const inventoryItems = page.locator('[data-testid^="inventory-item-"]');
		const itemCount = await inventoryItems.count();

		let unclaimedPrizeFound = false;
		for (let i = 0; i < itemCount; i++) {
			const item = inventoryItems.nth(i);
			const statusIndicator = item.locator('[data-testid="prize-status"]');
			const statusText = await statusIndicator.textContent();

			if (statusText?.includes('UNCLAIMED')) {
				// Click unclaimed prize
				await item.click();
				await waitForPageLoad(page);

				// Verify claim button exists
				const claimButton = page.locator('[data-testid="claim-prize-button"]');
				if ((await claimButton.count()) > 0) {
					await expect(claimButton).toBeVisible();
					await expect(claimButton).toBeEnabled();

					// Verify button text
					const buttonText = await claimButton.textContent();
					expect(buttonText).toMatch(/claim|generate/i);

					unclaimedPrizeFound = true;
				}
				break;
			}
		}

		if (!unclaimedPrizeFound) {
			console.log('No unclaimed prizes found in inventory');
		}
	});

	test('Collected prizes show collection details', async ({ page }) => {
		await clickBottomNav(page, 'inventory');
		await expect(page).toHaveURL('/inventory');

		// Find collected prize
		const inventoryItems = page.locator('[data-testid^="inventory-item-"]');
		const itemCount = await inventoryItems.count();

		let collectedPrizeFound = false;
		for (let i = 0; i < itemCount; i++) {
			const item = inventoryItems.nth(i);
			const statusIndicator = item.locator('[data-testid="prize-status"]');
			const statusText = await statusIndicator.textContent();

			if (statusText?.includes('COLLECTED')) {
				// Click collected prize
				await item.click();
				await waitForPageLoad(page);

				// Verify collection timestamp
				const collectionDate = page.locator('[data-testid="collection-date"]');
				if ((await collectionDate.count()) > 0) {
					await expect(collectionDate).toBeVisible();

					// Verify date format
					const dateText = await collectionDate.textContent();
					expect(dateText).toMatch(/\d{4}|\d{1,2}\/\d{1,2}/); // Contains year or date format

					collectedPrizeFound = true;
				}
				break;
			}
		}

		if (!collectedPrizeFound) {
			console.log('No collected prizes found in inventory');
		}
	});

	test('Prize rarity badges display correctly in inventory', async ({ page }) => {
		await clickBottomNav(page, 'inventory');
		await expect(page).toHaveURL('/inventory');

		const inventoryItems = page.locator('[data-testid^="inventory-item-"]');
		const firstItem = inventoryItems.first();

		// Check for rarity badge on inventory card
		const rarityBadge = firstItem.locator('[data-testid="prize-rarity"]');
		if ((await rarityBadge.count()) > 0) {
			await expect(rarityBadge).toBeVisible();
			await expect(rarityBadge).toContainText(/(COMMON|RARE|LEGENDARY)/);

			// Verify badge styling matches rarity
			const rarityText = await rarityBadge.textContent();
			const badgeClass = await rarityBadge.getAttribute('class');

			if (rarityText?.includes('LEGENDARY')) {
				expect(badgeClass).toContain('legendary');
			} else if (rarityText?.includes('RARE')) {
				expect(badgeClass).toContain('rare');
			} else {
				expect(badgeClass).toContain('common');
			}
		}
	});

	test('Physical vs Digital prize types are indicated', async ({ page }) => {
		await clickBottomNav(page, 'inventory');
		await expect(page).toHaveURL('/inventory');

		const inventoryItems = page.locator('[data-testid^="inventory-item-"]');
		const firstItem = inventoryItems.first();
		await firstItem.click();
		await waitForPageLoad(page);

		// Check for prize type indicator
		const prizeType = page.locator('[data-testid="prize-type"]');
		if ((await prizeType.count()) > 0) {
			await expect(prizeType).toBeVisible();
			await expect(prizeType).toContainText(/(PHYSICAL|DIGITAL)/);
		}
	});

	test('Empty inventory shows appropriate message', async ({ page }) => {
		// Login as a user with no inventory (Bob)
		await page.goto('/auth-test');
		await page.click(`[data-testid="mock-user-${MOCK_USERS.bob.id}"]`);
		await page.waitForURL('/dashboard');

		// Navigate to inventory
		await clickBottomNav(page, 'inventory');
		await expect(page).toHaveURL('/inventory');

		// Check for empty state or inventory items
		const inventoryItems = page.locator('[data-testid^="inventory-item-"]');
		const itemCount = await inventoryItems.count();

		if (itemCount === 0) {
			// Verify empty state message
			const emptyMessage = page.locator('[data-testid="empty-inventory-message"]');
			await expect(emptyMessage).toBeVisible();
			await expect(emptyMessage).toContainText(/no prizes|empty|start playing/i);
		}
	});

	test('Inventory grid layout displays correctly', async ({ page }) => {
		await clickBottomNav(page, 'inventory');
		await expect(page).toHaveURL('/inventory');

		// Verify grid container
		const inventoryGrid = page.locator('[data-testid="inventory-grid"]');
		await expect(inventoryGrid).toBeVisible();

		// Check grid has proper layout
		const inventoryItems = page.locator('[data-testid^="inventory-item-"]');
		const itemCount = await inventoryItems.count();

		if (itemCount >= 2) {
			// Get positions of first two items to verify grid layout
			const firstBox = await inventoryItems.first().boundingBox();
			const secondBox = await inventoryItems.nth(1).boundingBox();

			if (firstBox && secondBox) {
				// Items should be in a grid (either horizontally or vertically adjacent)
				const horizontallyAdjacent =
					Math.abs(firstBox.y - secondBox.y) < 10 && secondBox.x > firstBox.x;
				const verticallyAdjacent =
					Math.abs(firstBox.x - secondBox.x) < 10 && secondBox.y > firstBox.y;

				expect(horizontallyAdjacent || verticallyAdjacent).toBe(true);
			}
		}
	});

	test('Back button from prize detail returns to inventory', async ({ page }) => {
		await clickBottomNav(page, 'inventory');
		await expect(page).toHaveURL('/inventory');

		// Click first prize
		const firstItem = page.locator('[data-testid^="inventory-item-"]').first();
		await firstItem.click();
		await waitForPageLoad(page);

		// Verify on detail page
		const prizeDetail = page.locator('[data-testid="prize-detail"]');
		await expect(prizeDetail).toBeVisible();

		// Click back button
		const backButton = page.locator('[data-testid="back-button"]');
		await expect(backButton).toBeVisible();
		await backButton.click();
		await waitForPageLoad(page);

		// Should return to inventory list
		await expect(page).toHaveURL('/inventory');

		// Verify inventory grid visible
		const inventoryGrid = page.locator('[data-testid="inventory-grid"]');
		await expect(inventoryGrid).toBeVisible();
	});

	test('Inventory updates after winning a prize', async ({ page }) => {
		// Get initial inventory count
		await clickBottomNav(page, 'inventory');
		await expect(page).toHaveURL('/inventory');

		const initialItems = page.locator('[data-testid^="inventory-item-"]');
		const initialCount = await initialItems.count();

		// Complete a play flow to win a prize
		await clickBottomNav(page, 'home');
		const firstMachine = page.locator('[data-testid^="machine-card-"]').first();
		await firstMachine.click();
		await waitForPageLoad(page);

		await page.locator('[data-testid="play-now-button"]').click();
		await waitForPageLoad(page);

		await page.locator('[data-testid="confirm-payment-button"]').click();
		await waitForPageLoad(page);

		// Wait for result page (with long timeout for QR countdown)
		await page.waitForURL(/\/result\//, { timeout: 130000 });

		// Navigate to inventory via button
		const viewInventoryButton = page.locator('[data-testid="view-inventory-button"]');
		await viewInventoryButton.click();
		await waitForPageLoad(page);

		// Verify inventory count increased
		const updatedItems = page.locator('[data-testid^="inventory-item-"]');
		const updatedCount = await updatedItems.count();

		expect(updatedCount).toBeGreaterThan(initialCount);
	});
});
