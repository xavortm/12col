import type { Pack } from "../../types/pack";
import flagsPack from "./flags/pack";

// Pack registry - add new packs here as they are created
export const PACKS: Record<string, Pack> = {
	flags: flagsPack,
} as const;

export const PACK_LIST: Pack[] = Object.values(PACKS);

export const DEFAULT_PACK_ID = "flags";

export function getPack(packId: string): Pack | undefined {
	return PACKS[packId];
}
