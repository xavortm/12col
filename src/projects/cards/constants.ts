export const VALID_COUNTS = [8, 12, 16, 24] as const;
export type ValidCount = (typeof VALID_COUNTS)[number];
export const DEFAULT_COUNT: ValidCount = 24;
