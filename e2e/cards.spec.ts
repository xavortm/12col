import { expect, test } from "@playwright/test";

test.describe("Cards Game", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/projects/cards");
		// Wait for cards to be rendered
		await page.waitForSelector("#cards-grid button");
	});

	test("loads with the correct number of cards", async ({ page }) => {
		const cards = page.locator("#cards-grid button");
		// Default is 8 cards (4 pairs)
		await expect(cards).toHaveCount(8);
	});

	test("cards start in default state", async ({ page }) => {
		const cards = page.locator('#cards-grid button[data-state="default"]');
		await expect(cards).toHaveCount(8);
	});

	test("clicking a card flips it to open state", async ({ page }) => {
		const firstCard = page.locator("#cards-grid button").first();
		await expect(firstCard).toHaveAttribute("data-state", "default");

		await firstCard.click();

		await expect(firstCard).toHaveAttribute("data-state", "open");
	});

	test("timer starts on first card click", async ({ page }) => {
		const clock = page.locator("#game-clock");
		await expect(clock).toHaveAttribute("data-started", "false");

		await page.locator("#cards-grid button").first().click();

		await expect(clock).toHaveAttribute("data-started", "true");
	});

	test("matching two cards keeps them open and adds to score", async ({
		page,
	}) => {
		// Find two cards with the same pair
		const cards = page.locator("#cards-grid button");

		// Get first card and its pair ID
		const firstCard = cards.first();
		const pairId = await firstCard.getAttribute("data-pair");

		// Find the matching card (second card with same pair ID)
		const matchingCard = page
			.locator(`#cards-grid button[data-pair="${pairId}"]`)
			.nth(1);

		// Click both cards
		await firstCard.click();
		await matchingCard.click();

		// Both should be solved
		await expect(firstCard).toHaveAttribute("data-state", "solved");
		await expect(matchingCard).toHaveAttribute("data-state", "solved");

		// Score should increase
		const scoreValue = page.locator("#score-value");
		await expect(scoreValue).not.toHaveText("0");
	});

	test("non-matching cards flip back after delay", async ({ page }) => {
		const cards = page.locator("#cards-grid button");

		// Get first card's pair ID
		const firstCard = cards.first();
		const firstPairId = await firstCard.getAttribute("data-pair");

		// Find a card with a different pair ID
		const differentCard = page
			.locator(`#cards-grid button:not([data-pair="${firstPairId}"])`)
			.first();

		// Click both cards
		await firstCard.click();
		await differentCard.click();

		// Wait for flip back animation (default is ~1 second)
		await page.waitForTimeout(1500);

		// Both should be back to default
		await expect(firstCard).toHaveAttribute("data-state", "default");
		await expect(differentCard).toHaveAttribute("data-state", "default");
	});

	test("score remains at 0 after non-matching cards", async ({ page }) => {
		const cards = page.locator("#cards-grid button");

		// Get first card's pair ID
		const firstCard = cards.first();
		const firstPairId = await firstCard.getAttribute("data-pair");

		// Find a card with a different pair ID
		const differentCard = page
			.locator(`#cards-grid button:not([data-pair="${firstPairId}"])`)
			.first();

		// Click both non-matching cards
		await firstCard.click();
		await differentCard.click();

		// Wait for flip back
		await page.waitForTimeout(1500);

		// Score should still be 0
		const scoreValue = page.locator("#score-value");
		await expect(scoreValue).toHaveText("0");
	});

	test("can change card count via selector", async ({ page }) => {
		// Find and click the 12-card option button
		const selector = page.locator(
			'.card-count-selector__button[data-count="12"]',
		);
		await selector.click();

		// Wait for cards to reload
		await page.waitForSelector("#cards-grid button");
		await page.waitForTimeout(300);

		// Should now have 12 cards
		const cards = page.locator("#cards-grid button");
		await expect(cards).toHaveCount(12);
	});
});

