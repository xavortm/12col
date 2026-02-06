import { describe, expect, it } from "vitest";
import {
	addPairScore,
	calculatePairMult,
	createScoringState,
	resetStreak,
} from "./scoring";

describe("calculatePairMult", () => {
	it("returns 4 for 0 flips", () => {
		expect(calculatePairMult(0)).toBe(4);
	});

	it("returns 3 for 1 flip", () => {
		expect(calculatePairMult(1)).toBe(3);
	});

	it("returns 2 for 2 flips", () => {
		expect(calculatePairMult(2)).toBe(2);
	});

	it("returns 1 for 3 flips", () => {
		expect(calculatePairMult(3)).toBe(1);
	});

	it("floors at 1 for high flip counts", () => {
		expect(calculatePairMult(5)).toBe(1);
		expect(calculatePairMult(10)).toBe(1);
	});
});

describe("createScoringState", () => {
	it("starts with all zeroes", () => {
		const state = createScoringState();
		expect(state).toEqual({
			pairScore: 0,
			scoreMultiplier: 0,
			consecutivePairs: 0,
			currentScore: 0,
		});
	});
});

describe("addPairScore", () => {
	const pointsPerPair = 4; // 24-card game

	describe("first pair (additive multiplier)", () => {
		it("adds multiplier on the first pair", () => {
			const state = createScoringState();
			const next = addPairScore(state, 0, pointsPerPair);

			expect(next.scoreMultiplier).toBe(4); // 0 + 4
			expect(next.pairScore).toBe(4); // base, no consecutive bonus
			expect(next.currentScore).toBe(16); // 4 * 4
			expect(next.consecutivePairs).toBe(1);
		});

		it("adds multiplier from zero after a streak reset", () => {
			let state = createScoringState();
			state = addPairScore(state, 0, pointsPerPair);
			state = addPairScore(state, 0, pointsPerPair);
			state = resetStreak(state);

			const next = addPairScore(state, 0, pointsPerPair);

			// Multiplier was reset to 0, now adds 4 → 4
			expect(next.scoreMultiplier).toBe(4);
		});
	});

	describe("consecutive pairs (multiplicative multiplier)", () => {
		it("multiplies multiplier on consecutive pairs", () => {
			let state = createScoringState();
			state = addPairScore(state, 0, pointsPerPair); // mult = 4

			const next = addPairScore(state, 0, pointsPerPair);

			expect(next.scoreMultiplier).toBe(16); // 4 * 4
		});

		it("chains multiplications across a long streak", () => {
			let state = createScoringState();

			// 3 perfect pairs in a row (0 flips each, pairMult = 4)
			state = addPairScore(state, 0, pointsPerPair); // mult = 0 + 4 = 4
			state = addPairScore(state, 0, pointsPerPair); // mult = 4 * 4 = 16
			state = addPairScore(state, 0, pointsPerPair); // mult = 16 * 4 = 64

			expect(state.scoreMultiplier).toBe(64);
		});
	});

	describe("consecutive pair bonus on pairScore", () => {
		it("adds +2 per consecutive pair to base points", () => {
			let state = createScoringState();

			state = addPairScore(state, 0, pointsPerPair);
			expect(state.pairScore).toBe(4); // base + 0*2

			state = addPairScore(state, 0, pointsPerPair);
			expect(state.pairScore).toBe(6); // base + 1*2

			state = addPairScore(state, 0, pointsPerPair);
			expect(state.pairScore).toBe(8); // base + 2*2
		});

		it("preserves pair bonus after streak break", () => {
			let state = createScoringState();
			state = addPairScore(state, 0, pointsPerPair);
			state = addPairScore(state, 0, pointsPerPair);
			expect(state.pairScore).toBe(6); // base + 1*2

			state = resetStreak(state);
			state = addPairScore(state, 0, pointsPerPair);
			expect(state.pairScore).toBe(6); // never decreases
		});
	});

	describe("score accumulation", () => {
		it("accumulates score across pairs", () => {
			let state = createScoringState();

			state = addPairScore(state, 0, pointsPerPair);
			const scoreAfterFirst = state.currentScore;

			state = addPairScore(state, 0, pointsPerPair);
			expect(state.currentScore).toBeGreaterThan(scoreAfterFirst);
		});

		it("calculates score as pairScore * scoreMultiplier each step", () => {
			let state = createScoringState();

			// Pair 1: pairScore=4, mult=4, score += 4*4 = 16
			state = addPairScore(state, 0, pointsPerPair);
			expect(state.currentScore).toBe(16);

			// Pair 2: pairScore=6, mult=16, score += 6*16 = 96, total = 112
			state = addPairScore(state, 0, pointsPerPair);
			expect(state.currentScore).toBe(112);

			// Pair 3: pairScore=8, mult=64, score += 8*64 = 512, total = 624
			state = addPairScore(state, 0, pointsPerPair);
			expect(state.currentScore).toBe(624);
		});
	});

	describe("with varied flip counts", () => {
		it("reduces multiplier growth for cards flipped multiple times", () => {
			let state = createScoringState();

			// First pair: 3 flips → pairMult = 1
			state = addPairScore(state, 3, pointsPerPair);
			expect(state.scoreMultiplier).toBe(1);

			// Second pair: 3 flips → mult * 1 = 1 (no growth)
			state = addPairScore(state, 3, pointsPerPair);
			expect(state.scoreMultiplier).toBe(1);
		});

		it("mixed flip counts affect multiplier correctly", () => {
			let state = createScoringState();

			// Perfect first pair: mult = 0 + 4 = 4
			state = addPairScore(state, 0, pointsPerPair);
			expect(state.scoreMultiplier).toBe(4);

			// Sloppy second pair (2 flips, pairMult=2): mult = 4 * 2 = 8
			state = addPairScore(state, 2, pointsPerPair);
			expect(state.scoreMultiplier).toBe(8);
		});
	});
});

describe("resetStreak", () => {
	it("resets consecutivePairs to 0", () => {
		let state = createScoringState();
		state = addPairScore(state, 0, 4);
		state = addPairScore(state, 0, 4);

		expect(state.consecutivePairs).toBe(2);

		const reset = resetStreak(state);
		expect(reset.consecutivePairs).toBe(0);
	});

	it("preserves score and pairScore but resets multiplier", () => {
		let state = createScoringState();
		state = addPairScore(state, 0, 4);
		state = addPairScore(state, 0, 4);

		const reset = resetStreak(state);
		expect(reset.currentScore).toBe(state.currentScore);
		expect(reset.pairScore).toBe(state.pairScore);
		expect(reset.scoreMultiplier).toBe(0);
	});
});
