import type { Pack } from "../../../types/pack";

const pack: Pack = {
	id: "shapes",
	name: "Shapes",
	description: "Geometric shapes and forms",
	basePath: "/projects/cards/packs/shapes",
	difficultyScore: 1,
	aspectRatio: 1,
	cards: [
		{ id: "circle", alt: "Circle" },
		{ id: "crescent", alt: "Crescent" },
		{ id: "disc", alt: "Disc" },
		{ id: "ellipse", alt: "Ellipse" },
		{ id: "flower", alt: "Flower" },
		{ id: "frame", alt: "Frame" },
		{ id: "hexagon", alt: "Hexagon" },
		{ id: "octagon", alt: "Octagon" },
		{ id: "pentagon", alt: "Pentagon" },
		{ id: "square", alt: "Square" },
		{ id: "star", alt: "Star" },
		{ id: "triangle", alt: "Triangle" },
	],
};

export default pack;
