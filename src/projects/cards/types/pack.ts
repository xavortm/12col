export interface Card {
	svg: string;
	alt: string;
}

export interface Pack {
	id: string;
	name: string;
	description: string;
	cards: Card[];
	difficultyScore: number;
	aspectRatio: number; // width / height (e.g., 3/4 = 0.75, 4/3 = 1.333)
}
