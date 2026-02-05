import {
	DEFAULT_COUNT,
	POINTS_PER_PAIR,
	VALID_COUNTS,
	type ValidCount,
} from "../constants";
import { DEFAULT_PACK_ID, PACK_LIST, PACKS } from "../data/packs/registry";
import { shuffleArray } from "./utils//shuffle";

// Cached DOM elements
let grid: HTMLElement | null = null;
let clock: HTMLElement | null = null;

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

function createCardHTML(imgSrc: string, alt: string): string {
	return `
		<div role="listitem" tabindex="0" data-state="default" data-pair="${alt}" aria-label="Face down">
			<div class="inner">
				<div class="front"></div>
				<div class="back" aria-hidden="true">
					<img src="${imgSrc}" alt="${alt}" />
				</div>
			</div>
		</div>
	`;
}

function shouldShuffle(): boolean {
	const params = new URLSearchParams(window.location.search);
	return params.get("shuffle") !== "false";
}

function renderCards(packId: string, cardCount: number): void {
	if (!grid) return;

	const pack = PACKS[packId];
	if (!pack) {
		console.error(`Pack "${packId}" not found`);
		return;
	}

	// Set aspect ratio CSS variable for grid layout and card styling
	grid.style.setProperty("--card-aspect-ratio", String(pack.aspectRatio));

	const uniqueCardsNeeded = cardCount / 2;
	const shuffle = shouldShuffle();
	const availableCards = shuffle ? shuffleArray([...pack.cards]) : pack.cards;
	const selectedCards = availableCards.slice(0, uniqueCardsNeeded);

	const cardPairs = selectedCards.concat(selectedCards);

	const orderedCards = shuffle ? shuffleArray(cardPairs) : cardPairs;

	const base = import.meta.env.BASE_URL.replace(/\/$/, ""); // Remove trailing slash
	grid.innerHTML = orderedCards
		.map((card) =>
			createCardHTML(`${base}${pack.basePath}/${card.id}.svg`, card.alt),
		)
		.join("");
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

function updateScorePointsPerPair(cardCount: ValidCount): void {
	const scoreElement = document.getElementById("game-score");
	if (scoreElement) {
		const points = POINTS_PER_PAIR[cardCount] ?? 1;
		scoreElement.dataset.pointsPerPair = String(points);
	}
}

function isGameActive(): boolean {
	return clock?.dataset.started === "true";
}

function confirmGameReset(): boolean {
	if (!isGameActive()) return true;
	return confirm("This will reset your current game. Are you sure?");
}

// Note: Score and clock reset are handled by cards.ts and clock.ts
// via the game:init event dispatched in initGame()

function initGame(state: GameState): void {
	renderCards(state.packId, state.cardCount);
	updateCountSelector(state.cardCount);
	updatePackSelector(state.packId);
	updateScorePointsPerPair(state.cardCount);
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
			if (!confirmGameReset()) return;

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

	// Populate options client-side
	select.innerHTML = PACK_LIST.map(
		(pack) => `<option value="${pack.id}">${pack.name}</option>`,
	).join("");

	select.addEventListener("change", () => {
		const previousValue = getStateFromURL().packId;
		if (!confirmGameReset()) {
			select.value = previousValue;
			return;
		}

		const currentState = getStateFromURL();
		initGame({ ...currentState, packId: select.value });
	});
}

export function initializeGame(): void {
	// Cache DOM elements
	grid = document.getElementById("cards-grid");
	clock = document.getElementById("game-clock");

	const state = getStateFromURL();

	setupCountSelector();
	setupPackSelector();
	initGame(state);
}

// Auto-initialize on DOM ready
document.addEventListener("DOMContentLoaded", initializeGame);
