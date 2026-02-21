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

			display: block;
			position: relative;
		}

		.frame-layer {
			position: absolute;
			inset: var(--cyber-frame-inset, 0);
			background-color: var(--_bg);
			pointer-events: none;
			transition: inset var(--cyber-frame-transition-duration, 0s) var(--cyber-frame-transition-easing, ease);
		}

		:host(:not([appearance="cut-edges"])) .frame-layer {
			outline: 1px solid var(--_border-color);
		}

		:host([appearance="cut-edges"]) {
			clip-path: polygon(
				var(--cyber-frame-cut-size) 0%,
				calc(100% - var(--cyber-frame-cut-size)) 0%,
				100% var(--cyber-frame-cut-size),
				100% calc(100% - var(--cyber-frame-cut-size)),
				calc(100% - var(--cyber-frame-cut-size)) 100%,
				var(--cyber-frame-cut-size) 100%,
				0% calc(100% - var(--cyber-frame-cut-size)),
				0% var(--cyber-frame-cut-size)
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

	private _ro?: ResizeObserver;
	private _svgW: number = 0;
	private _svgH: number = 0;
	private _svgPoints: string = "";

	override connectedCallback() {
		super.connectedCallback();
		if (this.appearance === "cut-edges") {
			this._setupResizeObserver();
		}
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		this._ro?.disconnect();
		this._ro = undefined;
	}

	override render() {
		const frameLayer =
			this.appearance === "cut-edges"
				? html`
						<div class="frame-layer" aria-hidden="true">
							<div class="border-overlay">
								<svg
									viewBox="0 0 ${this._svgW} ${this._svgH}"
									preserveAspectRatio="none"
								>
									<polygon
										points=${this._svgPoints}
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

	override updated(changed: Map<string, unknown>) {
		if (this.appearance === "cut-edges") {
			this.style.setProperty(
				"--cyber-frame-cut-size",
				`${this.cutSize}px`,
			);
		} else {
			this.style.removeProperty("--cyber-frame-cut-size");
		}

		if (changed.has("appearance")) {
			if (this.appearance === "cut-edges") {
				this._setupResizeObserver();
			} else {
				this._ro?.disconnect();
				this._ro = undefined;
			}
		}
	}

	private _setupResizeObserver() {
		this._ro?.disconnect();
		this._ro = new ResizeObserver((entries) => {
			this._updateBorderSvg(entries[0]);
		});
		this._ro.observe(this);
		this._updateBorderSvg();
	}

	private _updateBorderSvg(entry?: ResizeObserverEntry) {
		const w = entry ? entry.contentBoxSize[0].inlineSize : this.offsetWidth;
		const h = entry ? entry.contentBoxSize[0].blockSize : this.offsetHeight;
		const s = this.cutSize;

		this._svgPoints = [
			`${s},0`,
			`${w - s},0`,
			`${w},${s}`,
			`${w},${h - s}`,
			`${w - s},${h}`,
			`${s},${h}`,
			`0,${h - s}`,
			`0,${s}`,
		].join(" ");
		this._svgW = w;
		this._svgH = h;
		this.requestUpdate();
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"cyber-frame": CyberFrame;
	}
}
