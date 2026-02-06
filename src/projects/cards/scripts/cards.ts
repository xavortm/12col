import { createInitGuard, getAllCards, getCardsPerRow } from "./dom";
import { parseCssDuration } from "./utils";

type Direction = "up" | "down" | "left" | "right";

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
	private clickCounter = 0;
	private currentScore = 0;
	private isLocked = false;
	private timeWaitFlip = 1000;
	private wasInsideGrid = false;

	private shouldBindKeyboardNavigation = createInitGuard();
	private shouldBindGridFocus = createInitGuard();

	constructor() {
		this.scoreElement = document.getElementById("game-score");

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

	// ── Scoring ─────────────────────────────────────────────────────

	private getPointsPerPair(): number {
		if (!this.scoreElement) return 1;
		const points = this.scoreElement.dataset.pointsPerPair;
		return points ? Number.parseInt(points, 10) : 1;
	}

	private updateScoreDisplay(): void {
		if (this.scoreValue) {
			this.scoreValue.textContent = String(this.currentScore);
		}
	}

	private addScore(): void {
		const points = this.getPointsPerPair();
		this.currentScore += points;
		this.updateScoreDisplay();
		this.announce(`Pair found, score ${this.currentScore}`);
	}

	// ── Game completion ─────────────────────────────────────────────

	private checkGameComplete(): boolean {
		return getAllCards().every((card) => card.dataset.state === "solved");
	}

	private dispatchGameComplete(): void {
		window.dispatchEvent(
			new CustomEvent("game:complete", {
				detail: { score: this.currentScore },
			}),
		);
	}

	private markCardSolved(card: HTMLElement): void {
		const sibling = this.getCardSibling(card);

		card.dataset.state = "solved";
		sibling.dataset.state = "solved";

		this.updateCardLabel(card);
		this.updateCardLabel(sibling);

		this.addScore();

		if (this.checkGameComplete()) {
			this.dispatchGameComplete();
		}
	}

	// ── Click handling ──────────────────────────────────────────────

	private handleCardClick(card: HTMLElement): void {
		this.clickCounter += 1;

		if (card.dataset.state === "default") {
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

		cards.forEach((card) => {
			card.addEventListener("click", () => {
				if (this.canClickOnCard(card)) {
					this.handleCardClick(card);
				}
			});
		});

		// Reset game state
		this.clickCounter = 0;
		this.currentScore = 0;
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