test.describe("Cards Game - reset confirmation", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/projects/cards");
		await page.waitForSelector("#cards-grid button");
	});

	test("shows confirmation dialog when changing count with open cards", async ({
		page,
	}) => {
		// Start the game by clicking a card
		await page.locator("#cards-grid button").first().click();

		// Verify game is active
		const clock = page.locator("#game-clock");
		await expect(clock).toHaveAttribute("data-started", "true");

		// Set up dialog handler to accept
		let dialogMessage = "";
		page.on("dialog", async (dialog) => {
			dialogMessage = dialog.message();
			await dialog.accept();
		});

		// Try to change card count
		await page
			.locator('.card-count-selector__button[data-count="12"]')
			.click();

		// Verify dialog was shown
		expect(dialogMessage).toContain("reset");

		// Verify game was reset with new count
		await page.waitForSelector("#cards-grid button");
		const cards = page.locator("#cards-grid button");
		await expect(cards).toHaveCount(12);

		// Verify game state was reset (clock stopped, score reset)
		await expect(clock).toHaveAttribute("data-started", "false");
		const scoreValue = page.locator("#score-value");
		await expect(scoreValue).toHaveText("0");
	});

	test("canceling dialog keeps current game state", async ({ page }) => {
		// Start the game by clicking a card
		await page.locator("#cards-grid button").first().click();

		// Set up dialog handler to dismiss (cancel)
		page.on("dialog", async (dialog) => {
			await dialog.dismiss();
		});

		// Try to change card count
		await page
			.locator('.card-count-selector__button[data-count="12"]')
			.click();

		// Verify game was NOT reset - still 8 cards
		const cards = page.locator("#cards-grid button");
		await expect(cards).toHaveCount(8);

		// Verify game is still active
		const clock = page.locator("#game-clock");
		await expect(clock).toHaveAttribute("data-started", "true");
	});
});

test.describe("Cards Game (deterministic)", () => {
	test.beforeEach(async ({ page }) => {
		// Use shuffle=false for predictable card positions
		// Cards are ordered: [A, B, C, D, A, B, C, D] - pairs at (0,4), (1,5), (2,6), (3,7)
		await page.goto("/projects/cards?shuffle=false");
		await page.waitForSelector("#cards-grid button");
	});

	test("can complete the game by matching all pairs", async ({ page }) => {
		const cards = page.locator("#cards-grid button");
		const cardCount = await cards.count();
		const pairCount = cardCount / 2;

		// Match all pairs - with shuffle=false, pair i is at positions i and i+pairCount
		for (let i = 0; i < pairCount; i++) {
			await cards.nth(i).click();
			await cards.nth(i + pairCount).click();
			// Small wait for state to update
			await page.waitForTimeout(100);
		}

		// All cards should be solved
		const solvedCards = page.locator(
			'#cards-grid button[data-state="solved"]',
		);
		await expect(solvedCards).toHaveCount(cardCount);

		// Score should equal pairCount (1 point per pair for 8 cards)
		const scoreValue = page.locator("#score-value");
		await expect(scoreValue).toHaveText(String(pairCount));
	});

	test("shows victory modal when game is completed", async ({ page }) => {
		const cards = page.locator("#cards-grid button");
		const cardCount = await cards.count();
		const pairCount = cardCount / 2;

		// Match all pairs to complete the game
		for (let i = 0; i < pairCount; i++) {
			await cards.nth(i).click();
			await cards.nth(i + pairCount).click();
			await page.waitForTimeout(100);
		}

		// Victory modal should appear
		const modal = page.locator("#victory-modal");
		await expect(modal).toBeVisible();

		// Modal should show the correct score
		const modalScore = page.locator("#victory-score");
		await expect(modalScore).toHaveText(String(pairCount));
	});

	test("play again button resets the game", async ({ page }) => {
		const cards = page.locator("#cards-grid button");
		const cardCount = await cards.count();
		const pairCount = cardCount / 2;

		// Complete the game
		for (let i = 0; i < pairCount; i++) {
			await cards.nth(i).click();
			await cards.nth(i + pairCount).click();
			await page.waitForTimeout(100);
		}

		// Click Play Again
		const playAgainButton = page.locator("#victory-play-again");
		await expect(playAgainButton).toBeVisible();
		await playAgainButton.click();

		// Modal should close
		const modal = page.locator("#victory-modal");
		await expect(modal).not.toBeVisible();

		// Cards should be reset to default state
		const defaultCards = page.locator(
			'#cards-grid button[data-state="default"]',
		);
		await expect(defaultCards).toHaveCount(cardCount);

		// Score should be reset
		const scoreValue = page.locator("#score-value");
		await expect(scoreValue).toHaveText("0");
	});

	test("pairs are in predictable positions without shuffle", async ({
		page,
	}) => {
		const cards = page.locator("#cards-grid button");

		// First card and card at position 4 should have same pair ID
		const firstPairId = await cards.nth(0).getAttribute("data-pair");
		const matchingPairId = await cards.nth(4).getAttribute("data-pair");

		expect(firstPairId).toBe(matchingPairId);
	});
});

