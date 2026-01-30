import { increasePitch, playSound, resetPitch } from "./audio";

let clickCounter = 0;
let TIME_WAIT_FLIP = 1000; // Default fallback
let currentScore = 0;

const canClickOnCard = (card: HTMLElement): boolean => {
	return card.dataset.state === "default";
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

	card.setAttribute("disabled", "");
	sibling.setAttribute("disabled", "");

	addScore();

	if (checkGameComplete()) {
		dispatchGameComplete();
	}
};

const disableAllCards = () => {
	const cards = document.querySelectorAll<HTMLElement>(
		".cards-grid__inner > button",
	);

	cards.forEach((card) => {
		card.setAttribute("disabled", "");
	});
};

const enableAllCards = () => {
	const cards = document.querySelectorAll<HTMLElement>(
		".cards-grid__inner > button",
	);

	cards.forEach((card) => {
		card.removeAttribute("disabled");
	});
};

const handleCardClick = (card: HTMLElement) => {
	clickCounter += 1;

	if (card.dataset.state === "default") {
		card.dataset.state = "open";
		playSound("flip");
	}

	if (clickCounter == 2) {
		disableAllCards();
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

			enableAllCards();
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
	updateScoreDisplay();
	resetPitch();
}

// Bind on game init event (fired by game-init.ts)
window.addEventListener("game:init", bindCardHandlers);

// Also bind on initial load in case game:init fires before this script loads
document.addEventListener("DOMContentLoaded", bindCardHandlers);
