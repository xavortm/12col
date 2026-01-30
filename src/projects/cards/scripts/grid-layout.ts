// Grid layout calculator - determines optimal column count to fit all cards
// Sets --cards-per-row CSS variable, letting CSS handle the actual sizing

// Cached DOM elements
let container: HTMLElement | null = null;
let grid: HTMLElement | null = null;

export interface GridConfig {
	aspectRatio: number; // card width / height (3:4 = 0.75)
	gapPx: number;
}

const CONFIG: GridConfig = {
	aspectRatio: 3 / 4,
	gapPx: 16, // 1rem = 16px
};

export function calculateOptimalColumns(
	containerWidth: number,
	containerHeight: number,
	cardCount: number,
	config: GridConfig
): number {
	if (cardCount === 0) return 1;

	const { aspectRatio, gapPx } = config;

	// Get all column counts that evenly divide the card count (no orphan rows)
	const validColumnCounts: number[] = [];
	for (let cols = 1; cols <= cardCount; cols++) {
		if (cardCount % cols === 0) {
			validColumnCounts.push(cols);
		}
	}

	// Find minimum columns that fits vertically (maximizes card size while fitting)
	for (const cols of validColumnCounts) {
		const rows = cardCount / cols;

		// Calculate card dimensions based on available width
		const totalHorizontalGap = gapPx * (cols - 1);
		const cardWidth = (containerWidth - totalHorizontalGap) / cols;
		const cardHeight = cardWidth / aspectRatio;

		// Calculate total grid height
		const totalVerticalGap = gapPx * (rows - 1);
		const gridHeight = rows * cardHeight + totalVerticalGap;

		// If this configuration fits, use it (maximizes card size)
		if (gridHeight <= containerHeight) {
			return cols;
		}
	}

	// If nothing fits, use max columns (smallest cards, single row)
	return cardCount;
}

function updateGridLayout(): void {
	if (!container || !grid) return;

	const cardCount = grid.children.length;
	if (cardCount === 0) return;

	// Get available dimensions from the container
	const rect = container.getBoundingClientRect();
	const containerWidth = rect.width;
	const containerHeight = rect.height;

	// Skip if container has no dimensions yet
	if (containerWidth === 0 || containerHeight === 0) return;

	const columns = calculateOptimalColumns(
		containerWidth,
		containerHeight,
		cardCount,
		CONFIG
	);

	grid.style.setProperty('--cards-per-row', String(columns));
}

function initGridLayout(): void {
	// Cache DOM elements
	container = document.querySelector<HTMLElement>('.cards-grid');
	grid = document.getElementById('cards-grid');

	if (!container) return;

	// Observe container size changes
	const resizeObserver = new ResizeObserver(() => {
		updateGridLayout();
	});
	resizeObserver.observe(container);

	// Also update when cards change (game init fires this event)
	window.addEventListener('game:init', () => {
		// Small delay to ensure DOM is updated
		requestAnimationFrame(updateGridLayout);
	});

	// Initial calculation
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
