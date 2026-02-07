export class HeaderLines {
  private container: HTMLElement;
  private svg: SVGSVGElement;
  private path: SVGPathElement;
  private ro: ResizeObserver;

  constructor(container: HTMLElement) {
    this.container = container;

    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("aria-hidden", "true");
    this.svg.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;";

    this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
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

    const r = (x: number, y: number): string =>
      `${x - rect.left},${y - rect.top}`;

    // Top-left → under middle → top-right
    const d = [
      `M${r(first.left, first.top)}`,
      `L${r(first.right, first.top)}`,
      `L${r(first.right, first.bottom)}`,
      `L${r(mid.left, mid.bottom)}`,
      `L${r(mid.left, mid.top)}`,
      `L${r(mid.right, mid.top)}`,
      `L${r(mid.right, mid.bottom)}`,
      `L${r(last.left, last.bottom)}`,
      `L${r(last.left, last.top)}`,
      `L${r(last.right, last.top)}`,
    ].join(" ");

    this.svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
    this.path.setAttribute("d", d);
  }

  destroy(): void {
    this.ro.disconnect();
    this.svg.remove();
  }
}
