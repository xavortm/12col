import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

export type FrameCornerPosition =
	| "top-left"
	| "top-right"
	| "bottom-left"
	| "bottom-right";

export type FrameCornerSize = "tiny" | "small" | "default";
export type FrameCornerVariant = "default" | "partial-outline";

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

	@property({ reflect: true })
	accessor variant: FrameCornerVariant = "default";

	/** How far along each edge the line extends from each corner (0–0.5). */
	@property({ type: Number })
	accessor coverage: number = 0.4;

	private _outlinePath: string = "";
	private _viewW: number = 0;
	private _viewH: number = 0;

	private _ro?: ResizeObserver;

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

		:host([size="tiny"]) {
			--_size: 0.25rem;
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

		.partial-outline {
			position: absolute;
			inset: 0;
			z-index: 2;
			pointer-events: none;
		}

		.partial-outline svg {
			display: block;
			width: 100%;
			height: 100%;
		}
	`;

	override connectedCallback() {
		super.connectedCallback();
		if (this.variant === "partial-outline") {
			this._setupResizeObserver();
		}
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		this._ro?.disconnect();
	}

	override updated(changed: Map<string, unknown>) {
		if (changed.has("variant")) {
			if (this.variant === "partial-outline") {
				this._setupResizeObserver();
			} else {
				this._ro?.disconnect();
			}
		}
	}

	private _getFrameHost(): HTMLElement | null {
		return this.closest("cyber-frame");
	}

	private _setupResizeObserver() {
		this._ro?.disconnect();
		const target = this._getFrameHost();
		if (!target) return;
		this._ro = new ResizeObserver(() => this._updateOutlinePath());
		this._ro.observe(target);
		this._updateOutlinePath();
	}

	private _updateOutlinePath() {
		const frame = this._getFrameHost();
		if (!frame) return;

		const rect = frame.getBoundingClientRect();
		const w = rect.width;
		const h = rect.height;
		const isCutEdges = frame.getAttribute("appearance") === "cut-edges";
		const cutSize = isCutEdges
			? Number(frame.getAttribute("cut-size") || 12)
			: 0;

		let vertices: [number, number][];
		if (isCutEdges) {
			const s = cutSize;
			vertices = [
				[s, 0],
				[w - s, 0],
				[w, s],
				[w, h - s],
				[w - s, h],
				[s, h],
				[0, h - s],
				[0, s],
			];
		} else {
			vertices = [
				[0, 0],
				[w, 0],
				[w, h],
				[0, h],
			];
		}

		const n = vertices.length;
		const ratio = Math.min(this.coverage, 0.5);
		const parts: string[] = [];

		for (let i = 0; i < n; i++) {
			const [x1, y1] = vertices[i];
			const [x2, y2] = vertices[(i + 1) % n];

			// From start vertex, coverage% toward end
			const ex1 = x1 + (x2 - x1) * ratio;
			const ey1 = y1 + (y2 - y1) * ratio;
			parts.push(`M${x1},${y1}L${ex1},${ey1}`);

			// From end vertex, coverage% back toward start
			const ex2 = x2 + (x1 - x2) * ratio;
			const ey2 = y2 + (y1 - y2) * ratio;
			parts.push(`M${x2},${y2}L${ex2},${ey2}`);
		}

		this._outlinePath = parts.join("");
		this._viewW = w;
		this._viewH = h;
		this.requestUpdate();
	}

	override render() {
		if (this.variant === "partial-outline") {
			return html`
				<div class="partial-outline" aria-hidden="true">
					<svg
						viewBox="0 0 ${this._viewW} ${this._viewH}"
						preserveAspectRatio="none"
					>
						<path
							d=${this._outlinePath}
							fill="none"
							stroke="var(--_accent)"
							stroke-width="1"
							vector-effect="non-scaling-stroke"
						/>
					</svg>
				</div>
			`;
		}

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
