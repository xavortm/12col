import { createInitGuard, getAllCards, getCardsPerRow } from "./dom";
import {
	addPairScore,
	calculatePairMult,
	createScoringState,
	resetStreak,
	type ScoringState,
} from "./scoring";
import { parseCssDuration } from "./utils";

type Direction = "up" | "down" | "left" | "right";

interface CardData {
	id: number;
	flips: number;
}

const DIRECTION_KEYS: Record<Direction, string[]> = {
	up: ["ArrowUp", "k"],
	down: ["ArrowDown", "j"],
	left: ["ArrowLeft", "h"],
	right: ["ArrowRight", "l"],
};

const getDirection = (key: string): Direction | undefined => {
	for (const direction in DIRECTION_KEYS) {
		if (DIRECTION_KEYS[direction as Direction].includes(key)) {
			return direction as Direction;
		}
	}
};

class CardsGame {
	private grid: HTMLElement | null = null;
	private announcer: HTMLElement | null = null;
	private scoreValue: HTMLElement | null = null;
	private scoreElement: HTMLElement | null;
	private pairScoreElement: HTMLElement | null;
	private multiplierElement: HTMLElement | null;
	private clickCounter = 0;
	private scoring: ScoringState = createScoringState();
	private isLocked = false;
	private timeWaitFlip = 1000;
	private wasInsideGrid = false;

	private shouldBindKeyboardNavigation = createInitGuard();
	private shouldBindGridFocus = createInitGuard();

	private cardsData: CardData[] = [];

	constructor() {
		this.scoreElement = document.getElementById("game-score");
		this.pairScoreElement = document.getElementById("score-pair");
		this.multiplierElement = document.getElementById("score-multiplier");

		window.addEventListener("game:init", () => this.initialize());
		document.addEventListener("DOMContentLoaded", () => this.initialize());
	}

	private initialize(): void {
		this.bindCardHandlers();
		this.bindKeyboardNavigation();
		this.bindGridFocusAnnouncement();
	}

	// ── Card state helpers ──────────────────────────────────────────

	private canClickOnCard(card: HTMLElement): boolean {
		return !this.isLocked && card.dataset.state === "default";
	}

	private setWaiting(waiting: boolean): void {
		if (!this.grid) return;
		this.grid.dataset.waiting = waiting ? "true" : "false";
	}

	private announce(message: string): void {
		if (!this.announcer) return;
		this.announcer.textContent = message;
	}

	private getCardLabel(card: HTMLElement): string {
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
	}

	private updateCardLabel(card: HTMLElement): void {
		card.setAttribute("aria-label", this.getCardLabel(card));
	}

	private getCardSibling(card: HTMLElement): HTMLElement {
		const pairString = card.dataset.pair;
		const allCards = document.querySelectorAll<HTMLElement>(
			`[data-pair="${pairString}"]`,
		);
		return allCards[0] === card ? allCards[1] : allCards[0];
	}

	private updateCardPoints(card: HTMLElement, flips: number): void {
		const pointsEl = card.querySelector<HTMLElement>(".front__points");
		if (pointsEl) {
			pointsEl.textContent = String(calculatePairMult(flips));
		}
	}

	private clickSolvesCard(card: HTMLElement): boolean {
		const sibling = this.getCardSibling(card);
		return (
			card.dataset.state === "open" && sibling.dataset.state === "open"
		);
	}

	private closeOpenCards(): void {
		const openCards = document.querySelectorAll<HTMLElement>(
			'[data-state="open"]',
		);

		openCards.forEach((card) => {
			card.dataset.state = "default";
			this.updateCardLabel(card);
		});
	}

	// ── Score animations ────────────────────────────────────────────

	private animateElements(
		targets: (HTMLElement | null)[],
		className: string,
	): void {
		for (const el of targets) {
			if (!el) continue;
			el.classList.remove(className);
			// Force reflow so re-adding the class restarts the animation
			void el.offsetWidth;
			el.classList.add(className);
			el.addEventListener(
				"animationend",
				() => el.classList.remove(className),
				{ once: true },
			);
		}
	}

	// ── Scoring ─────────────────────────────────────────────────────

	private getPointsPerPair(): number {
		if (!this.scoreElement) return 1;
		const points = this.scoreElement.dataset.pointsPerPair;
		return points ? Number.parseInt(points, 10) : 1;
	}

	private updateScoreDisplay(): void {
		if (this.scoreValue) {
			this.scoreValue.textContent =
				this.scoring.currentScore.toLocaleString();
		}
		if (this.pairScoreElement) {
			this.pairScoreElement.textContent =
				this.scoring.pairScore.toLocaleString();
		}
		if (this.multiplierElement) {
			this.multiplierElement.textContent =
				this.scoring.scoreMultiplier.toLocaleString();
		}
	}

	private addScore(cardIndex: number): void {
		const flips = this.cardsData[cardIndex].flips;
		this.scoring = addPairScore(
			this.scoring,
			flips,
			this.getPointsPerPair(),
		);

		this.updateScoreDisplay();
		this.animateElements(
			[this.pairScoreElement, this.multiplierElement, this.scoreValue],
			"score--pop",
		);
		this.announce(`Pair found, score ${this.scoring.currentScore}`);
	}

