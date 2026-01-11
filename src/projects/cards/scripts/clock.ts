// Cards interactive logic - completely self-contained
// This script handles card clicks and clock timer

interface ClockState {
	startTime: number;
	intervalId: number | null;
}

const clockState: ClockState = {
	startTime: 0,
	intervalId: null,
};

function formatTime(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	return [hours, minutes, secs]
		.map((val) => String(val).padStart(2, "0"))
		.join(":");
}

function updateClock(): void {
	const clockElement = document.getElementById("game-clock");
	const timeDisplay = clockElement?.querySelector(".clock__time");

	if (!timeDisplay) return;

	const elapsedSeconds = Math.floor(
		(Date.now() - clockState.startTime) / 1000,
	);
	timeDisplay.textContent = formatTime(elapsedSeconds);
}

function startClock(): void {
	const clockElement = document.getElementById("game-clock");
	if (!clockElement) return;

	const hasStarted = clockElement.dataset.started === "true";
	if (hasStarted) return;

	clockElement.dataset.started = "true";
	clockState.startTime = Date.now();
	updateClock();
	clockState.intervalId = window.setInterval(updateClock, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
	// Select all card figures
	const cards = document.querySelectorAll<HTMLElement>(".cards-grid figure");

	// Add click listener to each card
	cards.forEach((card) => {
		card.addEventListener("click", () => {
			startClock();
		});
	});
});
