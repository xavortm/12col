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

interface TimeFormat {
	display: string;
	iso8601: string;
}

function formatTime(seconds: number): TimeFormat {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	// Human-readable display format: HH:MM:SS
	const display = [hours, minutes, secs]
		.map((val) => String(val).padStart(2, "0"))
		.join(":");

	// ISO 8601 duration format: PT[H]H[M]M[S]S
	// Only include non-zero components (except seconds which is always shown)
	let iso8601 = "PT";
	if (hours > 0) iso8601 += `${hours}H`;
	if (minutes > 0) iso8601 += `${minutes}M`;
	iso8601 += `${secs}S`;

	return { display, iso8601 };
}

function updateClock(): void {
	const clockElement = document.getElementById("game-clock");
	const timeDisplay = clockElement?.querySelector<HTMLTimeElement>(".clock__time");

	if (!timeDisplay) return;

	const elapsedSeconds = Math.floor(
		(Date.now() - clockState.startTime) / 1000,
	);
	const formatted = formatTime(elapsedSeconds);

	timeDisplay.textContent = formatted.display;
	timeDisplay.dateTime = formatted.iso8601;
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
