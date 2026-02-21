import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

export type CyberDotSize = "tiny" | "small" | "default" | "large";
export type CyberDotAnimation = "pulse" | "wave" | "heartbeat";

@customElement("cyber-dot")
export class CyberDot extends LitElement {
	@property({ type: Number })
	accessor count: number = 1;

	@property({ reflect: true })
	accessor size: CyberDotSize = "default";

	@property({ reflect: true })
	accessor animation: CyberDotAnimation | undefined = undefined;

	static override styles = css`
		:host {
			--_color: var(--cyber-dot-color, var(--cyber-text, #0ff));
			--_glow: var(--cyber-dot-glow, var(--cyber-glow, rgba(0, 255, 255, 0.6)));
			--_gap: var(--cyber-dot-gap, 0.4em);
			--_duration: var(--cyber-dot-duration, 1.5s);
			--_wave-delay: var(--cyber-dot-wave-delay, 0.15s);
			--_heartbeat-scale: var(--cyber-dot-heartbeat-scale, 2.8);

			display: inline-flex;
			gap: var(--_gap);
			align-items: center;
		}

		span {
			display: block;
			inline-size: 0.5em;
			block-size: 0.5em;
			border-radius: 50%;
			background: var(--_color);
			box-shadow: 0 0 6px var(--_glow);
		}

		:host([size="tiny"]) {
			--_gap: 3px;
		}

		:host([size="tiny"]) span {
			inline-size: 2px;
			block-size: 2px;
		}

		:host([size="small"]) span {
			inline-size: 0.3em;
			block-size: 0.3em;
		}

		:host([size="large"]) span {
			inline-size: 0.75em;
			block-size: 0.75em;
		}

		@keyframes pulse {
			0%, 100% { opacity: 1; }
			50% { opacity: 0.3; }
		}

		@keyframes wave {
			0%, 100% { opacity: 1; transform: scale(1); }
			50% { opacity: 0.3; transform: scale(0.6); }
		}

		@keyframes heartbeat-ring {
			0% {
				transform: scale(1);
				opacity: 0.8;
			}
			100% {
				transform: scale(var(--_heartbeat-scale));
				opacity: 0;
			}
		}

		:host([animate="pulse"]) span {
			animation: pulse var(--_duration) ease-in-out infinite;
		}

		:host([animate="wave"]) span {
			animation: wave var(--_duration) ease-in-out infinite;
		}

		:host([animate="wave"]) span:nth-child(2) { animation-delay: var(--_wave-delay); }
		:host([animate="wave"]) span:nth-child(3) { animation-delay: calc(var(--_wave-delay) * 2); }
		:host([animate="wave"]) span:nth-child(4) { animation-delay: calc(var(--_wave-delay) * 3); }
		:host([animate="wave"]) span:nth-child(5) { animation-delay: calc(var(--_wave-delay) * 4); }

		:host([animate="heartbeat"]) span {
			position: relative;
		}

		:host([animate="heartbeat"]) span::after {
			content: '';
			position: absolute;
			inset: 0;
			border-radius: 50%;
			border: 1px solid var(--_color);
			animation: heartbeat-ring var(--_duration) ease-out infinite;
		}

		@media (prefers-reduced-motion: reduce) {
			:host([animate]) span,
			:host([animate]) span::after {
				animation: none;
			}
		}
	`;

	override render() {
		const clamped = Math.max(0, Math.trunc(this.count));
		const dots = Array.from(
			{ length: clamped },
			(_, _i) => html`<span></span>`,
		);
		return html`${dots}`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"cyber-dot": CyberDot;
	}
}
