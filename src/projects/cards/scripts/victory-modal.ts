// Victory modal handler - listens for game completion and shows modal

import { initializeGame } from "./game-init";

interface GameCompleteEvent extends CustomEvent {
	detail: {
		score: number;
	};
}

function getModalElements() {
	const modal = document.getElementById("victory-modal") as HTMLDialogElement | null;
	const scoreDisplay = document.getElementById("victory-score");
	const playAgainButton = document.getElementById("victory-play-again");
	const closeButton = document.getElementById("victory-close");

	return { modal, scoreDisplay, playAgainButton, closeButton };
}

function showVictoryModal(score: number): void {
	const { modal, scoreDisplay } = getModalElements();

	if (!modal) return;

	if (scoreDisplay) {
		scoreDisplay.textContent = String(score);
	}

	modal.showModal();
}

function hideVictoryModal(): void {
	const { modal } = getModalElements();
	if (modal?.open) {
		modal.close();
	}
}

function startNewGame(): void {
	hideVictoryModal();
	// Re-initialize the game (renders new cards and dispatches game:init)
	initializeGame();
}

function bindModalHandlers(): void {
	const { modal, playAgainButton, closeButton } = getModalElements();

	if (!modal) return;

	playAgainButton?.addEventListener("click", startNewGame);
	closeButton?.addEventListener("click", hideVictoryModal);

	// Close on backdrop click
	modal.addEventListener("click", (event) => {
		if (event.target === modal) {
			hideVictoryModal();
		}
	});

	// Close on Escape key (native dialog behavior, but ensure modal closes cleanly)
	modal.addEventListener("close", () => {
		// Modal closed via Escape or other means
	});
}

function handleGameComplete(event: Event): void {
	const customEvent = event as GameCompleteEvent;
	showVictoryModal(customEvent.detail.score);
}

function initVictoryModal(): void {
	bindModalHandlers();
}

// Browser-only initialization
if (typeof window !== "undefined") {
	window.addEventListener("game:complete", handleGameComplete);
	document.addEventListener("DOMContentLoaded", initVictoryModal);
}
