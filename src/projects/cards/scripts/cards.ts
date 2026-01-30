import { increasePitch, playSound, resetPitch } from "./audio";

let clickCounter = 0;
let TIME_WAIT_FLIP = 1000; // Default fallback
let currentScore = 0;
let isLocked = false;

const canClickOnCard = (card: HTMLElement): boolean => {
	return !isLocked && card.dataset.state === "default" && card.getAttribute("aria-disabled") !== "true";
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
	});
};

const getPointsPerPair = (): number => {
	const scoreElement = document.getElementById("game-score");
	if (!scoreElement) return 1;
	const points = scoreElement.dataset.pointsPerPair;
	return points ? Number.parseInt(points, 10) : 1;
};

const updateScoreDisplay = () => {
	const scoreValue = document.getElementById("score-value");
	if (scoreValue) {
		scoreValue.textContent = String(currentScore);
	}
};

const addScore = () => {
	const points = getPointsPerPair();
	currentScore += points;
	updateScoreDisplay();
};

const checkGameComplete = (): boolean => {
	const allCards = document.querySelectorAll<HTMLElement>(
		".cards-grid__inner > button",
	);
	return Array.from(allCards).every((card) => card.dataset.state === "solved");
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

	// Use aria-disabled instead of disabled to allow focus navigation
	card.setAttribute("aria-disabled", "true");
	sibling.setAttribute("aria-disabled", "true");

	addScore();

	if (checkGameComplete()) {
		dispatchGameComplete();
	}
};

const handleCardClick = (card: HTMLElement) => {
	clickCounter += 1;

	if (card.dataset.state === "default") {
		card.dataset.state = "open";
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
	const cards = document.querySelectorAll<HTMLElement>(
		".cards-grid button[data-state]",
	);

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
	});

	// Reset game state
	clickCounter = 0;
	currentScore = 0;
	isLocked = false;
	updateScoreDisplay();
	resetPitch();
}

function getCardsPerRow(): number {
	const grid = document.getElementById("cards-grid");
	if (!grid) return 1;
	const value = getComputedStyle(grid).getPropertyValue("--cards-per-row");
	return Number.parseInt(value, 10) || 1;
}

function getAllCards(): HTMLElement[] {
	return Array.from(
		document.querySelectorAll<HTMLElement>(".cards-grid__inner > button"),
	);
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

	const cols = getCardsPerRow();
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

let keyboardNavigationBound = false;

function bindKeyboardNavigation(): void {
	if (keyboardNavigationBound) return;
	keyboardNavigationBound = true;

	const grid = document.getElementById("cards-grid");
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

// Bind on game init event (fired by game-init.ts)
window.addEventListener("game:init", bindCardHandlers);
window.addEventListener("game:init", bindKeyboardNavigation);

// Also bind on initial load in case game:init fires before this script loads
document.addEventListener("DOMContentLoaded", bindCardHandlers);
document.addEventListener("DOMContentLoaded", bindKeyboardNavigation);
