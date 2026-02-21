import { DEFAULT_COUNT, VALID_COUNTS, type ValidCount } from "../constants";
import { DEFAULT_PACK_ID, PACK_LIST, PACKS } from "../data/packs/registry";
import { shuffleArray } from "./utils/shuffle";

// Cached DOM elements
let grid: HTMLElement | null = null;

const MIN_UNIQUE_CARDS = DEFAULT_COUNT / 2;

interface GameState {
	packId: string;
	cardCount: ValidCount;
}

function getStateFromURL(): GameState {
	const params = new URLSearchParams(window.location.search);

	const packParam = params.get("pack");
	const packId = packParam && PACKS[packParam] ? packParam : DEFAULT_PACK_ID;

	const countParam = params.get("count");
	const parsedCount = countParam
		? Number.parseInt(countParam, 10)
		: DEFAULT_COUNT;
	const cardCount = VALID_COUNTS.includes(parsedCount as ValidCount)
		? (parsedCount as ValidCount)
		: DEFAULT_COUNT;

	return { packId, cardCount };
}

function updateURL(state: GameState): void {
	const url = new URL(window.location.href);

	// Only add params that differ from defaults, remove ones that match
	if (state.packId !== DEFAULT_PACK_ID) {
		url.searchParams.set("pack", state.packId);
	} else {
		url.searchParams.delete("pack");
	}

	if (state.cardCount !== DEFAULT_COUNT) {
		url.searchParams.set("count", String(state.cardCount));
	} else {
		url.searchParams.delete("count");
	}

	window.history.replaceState({}, "", url.toString());
}

function renderCards(packId: string, cardCount: number): void {
	if (!grid) return;

	const pack = PACKS[packId];
	if (!pack) return;

	grid.style.setProperty("--card-aspect-ratio", String(pack.aspectRatio));

	const allButtons = Array.from(
		grid.querySelectorAll<HTMLButtonElement>("button"),
	);
	const uniqueCardsNeeded = cardCount / 2;
	const availableCards = shuffleArray([...pack.cards]);
	const selectedCards = availableCards.slice(0, uniqueCardsNeeded);
	const cardPairs = [...selectedCards, ...selectedCards];
	const orderedCards = shuffleArray(cardPairs);

	const base = import.meta.env.BASE_URL.replace(/\/$/, "");

	allButtons.forEach((button, i) => {
		if (i < orderedCards.length) {
			const card = orderedCards[i];
			button.classList.remove("is-hidden");
			button.dataset.state = "default";
			button.dataset.pair = card.alt;
			button.setAttribute("aria-label", "Face down");

			const img = button.querySelector("img");
			if (img) {
				img.src = `${base}${pack.basePath}/${card.id}.svg`;
				img.alt = card.alt;
			}
		} else {
			button.classList.add("is-hidden");
		}
	});

	grid.setAttribute("data-initialized", "");
}

function updateCountSelector(cardCount: ValidCount): void {
	const buttons = document.querySelectorAll<HTMLButtonElement>(
		".card-count-selector__button",
	);
	buttons.forEach((button) => {
		const count = Number(button.dataset.count);
		button.setAttribute("aria-pressed", String(count === cardCount));
	});
}

function updatePackSelector(packId: string): void {
	const select = document.getElementById(
		"pack-select",
	) as HTMLSelectElement | null;
	if (select) {
		select.value = packId;
	}
}

function initGame(state: GameState): void {
	renderCards(state.packId, state.cardCount);
	updateCountSelector(state.cardCount);
	updatePackSelector(state.packId);
	updateURL(state);

	// Dispatch event for cards.ts to rebind click handlers
	window.dispatchEvent(new CustomEvent("game:init"));
}

function setupCountSelector(): void {
	const buttons = document.querySelectorAll<HTMLButtonElement>(
		".card-count-selector__button",
	);

	buttons.forEach((button) => {
		button.addEventListener("click", () => {
			const count = Number(button.dataset.count) as ValidCount;
			const isCurrentlySelected =
				button.getAttribute("aria-pressed") === "true";

			if (isCurrentlySelected) return;

			const currentState = getStateFromURL();
			initGame({ ...currentState, cardCount: count });
		});
	});
}

function setupPackSelector(): void {
	const select = document.getElementById(
		"pack-select",
	) as HTMLSelectElement | null;
	if (!select) return;

	// Only include packs with enough cards to fill the max count
	const eligiblePacks = PACK_LIST.filter(
		(pack) => pack.cards.length >= MIN_UNIQUE_CARDS,
	);

	// Populate options client-side
	select.innerHTML = eligiblePacks
		.map((pack) => `<option value="${pack.id}">${pack.name}</option>`)
		.join("");

	select.addEventListener("change", () => {
		const currentState = getStateFromURL();
		initGame({ ...currentState, packId: select.value });
	});
}

export function initializeGame(): void {
	// Cache DOM elements
	grid = document.getElementById("cards-grid");

	const state = getStateFromURL();

	setupCountSelector();
	setupPackSelector();
	initGame(state);
}

// Auto-initialize on DOM ready
document.addEventListener("DOMContentLoaded", initializeGame);
