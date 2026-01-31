import { increasePitch, playSound, resetPitch } from "./audio";
import { createInitGuard, getAllCards, getCardsPerRow } from "./dom";

// Cached DOM elements (set on first init)
let grid: HTMLElement | null = null;
let announcer: HTMLElement | null = null;
let scoreValue: HTMLElement | null = null;

let clickCounter = 0;
let TIME_WAIT_FLIP = 1000; // Default fallback
let currentScore = 0;
let isLocked = false;

const canClickOnCard = (card: HTMLElement): boolean => {
	return !isLocked && card.dataset.state === "default";
};

let announceTimeoutId: number | null = null;

const announce = (message: string): void => {
	if (announcer) {
		// Cancel any pending announcement
		if (announceTimeoutId !== null) {
			clearTimeout(announceTimeoutId);
		}
		// Clear first to ensure re-announcement of same message
		announcer.textContent = "";
		// Use setTimeout to ensure the clear is processed before setting new content
		announceTimeoutId = window.setTimeout(() => {
			announcer.textContent = message;
			announceTimeoutId = null;
		}, 50);
	}
};

const getCardLabel = (card: HTMLElement): string => {
	const state = card.dataset.state;
	const name = card.dataset.pair ?? "Card";

	switch (state) {
		case "default":
			return "Face down";
		case "open":
			return `Face up, ${name}`;
		case "solved":
			return `Solved, ${name}`;
		default:
			return "Card";
	}
};

const updateCardLabel = (card: HTMLElement): void => {
	card.setAttribute("aria-label", getCardLabel(card));
};

const getCardSibling = (card: HTMLElement): HTMLElement => {
	const pairString = card.dataset.pair;
	const allCards = document.querySelectorAll<HTMLElement>(
		`[data-pair="${pairString}"]`,
	);
	return allCards[0] === card ? allCards[1] : allCards[0];
};

const clickSolvesCard = (card: HTMLElement): boolean => {
	const sibling = getCardSibling(card);
	return card.dataset.state === "open" && sibling.dataset.state === "open";
};

const closeOpenCards = () => {
	const openCards = document.querySelectorAll<HTMLElement>(
		'[data-state="open"]',
	);

	openCards.forEach((card) => {
		card.dataset.state = "default";
		updateCardLabel(card);
	});
};

const getPointsPerPair = (): number => {
	const scoreElement = document.getElementById("game-score");
	if (!scoreElement) return 1;
	const points = scoreElement.dataset.pointsPerPair;
	return points ? Number.parseInt(points, 10) : 1;
};

const updateScoreDisplay = () => {
	if (scoreValue) {
		scoreValue.textContent = String(currentScore);
	}
};

const addScore = () => {
	const points = getPointsPerPair();
	currentScore += points;
	updateScoreDisplay();
	announce(`Pair found, score ${currentScore}`);
};

const checkGameComplete = (): boolean => {
	return getAllCards().every((card) => card.dataset.state === "solved");
};

const dispatchGameComplete = () => {
	window.dispatchEvent(
		new CustomEvent("game:complete", {
			detail: { score: currentScore },
		}),
	);
};

const markCardSolved = (card: HTMLElement) => {
	const sibling = getCardSibling(card);

	card.dataset.state = "solved";
	sibling.dataset.state = "solved";

	updateCardLabel(card);
	updateCardLabel(sibling);

	addScore();

	if (checkGameComplete()) {
		dispatchGameComplete();
	}
};

const handleCardClick = (card: HTMLElement) => {
	clickCounter += 1;

	if (card.dataset.state === "default") {
		card.dataset.state = "open";
		updateCardLabel(card);
		announce(card.dataset.pair ?? "Card");
		playSound("flip");
	}

	if (clickCounter === 2) {
		isLocked = true;
		const isSolved = clickSolvesCard(card);
		const waitTime = isSolved ? 0 : TIME_WAIT_FLIP;

		// Wait for the flip animation to complete before checking the match
		setTimeout(() => {
			if (isSolved) {
				markCardSolved(card);
				increasePitch();
			} else {
				closeOpenCards();
			}

			isLocked = false;
		}, waitTime);

		clickCounter = 0;

		return;
	}
};

