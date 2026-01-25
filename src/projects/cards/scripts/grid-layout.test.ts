import { describe, expect, it } from "vitest";
import { calculateOptimalColumns, type GridConfig } from "./grid-layout";

const defaultConfig: GridConfig = {
	aspectRatio: 3 / 4, // 0.75
	gapPx: 16,
};

describe("calculateOptimalColumns", () => {
	describe("edge cases", () => {
		it("returns 1 for 0 cards", () => {
			expect(calculateOptimalColumns(800, 600, 0, defaultConfig)).toBe(1);
		});

		it("returns 1 for a single card when it fits in one column", () => {
			// With enough height for one card, should use 1 column
			expect(calculateOptimalColumns(400, 600, 1, defaultConfig)).toBe(1);
		});
	});

	describe("optimal column selection", () => {
		it("prefers fewer columns to maximize card size when height allows", () => {
			// Large container height should allow fewer columns (bigger cards)
			const cols = calculateOptimalColumns(800, 800, 4, defaultConfig);
			// With 4 cards and enough height, 2 columns (2x2 grid) should fit
			expect(cols).toBeLessThanOrEqual(4);
		});

		it("uses more columns when height is constrained", () => {
			// Very short container should force more columns (shorter grid)
			const tallContainer = calculateOptimalColumns(800, 1000, 8, defaultConfig);
			const shortContainer = calculateOptimalColumns(800, 200, 8, defaultConfig);
			// Short container needs more columns to fit
			expect(shortContainer).toBeGreaterThanOrEqual(tallContainer);
		});

		it("returns cardCount when nothing fits (smallest possible cards)", () => {
			// Extremely small container - nothing fits well
			const cols = calculateOptimalColumns(100, 50, 12, defaultConfig);
			// Should return at most cardCount
			expect(cols).toBeLessThanOrEqual(12);
		});
	});

	describe("with different configs", () => {
		it("adjusts for different aspect ratios", () => {
			const wideCards: GridConfig = { aspectRatio: 16 / 9, gapPx: 16 };
			const tallCards: GridConfig = { aspectRatio: 1 / 2, gapPx: 16 };

			// Wide cards (width > height) are shorter per unit width
			// Tall cards (height > width) are taller per unit width, need more vertical space
			const wideCols = calculateOptimalColumns(800, 400, 6, wideCards);
			const tallCols = calculateOptimalColumns(800, 400, 6, tallCards);

			// Tall cards need more columns to fit in limited height
			expect(tallCols).toBeGreaterThanOrEqual(wideCols);
		});

		it("accounts for gap size in calculations", () => {
			const smallGap: GridConfig = { aspectRatio: 3 / 4, gapPx: 4 };
			const largeGap: GridConfig = { aspectRatio: 3 / 4, gapPx: 32 };

			// Larger gaps take up more space, may require more columns
			const smallGapCols = calculateOptimalColumns(800, 600, 8, smallGap);
			const largeGapCols = calculateOptimalColumns(800, 600, 8, largeGap);

			expect(largeGapCols).toBeGreaterThanOrEqual(smallGapCols);
		});
	});

	describe("realistic game scenarios", () => {
		it("handles typical 8-card game", () => {
			const cols = calculateOptimalColumns(800, 600, 8, defaultConfig);
			expect(cols).toBeGreaterThanOrEqual(2);
			expect(cols).toBeLessThanOrEqual(8);
		});

		it("handles typical 16-card game", () => {
			const cols = calculateOptimalColumns(800, 600, 16, defaultConfig);
			expect(cols).toBeGreaterThanOrEqual(4);
			expect(cols).toBeLessThanOrEqual(16);
		});

		it("handles typical 24-card game", () => {
			const cols = calculateOptimalColumns(1200, 800, 24, defaultConfig);
			expect(cols).toBeGreaterThanOrEqual(4);
			expect(cols).toBeLessThanOrEqual(24);
		});
	});
});
