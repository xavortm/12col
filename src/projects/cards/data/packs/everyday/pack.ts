import type { Pack } from "../../../types/pack";
import testSvg from "./svgs/test.svg?raw";

const pack: Pack = {
	id: "everyday",
	name: "Everyday Things",
	description: "Common everyday objects and scenes",
	difficultyScore: 1,
	aspectRatio: 1,
	cards: [
		{ svg: testSvg, alt: "test" },
		{ svg: testSvg, alt: "test 2" },
		{ svg: testSvg, alt: "test 3" },
		{ svg: testSvg, alt: "test 4" },
		{ svg: testSvg, alt: "test 5" },
		{ svg: testSvg, alt: "test 6" },
		{ svg: testSvg, alt: "test 7" },
		{ svg: testSvg, alt: "test 8" },
		{ svg: testSvg, alt: "test 9" },
		{ svg: testSvg, alt: "test 10" },
		{ svg: testSvg, alt: "test 11" },
		{ svg: testSvg, alt: "test 12" },
	],
};

export default pack;
