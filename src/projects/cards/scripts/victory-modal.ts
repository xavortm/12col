// Victory modal handler - listens for game completion and shows modal

import { initializeGame } from "./game-init";

function getModalElements() {
	const modal = document.getElementById(
		"victory-modal",
	) as HTMLDialogElement | null;

	const playAgainButton = document.getElementById("victory-play-again");
	const closeButton = document.getElementById("victory-close");

	return { modal, playAgainButton, closeButton };
}

function showVictoryModal(): void {
	const { modal } = getModalElements();

	if (!modal) return;

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
}

function handleGameComplete(): void {
	showVictoryModal();
}

function initVictoryModal(): void {
	bindModalHandlers();
}

// Browser-only initialization
if (typeof window !== "undefined") {
	window.addEventListener("game:complete", handleGameComplete);
	document.addEventListener("DOMContentLoaded", initVictoryModal);
}
