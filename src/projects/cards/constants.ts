export const VALID_COUNTS = [8, 12, 16, 24] as const;
export type ValidCount = (typeof VALID_COUNTS)[number];
export const DEFAULT_COUNT: ValidCount = 24;

export const POINTS_PER_PAIR: Record<ValidCount, number> = {
	8: 1,
	12: 1,
	16: 2,
	24: 4,
};
