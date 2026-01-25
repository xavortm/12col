export interface Card {
  url: string;
  alt: string;
}

export interface Pack {
  id: string;
  name: string;
  description: string;
  cards: Card[];
  difficultyScore: number;
}
