import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../cyber-frame/cyber-frame";
import "../cyber-frame-corner/cyber-frame-corner";

export type CyberButtonType = "default";

@customElement("cyber-button")
export class CyberButton extends LitElement {
	@property()
	accessor href: string = "#";

	@property()
	accessor wrap: string = "";

	@property({ reflect: true })
	accessor type: CyberButtonType = "default";

	static override styles = css`
		:host {
			display: inline-block;
		}

		cyber-frame {
			display: block;
			--cyber-frame-corner-accent: #fff;
			--cyber-frame-corner-transition-duration: 150ms;
			--cyber-frame-corner-transition-easing: ease;
		}

		a {
			display: flex;
			gap: 0.5em;
			align-items: center;
			justify-content: center;
			text-decoration: none;
			color: inherit;
			font: inherit;
			padding: 0.75rem 0.625rem;
			transition: background-color var(--cyber-transition, 150ms ease),
				color var(--cyber-transition, 150ms ease);
		}

		a:hover {
			background-color: var(--cyber-button-bg-hover, var(--color-primary, #80f891));
			color: var(--cyber-button-color-hover, var(--color-primary-inverted, #030405));
		}

		:host(:hover) cyber-frame {
			--cyber-frame-corner-accent: var(--cyber-button-color-hover, var(--color-primary-inverted, #030405));
			--cyber-frame-corner-offset: -3px;
		}

		.highlight {
			color: var(--cyber-button-highlight, var(--color-primary, #80f891));
		}

		a:hover .highlight {
			color: inherit;
		}
	`;

	override render() {
		const wrapEl = this.wrap
			? html`<span class="highlight">${this.wrap}</span>`
			: null;

		const link = html`
			<a href=${this.href} part="link">
				${wrapEl}
				<slot></slot>
				${wrapEl}
			</a>
		`;

		return html`
			<cyber-frame>
				<cyber-frame-corner
					slot="corner"
					position="all"
					size="tiny"
				></cyber-frame-corner>
				<div slot="content">${link}</div>
			</cyber-frame>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"cyber-button": CyberButton;
	}
}
