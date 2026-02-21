import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

export type CyberProgressDirection = "left" | "right";

@customElement("cyber-progress")
export class CyberProgress extends LitElement {
	@property({ type: Number })
	accessor progress: number = 0;

	@property({ reflect: true })
	accessor direction: CyberProgressDirection = "left";

	static override styles = css`
		:host {
			--_stroke: var(--cyber-progress-stroke, var(--cyber-stroke, #6c757d));
			--_fill: var(--cyber-progress-fill, var(--cyber-text, #0ff));
			--_height: var(--cyber-progress-height, 10px);
			--_inset: var(--cyber-progress-inset, 3px);

			display: block;
			position: relative;
			block-size: var(--_height);
			border: 1px solid var(--_stroke);
		}

		.track {
			position: absolute;
			inset: var(--_inset);
		}

		.fill {
			position: absolute;
			inset: 0;
			background-color: var(--_fill);
		}

		:host([direction="left"]) .fill {
			inset-inline-end: auto;
		}

		:host([direction="right"]) .fill {
			inset-inline-start: auto;
		}

		.ticks {
			position: absolute;
			inset: 0;
			background-image: url("data:image/svg+xml;utf8,<svg width='4' height='2' viewBox='0 0 4 2' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M1 0H3L2 2H0L1 0Z' fill='white' fill-opacity='0.4'/></svg>");
			background-size: 6px 100%;
			background-repeat: repeat-x;
			background-position: center;
		}
	`;

	override render() {
		const clamped = Math.min(100, Math.max(0, this.progress));
		return html`
			<div class="track">
				<div class="fill" style="inline-size: ${clamped}%"></div>
				<div class="ticks"></div>
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"cyber-progress": CyberProgress;
	}
}
