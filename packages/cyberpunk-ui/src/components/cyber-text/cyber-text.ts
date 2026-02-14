import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

export type CyberTextSize = "small" | "default" | "large";
export type CyberTextVariant = "default" | "vivid";
export type CyberTextEffect = "glow";

@customElement("cyber-text")
export class CyberText extends LitElement {
	@property({ reflect: true })
	accessor size: CyberTextSize = "default";

	@property({ reflect: true })
	accessor variant: CyberTextVariant = "default";

	@property({ reflect: true })
	accessor effect: CyberTextEffect | undefined = undefined;

	static override styles = css`
		:host {
			--_color: var(--cyber-text-color, #6c757d);
			--_font: var(--cyber-text-font, var(--cyber-font, "Courier New", Courier, monospace));
			--_weight: var(--cyber-text-weight, 600);
			--_tracking: var(--cyber-text-tracking, 0.05em);
			--_size: var(--cyber-text-size, 10px);

			display: inline;
			font-family: var(--_font);
			font-size: var(--_size);
			font-weight: var(--_weight);
			letter-spacing: var(--_tracking);
			color: var(--_color);
			text-transform: uppercase;
		}

		:host([variant="vivid"]) {
			--_color: var(--cyber-text-color, #d9d9d9);
		}

		:host([effect="glow"]) {
			text-shadow: 0 0 0.125em color-mix(in srgb, currentColor 50%, transparent), 0 0 0.5em color-mix(in srgb, currentColor 50%, transparent);
		}

		:host([size="small"]) {
			--_size: var(--cyber-text-size, 8px);
		}

		:host([size="large"]) {
			--_size: var(--cyber-text-size, 12px);
		}
	`;

	override render() {
		return html`<slot></slot>`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"cyber-text": CyberText;
	}
}
