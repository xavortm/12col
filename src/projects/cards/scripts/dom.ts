// Shared DOM utilities for the cards game

export const CARD_SELECTOR = ".cards-grid__inner button";

export function getAllCards(): HTMLElement[] {
	return Array.from(
		document.querySelectorAll<HTMLElement>(CARD_SELECTOR),
	).filter((card) => !card.closest(".is-hidden"));
}

export function getCardsPerRow(grid: HTMLElement): number {
	const value = getComputedStyle(grid).getPropertyValue("--cards-per-row");
	return Number.parseInt(value, 10) || 1;
}

export function createInitGuard(): () => boolean {
	let initialized = false;
	return () => {
		if (initialized) return false;
		initialized = true;
		return true;
	};
}
