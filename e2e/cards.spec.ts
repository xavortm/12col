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
