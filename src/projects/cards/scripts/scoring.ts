export interface ScoringState {
	pairScore: number;
	scoreMultiplier: number;
	consecutivePairs: number;
	currentScore: number;
}

export function createScoringState(): ScoringState {
	return {
		pairScore: 0,
		scoreMultiplier: 0,
		consecutivePairs: 0,
		currentScore: 0,
	};
}

export function calculatePairMult(flips: number): number {
	return Math.max(1, 4 - flips);
}

export function addPairScore(
	state: ScoringState,
	flips: number,
	pointsPerPair: number,
): ScoringState {
	const pairScore = Math.max(
		state.pairScore,
		pointsPerPair + state.consecutivePairs * 2,
	);
	const consecutivePairs = state.consecutivePairs + 1;

	const pairMult = calculatePairMult(flips);
	const scoreMultiplier =
		consecutivePairs > 1
			? state.scoreMultiplier * pairMult
			: state.scoreMultiplier + pairMult;

	const currentScore = state.currentScore + pairScore * scoreMultiplier;

	return { pairScore, scoreMultiplier, consecutivePairs, currentScore };
}

export function resetStreak(state: ScoringState): ScoringState {
	return { ...state, consecutivePairs: 0, scoreMultiplier: 0 };
}
