import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

export type FrameVariant = "default";
export type FrameAppearance = "default" | "cut-edges";

@customElement("cyber-frame")
export class CyberFrame extends LitElement {
	@property({ reflect: true })
	accessor variant: FrameVariant = "default";

	@property({ reflect: true })
	accessor appearance: FrameAppearance = "default";

	@property({ type: Number, attribute: "cut-size", reflect: true })
	accessor cutSize: number = 12;

	static override styles = css`
		:host {
			--_border-color: var(
				--cyber-frame-border-color,
				var(--color-border, #373b3e)
			);
			--_bg: var(
				--cyber-frame-bg,
				var(--color-surface, #121214)
			);
			--_cut-size: var(--cyber-frame-cut-size);

			display: block;
			position: relative;
		}

		.frame-layer {
			position: absolute;
			inset: 0;
			background-color: var(--_bg);
			pointer-events: none;
		}

		:host(:not([appearance="cut-edges"])) .frame-layer {
			outline: 1px solid var(--_border-color);
		}

		:host([appearance="cut-edges"]) {
			clip-path: polygon(
				var(--_cut-size) 0%,
				calc(100% - var(--_cut-size)) 0%,
				100% var(--_cut-size),
				100% calc(100% - var(--_cut-size)),
				calc(100% - var(--_cut-size)) 100%,
				var(--_cut-size) 100%,
				0% calc(100% - var(--_cut-size)),
				0% var(--_cut-size)
			);
		}

		.border-overlay {
			display: none;
		}

		:host([appearance="cut-edges"]) .border-overlay {
			display: block;
			position: absolute;
			inset: 0;
			pointer-events: none;
		}

		:host([appearance="cut-edges"]) .border-overlay svg {
			display: block;
			width: 100%;
			height: 100%;
		}

		.content-layer {
			position: relative;
			z-index: 1;
		}
	`;

	override render() {
		const frameLayer =
			this.appearance === "cut-edges"
				? html`
						<div class="frame-layer" aria-hidden="true">
							<div class="border-overlay">
								<svg preserveAspectRatio="none">
									<polygon
										points=""
										fill="none"
										stroke="var(--_border-color)"
										stroke-width="1"
										vector-effect="non-scaling-stroke"
									/>
								</svg>
							</div>
						</div>
					`
				: html`<div class="frame-layer" aria-hidden="true"></div>`;

		return html`
			${frameLayer}
			<slot name="corner"></slot>
			<div class="content-layer">
				<slot name="content"></slot>
			</div>
		`;
	}

	override updated(_changed: Map<string, unknown>) {
		if (this.appearance === "cut-edges") {
			this.style.setProperty("--_cut-size", `${this.cutSize}px`);
			this._updateBorderSvg();
		} else {
			this.style.removeProperty("--_cut-size");
		}
	}

	private _updateBorderSvg() {
		const polygon = this.shadowRoot?.querySelector("polygon");
		if (!polygon) return;

		const rect = this.getBoundingClientRect();
		const w = rect.width;
		const h = rect.height;
		const s = this.cutSize;

		const points = [
			`${s},0`,
			`${w - s},0`,
			`${w},${s}`,
			`${w},${h - s}`,
			`${w - s},${h}`,
			`${s},${h}`,
			`0,${h - s}`,
			`0,${s}`,
		].join(" ");

		polygon.setAttribute("points", points);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"cyber-frame": CyberFrame;
	}
}
