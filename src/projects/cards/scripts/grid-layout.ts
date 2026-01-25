// Grid layout calculator - determines optimal column count to fit all cards
// Sets --cards-per-row CSS variable, letting CSS handle the actual sizing

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

	// Try increasing column counts, find minimum that fits
	for (let cols = 1; cols <= cardCount; cols++) {
		const rows = Math.ceil(cardCount / cols);

		// Calculate card dimensions for this column count
		// cardWidth = (containerWidth - gaps) / cols
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

	// If nothing fits, use max columns (smallest cards)
	return cardCount;
}

function updateGridLayout(): void {
	const container = document.querySelector<HTMLElement>('.cards-grid');
	const grid = document.getElementById('cards-grid');

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
	const container = document.querySelector<HTMLElement>('.cards-grid');
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
