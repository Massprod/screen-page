class ZoomAndDrag {
  /**
   * Create a ZoomAndDrag instance.
   * @param {HTMLElement} viewport - The element that contains the zoomable area.
   * @param {HTMLElement} grid - The element that will be zoomed and dragged.
   * @param {number} [initialScale=0.3] - The initial scale value.
   * @param {number} [maxScale=1.5] - The maximum scale value.
   * @param {number} [minScale=0.2] - The minimum scale value.
   * @param {number} [zoomStep=0.05] - The step value for zooming.
   */
  constructor({ viewport, grid, initialScale = 0.5, maxScale = 1.5, minScale = 0.4, zoomStep = 0.05 }) {
    this.viewport = viewport;
    this.grid = grid;
    this.scale = initialScale;
    this.maxScale = maxScale;
    this.minScale = minScale;
    this.zoomStep = zoomStep;
    this.dragging = false;
    this.lastMousePos = { x: 0, y: 0 };
    this.translation = { x: 0, y: 0 };

    this.init();
  }

  init() {
    this.updateTransform();

    this.viewport.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
    this.viewport.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.viewport.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  onWheel(event) {
    event.preventDefault();

    const rect = this.grid.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    const prevScale = this.scale;
    if (event.deltaY < 0) {
      this.scale = Math.min(this.maxScale, this.scale + this.zoomStep);
    } else {
      this.scale = Math.max(this.minScale, this.scale - this.zoomStep);
    }

    const scaleRatio = this.scale / prevScale;

    // Adjust the translation to keep the zoom centered on the mouse pointer
    this.translation.x = offsetX - scaleRatio * (offsetX - this.translation.x);
    this.translation.y = offsetY - scaleRatio * (offsetY - this.translation.y);

    this.updateTransform();
  }

  onMouseDown(event) {
    event.preventDefault();
    this.dragging = true;
    this.lastMousePos = { x: event.clientX, y: event.clientY };
    clearTimeout(this.dragTimeout);

  }

  onMouseMove(event) {
    if (!this.dragging) return;

    const deltaX = event.clientX - this.lastMousePos.x;
    const deltaY = event.clientY - this.lastMousePos.y;

    this.translation.x += deltaX;
    this.translation.y += deltaY;

    this.lastMousePos = { x: event.clientX, y: event.clientY };

    this.updateTransform();
  }

  onMouseUp() {
    if (this.dragging) {
      this.dragging = false;
    }
  }

  updateTransform() {
    const viewportRect = this.viewport.getBoundingClientRect();
    const scaledWidth = this.grid.offsetWidth * this.scale;
    const scaledHeight = this.grid.offsetHeight * this.scale;

    // Ensure the grid stays within the bounds of the viewport
    const minTranslateX = Math.min(0, viewportRect.width - scaledWidth);
    const minTranslateY = Math.min(0, viewportRect.height - scaledHeight);

    this.translation.x = Math.max(minTranslateX, Math.min(0, this.translation.x));
    this.translation.y = Math.max(minTranslateY, Math.min(0, this.translation.y));

    this.grid.style.transform = `translate(${this.translation.x}px, ${this.translation.y}px) scale(${this.scale})`;
  }
}

export default ZoomAndDrag;
