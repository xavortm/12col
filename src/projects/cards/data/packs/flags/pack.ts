import type { Pack } from "../../../types/pack";

import bhutan from "./svg/Bhutan.svg?raw";
import botswana from "./svg/Botswana.svg?raw";
import bulgaria from "./svg/Bulgaria.svg?raw";
import china from "./svg/China.svg?raw";
import estonia from "./svg/Estonia.svg?raw";
import finland from "./svg/Finland.svg?raw";
import germany from "./svg/Germany.svg?raw";
import guinea from "./svg/Guinea.svg?raw";
import indonesia from "./svg/Indonesia.svg?raw";
import italy from "./svg/Italy.svg?raw";
import japan from "./svg/Japan.svg?raw";
import kazakhstan from "./svg/Kazakhstan.svg?raw";
import northKorea from "./svg/Korea (North).svg?raw";
import laos from "./svg/Laos.svg?raw";
import latvia from "./svg/Latvia.svg?raw";
import luxembourg from "./svg/Luxembourg.svg?raw";
import mexico from "./svg/Mexico.svg?raw";
import monaco from "./svg/Monaco.svg?raw";
import philippines from "./svg/Philippines.svg?raw";
import poland from "./svg/Poland.svg?raw";
import singapore from "./svg/Singapore .svg?raw";
import slovenia from "./svg/Slovenia.svg?raw";
import tunisia from "./svg/Tunisia.svg?raw";
import uganda from "./svg/Uganda.svg?raw";
import vaticanCity from "./svg/Vatican City state.svg?raw";
import yemen from "./svg/Yemen.svg?raw";

const pack: Pack = {
	id: "flags",
	name: "Flags of the World",
	description: "Flags from various countries around the globe",
	difficultyScore: 2,
	aspectRatio: 4 / 3,
	cards: [
		{ svg: bhutan, alt: "Bhutan" },
		{ svg: botswana, alt: "Botswana" },
		{ svg: bulgaria, alt: "Bulgaria" },
		{ svg: china, alt: "China" },
		{ svg: estonia, alt: "Estonia" },
		{ svg: finland, alt: "Finland" },
		{ svg: germany, alt: "Germany" },
		{ svg: guinea, alt: "Guinea" },
		{ svg: indonesia, alt: "Indonesia" },
		{ svg: italy, alt: "Italy" },
		{ svg: japan, alt: "Japan" },
		{ svg: kazakhstan, alt: "Kazakhstan" },
		{ svg: northKorea, alt: "North Korea" },
		{ svg: laos, alt: "Laos" },
		{ svg: latvia, alt: "Latvia" },
		{ svg: luxembourg, alt: "Luxembourg" },
		{ svg: mexico, alt: "Mexico" },
		{ svg: monaco, alt: "Monaco" },
		{ svg: philippines, alt: "Philippines" },
		{ svg: poland, alt: "Poland" },
		{ svg: singapore, alt: "Singapore" },
		{ svg: slovenia, alt: "Slovenia" },
		{ svg: tunisia, alt: "Tunisia" },
		{ svg: uganda, alt: "Uganda" },
		{ svg: vaticanCity, alt: "Vatican City" },
		{ svg: yemen, alt: "Yemen" },
	],
};

export default pack;