	// ── Game completion ─────────────────────────────────────────────

	private checkGameComplete(): boolean {
		return getAllCards().every((card) => card.dataset.state === "solved");
	}

	private dispatchGameComplete(): void {
		window.dispatchEvent(
			new CustomEvent("game:complete", {
				detail: { score: this.scoring.currentScore },
			}),
		);
	}

	private markCardSolved(card: HTMLElement): void {
		const sibling = this.getCardSibling(card);
		const cardIndex = Number.parseInt(card.dataset.index ?? "0", 10);

		card.dataset.state = "solved";
		sibling.dataset.state = "solved";

		this.updateCardLabel(card);
		this.updateCardLabel(sibling);

		this.addScore(cardIndex);

		if (this.checkGameComplete()) {
			this.dispatchGameComplete();
		}
	}

	// ── Click handling ──────────────────────────────────────────────

	private handleCardClick(card: HTMLElement, index: number): void {
		this.cardsData[index].flips += 1;
		this.updateCardPoints(card, this.cardsData[index].flips);

		if (card.dataset.state === "default") {
			this.clickCounter += 1;
			card.dataset.state = "open";
			this.updateCardLabel(card);
			this.announce(card.dataset.pair ?? "Card");
		}

		if (this.clickCounter === 2) {
			this.isLocked = true;
			const isSolved = this.clickSolvesCard(card);
			const waitTime = isSolved ? 0 : this.timeWaitFlip;

			if (!isSolved) {
				this.setWaiting(true);
			}

			// Wait for the flip animation to complete before checking the match
			setTimeout(() => {
				if (isSolved) {
					this.markCardSolved(card);
				} else {
					this.closeOpenCards();
					this.scoring = resetStreak(this.scoring);
					this.updateScoreDisplay();
					this.animateElements(
						[this.multiplierElement],
						"score--shake",
					);
				}

				this.isLocked = false;
				this.setWaiting(false);
			}, waitTime);

			this.clickCounter = 0;

			return;
		}
	}

	private bindCardHandlers(): void {
		// Cache DOM elements on first init
		this.grid = document.getElementById("cards-grid");
		this.announcer = document.getElementById("card-announcer");
		this.scoreValue = document.getElementById("score-value");

		const cards = getAllCards();

		// Read the CSS variable to sync with animation duration
		if (cards.length > 0) {
			const firstCard = cards[0];
			const style = getComputedStyle(firstCard);
			const duration = style.getPropertyValue("--card-flip-duration");
			const durationMs = parseCssDuration(duration);

			if (!Number.isNaN(durationMs)) {
				// Add 200ms buffer to the animation duration
				this.timeWaitFlip = durationMs + 200;
			}
		}

		this.cardsData = cards.map((_, index) => ({ id: index, flips: 0 }));

		cards.forEach((card, index) => {
			card.dataset.index = String(index);
			card.addEventListener("click", () => {
				if (this.canClickOnCard(card)) {
					this.handleCardClick(card, index);
				}
			});
		});

		// Reset game state
		this.clickCounter = 0;
		this.scoring = createScoringState();
		this.isLocked = false;
		this.updateScoreDisplay();
	}

	// ── Keyboard navigation ─────────────────────────────────────────

	private handleArrowNavigation(event: KeyboardEvent): void {
		const direction = getDirection(event.key);
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

		const cols = this.grid ? getCardsPerRow(this.grid) : 1;
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

	private bindKeyboardNavigation(): void {
		if (!this.shouldBindKeyboardNavigation()) return;

		// Listen on document to catch keys even when focus is on body (after solving)
		document.addEventListener("keydown", (event) => {
			if (!this.grid) return;

			const activeEl = document.activeElement;
			const isOnCard = this.grid.contains(activeEl);
			const isOnBody = activeEl === document.body;

			// Only handle if focus is on a card or on body (lost focus after solving)
			if (isOnCard || isOnBody) {
				this.handleArrowNavigation(event);
			}
		});
	}

	// ── Grid focus announcement ─────────────────────────────────────

	private getGridDimensions(): { cols: number; rows: number } {
		if (!this.grid) return { cols: 0, rows: 0 };

		const cols = getCardsPerRow(this.grid);
		const cardCount = this.grid.children.length;
		const rows = Math.ceil(cardCount / cols);

		return { cols, rows };
	}

	private announceGridDimensions(): void {
		const { cols, rows } = this.getGridDimensions();
		if (cols > 0 && rows > 0) {
			const colWord = cols === 1 ? "column" : "columns";
			const rowWord = rows === 1 ? "row" : "rows";
			this.announce(
				`Cards are in a grid of ${cols} ${colWord}, ${rows} ${rowWord}`,
			);
		}
	}

	private bindGridFocusAnnouncement(): void {
		if (!this.shouldBindGridFocus()) return;

		document.addEventListener("focusin", () => {
			if (!this.grid) return;

			const isInsideGrid = this.grid.contains(document.activeElement);

			if (isInsideGrid && !this.wasInsideGrid) {
				this.announceGridDimensions();
			}

			this.wasInsideGrid = isInsideGrid;
		});
	}
}

// Instantiate the game
new CardsGame();