test.describe("Cards Game - keyboard navigation", () => {
	// Helper to get the current column count from CSS variable
	async function getColumnsPerRow(page: import("@playwright/test").Page) {
		return await page.evaluate(() => {
			const grid = document.getElementById("cards-grid");
			if (!grid) return 4;
			return parseInt(getComputedStyle(grid).getPropertyValue("--cards-per-row"), 10) || 4;
		});
	}

	test.beforeEach(async ({ page }) => {
		// Use a narrow viewport to ensure multiple rows
		await page.setViewportSize({ width: 600, height: 900 });
		await page.goto("/projects/cards?shuffle=false");
		await page.waitForSelector("#cards-grid button");
		// Wait for grid layout to calculate
		await page.waitForTimeout(100);
	});

	test("can navigate in all directions with arrow keys", async ({ page }) => {
		const cards = page.locator("#cards-grid button");
		const cols = await getColumnsPerRow(page);

		// Focus first card
		await cards.nth(0).focus();
		await expect(cards.nth(0)).toBeFocused();

		// Arrow right: 0 → 1
		await page.keyboard.press("ArrowRight");
		await expect(cards.nth(1)).toBeFocused();

		// Arrow down: 1 → 1+cols (next row, same column)
		await page.keyboard.press("ArrowDown");
		await expect(cards.nth(1 + cols)).toBeFocused();

		// Arrow left: back one
		await page.keyboard.press("ArrowLeft");
		await expect(cards.nth(cols)).toBeFocused();

		// Arrow up: back to first row
		await page.keyboard.press("ArrowUp");
		await expect(cards.nth(0)).toBeFocused();
	});

	test("can navigate with vim motions (hjkl)", async ({ page }) => {
		const cards = page.locator("#cards-grid button");
		const cols = await getColumnsPerRow(page);

		// Focus first card
		await cards.nth(0).focus();
		await expect(cards.nth(0)).toBeFocused();

		// l (right): 0 → 1
		await page.keyboard.press("l");
		await expect(cards.nth(1)).toBeFocused();

		// j (down): 1 → 1+cols
		await page.keyboard.press("j");
		await expect(cards.nth(1 + cols)).toBeFocused();

		// h (left): back one
		await page.keyboard.press("h");
		await expect(cards.nth(cols)).toBeFocused();

		// k (up): back to first row
		await page.keyboard.press("k");
		await expect(cards.nth(0)).toBeFocused();
	});

	test("navigation works after changing card count", async ({ page }) => {
		// Change to 12 cards
		await page
			.locator('.card-count-selector__button[data-count="12"]')
			.click();
		await page.waitForSelector("#cards-grid button");
		await page.waitForTimeout(300);

		const cards = page.locator("#cards-grid button");
		await expect(cards).toHaveCount(12);

		// Focus first card and navigate
		await cards.nth(0).focus();
		await expect(cards.nth(0)).toBeFocused();

		// Navigate right
		await page.keyboard.press("ArrowRight");
		await expect(cards.nth(1)).toBeFocused();

		// Navigate down (position depends on column count)
		const cols = await getColumnsPerRow(page);
		await page.keyboard.press("ArrowDown");
		await expect(cards.nth(1 + cols)).toBeFocused();
	});

	test("can navigate while cards are flipping back", async ({ page }) => {
		const cards = page.locator("#cards-grid button");
		const cols = await getColumnsPerRow(page);

		// Click two non-matching cards
		await cards.nth(0).click();
		await cards.nth(1).click();

		// Immediately focus and navigate (while cards are flipping back)
		await cards.nth(1).focus();
		await page.keyboard.press("ArrowRight");

		// Should be able to move focus even during flip animation
		await expect(cards.nth(2)).toBeFocused();

		// Navigate down
		await page.keyboard.press("ArrowDown");
		await expect(cards.nth(2 + cols)).toBeFocused();
	});

	test("does not navigate past grid boundaries", async ({ page }) => {
		const cards = page.locator("#cards-grid button");
		const cols = await getColumnsPerRow(page);
		const lastIndex = (await cards.count()) - 1;
		const lastRowStart = Math.floor(lastIndex / cols) * cols;

		// Focus first card and try to go left (should stay)
		await cards.nth(0).focus();
		await page.keyboard.press("ArrowLeft");
		await expect(cards.nth(0)).toBeFocused();

		// Try to go up (should stay)
		await page.keyboard.press("ArrowUp");
		await expect(cards.nth(0)).toBeFocused();

		// Go to end of first row and try to go right (should stay)
		await cards.nth(cols - 1).focus();
		await page.keyboard.press("ArrowRight");
		await expect(cards.nth(cols - 1)).toBeFocused();

		// Go to last card and try to go down (should stay)
		await cards.nth(lastIndex).focus();
		await page.keyboard.press("ArrowDown");
		await expect(cards.nth(lastIndex)).toBeFocused();
	});
});
