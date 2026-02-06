/**
 * Parse a CSS duration value (e.g., "800ms", "0.8s", ".8s") to milliseconds.
 * Returns NaN if the value cannot be parsed.
 */
export function parseCssDuration(value: string): number {
	const trimmed = value.trim().toLowerCase();
	const numericPart = Number.parseFloat(trimmed);

	if (Number.isNaN(numericPart)) {
		return Number.NaN;
	}

	if (trimmed.endsWith("ms")) {
		return numericPart;
	}

	if (trimmed.endsWith("s")) {
		return numericPart * 1000;
	}

	// No unit - assume milliseconds
	return numericPart;
}
