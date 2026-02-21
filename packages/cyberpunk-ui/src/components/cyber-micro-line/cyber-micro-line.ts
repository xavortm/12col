import {
	css,
	html,
	LitElement,
	nothing,
	type SVGTemplateResult,
	svg,
} from "lit";
import { customElement, property } from "lit/decorators.js";

export type CyberMicroLineNumberPosition = "start" | "end";

interface Bar {
	x: number;
	width: number;
}

const WIDTHS = [1, 2, 2, 3, 4, 6];

function generateBars(length: number): Bar[] {
	const bars: Bar[] = [];
	let cursor = 0;

	while (cursor < length) {
		// Varied gaps: sometimes tight (1–2px), sometimes wide (4–10px)
		const gapRoll = Math.random();
		const gap =
			gapRoll < 0.3
				? 1 + Math.floor(Math.random() * 2)
				: gapRoll < 0.7
					? 3 + Math.floor(Math.random() * 4)
					: 6 + Math.floor(Math.random() * 5);

		cursor += gap;
		if (cursor >= length) break;

		const w = WIDTHS[Math.floor(Math.random() * WIDTHS.length)];

		if (cursor + w > length) break;

		bars.push({ x: cursor, width: w });
		cursor += w;
	}

	return bars;
}

@customElement("cyber-micro-line")
export class CyberMicroLine extends LitElement {
	@property()
	accessor number: string = "";

	@property({ type: Number })
	accessor length: number = 36;

	@property({ reflect: true, attribute: "number-position" })
	accessor numberPosition: CyberMicroLineNumberPosition = "end";

	private _bars: Bar[] = [];

	static override styles = css`
		:host {
			--_color: var(--cyber-micro-line-color, var(--color-fg, #eaecef));
			--_gap: var(--cyber-micro-line-gap, 1.5em);
			--_number-size: var(--cyber-micro-line-number-size, 6px);

			display: inline-flex;
			gap: var(--_gap);
			align-items: center;
		}

		svg {
			display: block;
		}

		small {
			margin: 0;
			font-size: var(--_number-size);
			display: inline-block;
			line-height: 1;
		}
	`;

	override connectedCallback() {
		super.connectedCallback();
		this._bars = generateBars(this.length);
	}

	override render() {
		const rects: SVGTemplateResult[] = this._bars.map(
			(b) =>
				svg`<rect x=${b.x} width=${b.width} height="6" fill="currentColor" />`,
		);

		const barsSvg = html`
			<svg
				width=${this.length}
				height="6"
				viewBox="0 0 ${this.length} 6"
				fill="none"
				aria-hidden="true"
				style="color: var(--_color)"
			>
				${rects}
			</svg>
		`;

		const numberEl = this.number
			? html`<small>${this.number}</small>`
			: nothing;

		return this.numberPosition === "start"
			? html`${numberEl}${barsSvg}`
			: html`${barsSvg}${numberEl}`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"cyber-micro-line": CyberMicroLine;
	}
}
