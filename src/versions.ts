export interface VersionEntry {
	label: string;
	version: string;
	date: string;
}

/**
 * Central version registry for all site parts.
 * Update the relevant entry when releasing a new version.
 */
export const versions = {
	site: {
		label: "12col",
		version: "0.0.1",
		date: "2025-06-01",
	},
	"cyberpunk-ui": {
		label: "Cyberpunk UI",
		version: "0.0.1",
		date: "2025-06-01",
	},
	cards: {
		label: "Pair Up",
		version: "1.0.0",
		date: "2026-02-21",
	},
} satisfies Record<string, VersionEntry>;

export type VersionKey = keyof typeof versions;
