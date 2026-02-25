// Grid layout calculator - determines optimal column count and aspect ratio
// to fit all cards within the viewport. Sets --cards-per-row and
// --card-aspect-ratio CSS variables, letting CSS handle the actual sizing.

// Cached DOM elements
let container: HTMLElement | null = null;
let grid: HTMLElement | null = null;

export interface FittedLayout {
	columns: number;
	adjustedAspectRatio: number;
}

export function calculateFittedLayout(
	containerWidth: number,
	containerHeight: number,
	cardCount: number,
	baseAspectRatio: number,
	gapPx: number,
): FittedLayout {
	if (cardCount === 0)
		return { columns: 1, adjustedAspectRatio: baseAspectRatio };

	const minAR = baseAspectRatio * 0.4;
	const maxAR = baseAspectRatio * 2.5;

	let bestScore = Infinity;
	let bestLayout: FittedLayout = {
		columns: 1,
		adjustedAspectRatio: baseAspectRatio,
	};

	for (let cols = 1; cols <= cardCount; cols++) {
		// Only allow perfect grids — no incomplete rows
		if (cardCount % cols !== 0) continue;

		const rows = cardCount / cols;

		const cardWidth = (containerWidth - gapPx * (cols - 1)) / cols;
		const cardHeight = (containerHeight - gapPx * (rows - 1)) / rows;

		if (cardWidth <= 0 || cardHeight <= 0) continue;

		const neededAR = cardWidth / cardHeight;

		if (neededAR < minAR || neededAR > maxAR) continue;

		const arDeviation = Math.abs(Math.log(neededAR / baseAspectRatio));
		const score = arDeviation;

		if (score < bestScore) {
			bestScore = score;
			bestLayout = { columns: cols, adjustedAspectRatio: neededAR };
		}
	}

	return bestLayout;
}

function updateGridLayout(): void {
	if (!container || !grid) return;

	const cardCount = grid.querySelectorAll<HTMLButtonElement>(
		"cyber-frame:not(.is-hidden) button",
	).length;
	if (cardCount === 0) return;

	const rect = container.getBoundingClientRect();
	if (rect.width === 0 || rect.height === 0) return;

	const baseAspectRatio = Number.parseFloat(
		grid.dataset.baseAspectRatio || "1",
	);

	// Read gap from computed styles (responsive via CSS)
	const computedGap = Number.parseFloat(getComputedStyle(grid).rowGap) || 16;

	const { columns, adjustedAspectRatio } = calculateFittedLayout(
		rect.width,
		rect.height,
		cardCount,
		baseAspectRatio,
		computedGap,
	);

	grid.style.setProperty("--cards-per-row", String(columns));
	grid.style.setProperty("--card-aspect-ratio", String(adjustedAspectRatio));
}

function initGridLayout(): void {
	container = document.querySelector<HTMLElement>(".cards-grid");
	grid = document.getElementById("cards-grid");

	if (!container) return;

	const resizeObserver = new ResizeObserver(() => {
		updateGridLayout();
	});
	resizeObserver.observe(container);

	window.addEventListener("game:init", () => {
		requestAnimationFrame(updateGridLayout);
	});

	updateGridLayout();
}

// Browser-only initialization
if (typeof document !== "undefined") {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initGridLayout);
	} else {
		initGridLayout();
	}
}
