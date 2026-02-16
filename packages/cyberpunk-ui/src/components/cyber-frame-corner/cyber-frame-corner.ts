import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

export type FrameCornerPosition =
	| "top-left"
	| "top-right"
	| "bottom-left"
	| "bottom-right";

export type FrameCornerSize = "small" | "default";

const ALL_POSITIONS: FrameCornerPosition[] = [
	"top-left",
	"top-right",
	"bottom-left",
	"bottom-right",
];

@customElement("cyber-frame-corner")
export class CyberFrameCorner extends LitElement {
	/** Space-separated positions, or "all". */
	@property()
	accessor position: string = "top-left";

	@property({ reflect: true })
	accessor size: FrameCornerSize = "default";

	private get _positions(): FrameCornerPosition[] {
		const raw = this.position.trim();
		if (raw === "all") return ALL_POSITIONS;
		return raw
			.split(/\s+/)
			.filter((p): p is FrameCornerPosition =>
				ALL_POSITIONS.includes(p as FrameCornerPosition),
			);
	}

	static override styles = css`
		:host {
			--_accent: var(
				--cyber-frame-corner-accent,
				var(--color-primary, #80f992)
			);
			--_size: var(--cyber-frame-corner-size, 0.75rem);
			--_weight: var(--cyber-frame-corner-weight, 2px);

			display: contents;
			pointer-events: none;
		}

		:host([size="small"]) {
			--_size: 0.5rem;
		}

		span {
			position: absolute;
			display: block;
			inline-size: var(--_size);
			block-size: var(--_size);
			z-index: 2;
		}

		.top-left {
			top: -1px;
			left: -1px;
			border-top: var(--_weight) solid var(--_accent);
			border-left: var(--_weight) solid var(--_accent);
		}

		.top-right {
			top: -1px;
			right: -1px;
			border-top: var(--_weight) solid var(--_accent);
			border-right: var(--_weight) solid var(--_accent);
		}

		.bottom-left {
			bottom: -1px;
			left: -1px;
			border-bottom: var(--_weight) solid var(--_accent);
			border-left: var(--_weight) solid var(--_accent);
		}

		.bottom-right {
			bottom: -1px;
			right: -1px;
			border-bottom: var(--_weight) solid var(--_accent);
			border-right: var(--_weight) solid var(--_accent);
		}
	`;

	override render() {
		const positions = this._positions;
		if (positions.length === 0) return nothing;
		return html`${positions.map((p) => html`<span class=${p}></span>`)}`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"cyber-frame-corner": CyberFrameCorner;
	}
}
