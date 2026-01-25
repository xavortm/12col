import { PACKS, DEFAULT_PACK_ID, PACK_LIST } from '../data/packs/registry';
import { VALID_COUNTS, DEFAULT_COUNT, POINTS_PER_PAIR, type ValidCount } from '../constants';
import { shuffleArray } from './shuffle';

const IMAGE_PARAMS = '?q=30&w=500&h=500&auto=format&fit=crop';

interface GameState {
	packId: string;
	cardCount: ValidCount;
}

function getStateFromURL(): GameState {
	const params = new URLSearchParams(window.location.search);

	const packParam = params.get('pack');
	const packId = packParam && PACKS[packParam] ? packParam : DEFAULT_PACK_ID;

	const countParam = params.get('count');
	const parsedCount = countParam ? Number.parseInt(countParam, 10) : DEFAULT_COUNT;
	const cardCount = VALID_COUNTS.includes(parsedCount as ValidCount)
		? (parsedCount as ValidCount)
		: DEFAULT_COUNT;

	return { packId, cardCount };
}

function updateURL(state: GameState): void {
	const url = new URL(window.location.href);

	// Only add params that differ from defaults, remove ones that match
	if (state.packId !== DEFAULT_PACK_ID) {
		url.searchParams.set('pack', state.packId);
	} else {
		url.searchParams.delete('pack');
	}

	if (state.cardCount !== DEFAULT_COUNT) {
		url.searchParams.set('count', String(state.cardCount));
	} else {
		url.searchParams.delete('count');
	}

	window.history.replaceState({}, '', url.toString());
}

function createCardHTML(url: string, alt: string): string {
	return `
		<button data-state="default" data-pair="${alt}" type="button">
			<div class="inner">
				<div class="front"></div>
				<div class="back">
					<img src="${url}" alt="${alt}" draggable="false" />
				</div>
			</div>
		</button>
	`;
}

function renderCards(packId: string, cardCount: number): void {
	const grid = document.getElementById('cards-grid');
	if (!grid) return;

	const pack = PACKS[packId];
	if (!pack) {
		console.error(`Pack "${packId}" not found`);
		return;
	}

	const uniqueCardsNeeded = cardCount / 2;
	const selectedCards = pack.cards.slice(0, uniqueCardsNeeded);

	const cardPairs = selectedCards.concat(selectedCards).map((card) => ({
		...card,
		url: card.url + IMAGE_PARAMS,
	}));

	const shuffledCards = shuffleArray(cardPairs);

	grid.innerHTML = shuffledCards.map((card) => createCardHTML(card.url, card.alt)).join('');
}

function updateCountSelector(cardCount: ValidCount): void {
	const buttons = document.querySelectorAll<HTMLButtonElement>('.card-count-selector__button');
	buttons.forEach((button) => {
		const count = Number(button.dataset.count);
		button.setAttribute('aria-pressed', String(count === cardCount));
	});
}

function updatePackSelector(packId: string): void {
	const select = document.getElementById('pack-select') as HTMLSelectElement | null;
	if (select) {
		select.value = packId;
	}
}

function updateScorePointsPerPair(cardCount: ValidCount): void {
	const scoreElement = document.getElementById('game-score');
	if (scoreElement) {
		const points = POINTS_PER_PAIR[cardCount] ?? 1;
		scoreElement.dataset.pointsPerPair = String(points);
	}
}

function isGameActive(): boolean {
	const clock = document.getElementById('game-clock');
	return clock?.dataset.started === 'true';
}

function confirmGameReset(): boolean {
	if (!isGameActive()) return true;
	return confirm('This will reset your current game. Are you sure?');
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
	window.dispatchEvent(new CustomEvent('game:init'));
}

function setupCountSelector(): void {
	const buttons = document.querySelectorAll<HTMLButtonElement>('.card-count-selector__button');

	buttons.forEach((button) => {
		button.addEventListener('click', () => {
			const count = Number(button.dataset.count) as ValidCount;
			const isCurrentlySelected = button.getAttribute('aria-pressed') === 'true';

			if (isCurrentlySelected) return;
			if (!confirmGameReset()) return;

			const currentState = getStateFromURL();
			initGame({ ...currentState, cardCount: count });
		});
	});
}

function setupPackSelector(): void {
	const select = document.getElementById('pack-select') as HTMLSelectElement | null;
	if (!select) return;

	// Populate options client-side
	select.innerHTML = PACK_LIST.map(
		(pack) => `<option value="${pack.id}">${pack.name}</option>`
	).join('');

	select.addEventListener('change', () => {
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
	const state = getStateFromURL();

	setupCountSelector();
	setupPackSelector();
	initGame(state);
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', initializeGame);
