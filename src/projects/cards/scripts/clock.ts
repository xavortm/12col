// Clock timer logic for the cards game

import { getAllCards } from "./dom";

// Cached DOM elements
let clockElement: HTMLElement | null = null;
let timeDisplay: HTMLTimeElement | null = null;

interface ClockState {
	startTime: number;
	intervalId: number | null;
}

const clockState: ClockState = {
	startTime: 0,
	intervalId: null,
};

export interface TimeFormat {
	display: string;
	iso8601: string;
}

export function formatTime(seconds: number): TimeFormat {
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
	if (!timeDisplay) return;

	const elapsedSeconds = Math.floor((Date.now() - clockState.startTime) / 1000);
	const formatted = formatTime(elapsedSeconds);

	timeDisplay.textContent = formatted.display;
	timeDisplay.dateTime = formatted.iso8601;
}

function startClock(): void {
	if (!clockElement) return;

	const hasStarted = clockElement.dataset.started === "true";
	if (hasStarted) return;

	clockElement.dataset.started = "true";
	clockState.startTime = Date.now();
	updateClock();
	clockState.intervalId = window.setInterval(updateClock, 1000);
}

function resetClock(): void {
	if (clockState.intervalId !== null) {
		clearInterval(clockState.intervalId);
		clockState.intervalId = null;
	}
	clockState.startTime = 0;

	if (clockElement) {
		clockElement.dataset.started = "false";
	}
	if (timeDisplay) {
		timeDisplay.textContent = "00:00:00";
		timeDisplay.dateTime = "PT0S";
	}
}

function bindClockHandlers(): void {
	getAllCards().forEach((card) => {
		card.addEventListener("click", () => {
			startClock();
		});
	});
}

function initClock(): void {
	// Cache DOM elements
	clockElement = document.getElementById("game-clock");
	timeDisplay =
		clockElement?.querySelector<HTMLTimeElement>(".clock__time") ?? null;

	resetClock();
	bindClockHandlers();
}

// Browser-only initialization
if (typeof window !== "undefined") {
	// Bind on game init event (fired by game-init.ts)
	window.addEventListener("game:init", initClock);

	// Also bind on initial load in case game:init fires before this script loads
	document.addEventListener("DOMContentLoaded", initClock);
}
