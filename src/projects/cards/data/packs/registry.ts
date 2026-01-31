import type { Pack } from "../../types/pack";
import everydayPack from "./everyday/pack.json";

// Pack registry - add new packs here as they are created
export const PACKS: Record<string, Pack> = {
	everyday: everydayPack,
} as const;

export const PACK_LIST: Pack[] = Object.values(PACKS);

export const DEFAULT_PACK_ID = "everyday";

export function getPack(packId: string): Pack | undefined {
	return PACKS[packId];
}
