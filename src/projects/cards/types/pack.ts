export interface Card {
	id: string; // Filename without extension (e.g., "bhutan")
	alt: string;
}

export interface Pack {
	id: string;
	name: string;
	description: string;
	basePath: string; // Path to assets in public folder (e.g., "/projects/cards/packs/flags")
	cards: Card[];
	difficultyScore: number;
	aspectRatio: number; // width / height (e.g., 3/4 = 0.75, 4/3 = 1.333)
}