function bindCardHandlers(): void {
	// Cache DOM elements on first init
	grid = document.getElementById("cards-grid");
	announcer = document.getElementById("card-announcer");
	scoreValue = document.getElementById("score-value");

	const cards = getAllCards();

	// Read the CSS variable to sync with animation duration
	if (cards.length > 0) {
		const firstCard = cards[0];
		const style = getComputedStyle(firstCard);
		const duration = style.getPropertyValue("--card-flip-duration").trim();
		const durationMs = Number.parseFloat(duration);

		if (!Number.isNaN(durationMs)) {
			// Add 200ms buffer to the animation duration
			TIME_WAIT_FLIP = durationMs + 200;
		}
	}

	cards.forEach((card) => {
		card.addEventListener("click", () => {
			if (canClickOnCard(card)) {
				handleCardClick(card);
			}
		});

		card.addEventListener("keydown", (event) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				if (canClickOnCard(card)) {
					handleCardClick(card);
				}
			}
		});
	});

	// Reset game state
	clickCounter = 0;
	currentScore = 0;
	isLocked = false;
	updateScoreDisplay();
	resetPitch();
}

type Direction = "up" | "down" | "left" | "right";

const KEY_TO_DIRECTION: Record<string, Direction> = {
	ArrowUp: "up",
	ArrowDown: "down",
	ArrowLeft: "left",
	ArrowRight: "right",
	h: "left",
	j: "down",
	k: "up",
	l: "right",
};

function handleArrowNavigation(event: KeyboardEvent): void {
	const direction = KEY_TO_DIRECTION[event.key];
	if (!direction) return;

	const cards = getAllCards();
	const currentCard = document.activeElement as HTMLElement;
	const currentIndex = cards.indexOf(currentCard);

	// If focus is not on a card, focus first card on keypress
	if (currentIndex === -1) {
		if (cards.length > 0) {
			event.preventDefault();
			cards[0].focus();
		}
		return;
	}

	const cols = grid ? getCardsPerRow(grid) : 1;
	const row = Math.floor(currentIndex / cols);

	let targetIndex = -1;

	switch (direction) {
		case "right":
			targetIndex = currentIndex + 1;
			// Stay on same row
			if (Math.floor(targetIndex / cols) !== row) targetIndex = -1;
			break;
		case "left":
			targetIndex = currentIndex - 1;
			// Stay on same row
			if (targetIndex < 0 || Math.floor(targetIndex / cols) !== row)
				targetIndex = -1;
			break;
		case "down":
			targetIndex = currentIndex + cols;
			break;
		case "up":
			targetIndex = currentIndex - cols;
			break;
	}

	// Move focus if target is valid
	if (targetIndex >= 0 && targetIndex < cards.length) {
		event.preventDefault();
		cards[targetIndex].focus();
	}
}

const shouldBindKeyboardNavigation = createInitGuard();

function bindKeyboardNavigation(): void {
	if (!shouldBindKeyboardNavigation()) return;
	if (!grid) return;

	// Listen on document to catch keys even when focus is on body (after solving)
	document.addEventListener("keydown", (event) => {
		const activeEl = document.activeElement;
		const isOnCard = grid.contains(activeEl);
		const isOnBody = activeEl === document.body;

		// Only handle if focus is on a card or on body (lost focus after solving)
		if (isOnCard || isOnBody) {
			handleArrowNavigation(event);
		}
	});
}

let wasInsideGrid = false;

function getGridDimensions(): { cols: number; rows: number } {
	if (!grid) return { cols: 0, rows: 0 };

	const cols = getCardsPerRow(grid);
	const cardCount = grid.children.length;
	const rows = Math.ceil(cardCount / cols);

	return { cols, rows };
}

function announceGridDimensions(): void {
	const { cols, rows } = getGridDimensions();
	if (cols > 0 && rows > 0) {
		const colWord = cols === 1 ? "column" : "columns";
		const rowWord = rows === 1 ? "row" : "rows";
		announce(`Cards are in a grid of ${cols} ${colWord}, ${rows} ${rowWord}`);
	}
}

const shouldBindGridFocus = createInitGuard();

function bindGridFocusAnnouncement(): void {
	if (!shouldBindGridFocus()) return;
	if (!grid) return;

	document.addEventListener("focusin", () => {
		const isInsideGrid = grid.contains(document.activeElement);

		// Announce dimensions when entering the grid from outside
		if (isInsideGrid && !wasInsideGrid) {
			announceGridDimensions();
		}

		wasInsideGrid = isInsideGrid;
	});
}

// Bind on game init event (fired by game-init.ts)
window.addEventListener("game:init", bindCardHandlers);
window.addEventListener("game:init", bindKeyboardNavigation);
window.addEventListener("game:init", bindGridFocusAnnouncement);

// Also bind on initial load in case game:init fires before this script loads
document.addEventListener("DOMContentLoaded", bindCardHandlers);
document.addEventListener("DOMContentLoaded", bindKeyboardNavigation);
document.addEventListener("DOMContentLoaded", bindGridFocusAnnouncement);
