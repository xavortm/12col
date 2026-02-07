export class HeaderLines {
	private container: HTMLElement;
	private svg: SVGSVGElement;
	private path: SVGPathElement;
	private ro: ResizeObserver;

	constructor(container: HTMLElement) {
		this.container = container;

		this.svg = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"svg",
		);
		this.svg.setAttribute("aria-hidden", "true");
		this.svg.style.cssText =
			"position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;";

		this.path = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"path",
		);
		this.path.setAttribute("fill", "none");
		this.path.setAttribute("stroke", "var(--color-stroke, currentColor)");
		this.path.setAttribute("stroke-width", "1");
		this.svg.appendChild(this.path);

		this.container.style.position = "relative";
		this.container.appendChild(this.svg);

		this.ro = new ResizeObserver(() => this.draw());
		this.ro.observe(this.container);
		this.draw();
	}

	private draw(): void {
		const rect = this.container.getBoundingClientRect();
		const children = this.container.children;
		if (children.length < 3) return;

		const first = children[0].getBoundingClientRect();
		const mid = children[1].getBoundingClientRect();
		const last = children[2].getBoundingClientRect();

		const p = (x: number, y: number): [number, number] => [
			x - rect.left,
			y - rect.top,
		];

		const slant = 20;
		const points: [number, number][] = [
			p(first.left, first.top),
			p(first.right, first.top),
			p(first.right + slant, first.bottom),
			p(mid.left - slant, mid.bottom),
			p(mid.left, mid.top),
			p(mid.right, mid.top),
			p(mid.right + slant, mid.bottom),
			p(last.left - slant * 2, last.bottom),
			p(last.left - slant, last.top),
			p(last.right, last.top),
		];

		const d = this.roundedPath(points, 10);
		this.svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
		this.path.setAttribute("d", d);
	}

	private roundedPath(points: [number, number][], radius: number): string {
		if (points.length < 2) return "";

		const parts: string[] = [`M${points[0][0]},${points[0][1]}`];

		for (let i = 1; i < points.length; i++) {
			const prev = points[i - 1];
			const curr = points[i];
			const next = points[i + 1] as [number, number] | undefined;

			if (!next) {
				parts.push(`L${curr[0]},${curr[1]}`);
				break;
			}

			const dx1 = curr[0] - prev[0];
			const dy1 = curr[1] - prev[1];
			const len1 = Math.hypot(dx1, dy1);

			const dx2 = next[0] - curr[0];
			const dy2 = next[1] - curr[1];
			const len2 = Math.hypot(dx2, dy2);

			const r = Math.min(radius, len1 / 2, len2 / 2);

			const bx = curr[0] - (dx1 / len1) * r;
			const by = curr[1] - (dy1 / len1) * r;
			const ax = curr[0] + (dx2 / len2) * r;
			const ay = curr[1] + (dy2 / len2) * r;

			parts.push(`L${bx},${by}`);
			parts.push(`Q${curr[0]},${curr[1]} ${ax},${ay}`);
		}

		return parts.join(" ");
	}

	destroy(): void {
		this.ro.disconnect();
		this.svg.remove();
	}
}
