/**
 * Class representing a zoom and drag functionality for a container.
 */
export default class ZoomAndDrag {
  /**
   * Create a ZoomAndDrag instance.
   * @param {HTMLElement} zoomableZone - The element that contains the zoomable area.
   * @param {HTMLElement} gridContainer - The element that will be zoomed and dragged.
   * @param {number} [basicScale=1] - The initial scale value.
   * @param {number} [maxScale=2] - The maximum scale value.
   * @param {number} [minScale=0.1] - The minimum scale value.
   * @param {Object} [posStart={ x: 0, y: 0 }] - The initial start position.
   * @param {number} [posStart.x=0] - The initial x-coordinate.
   * @param {number} [posStart.y=0] - The initial y-coordinate.
   * @param {Object} [posEnd={ x: 0, y: 0 }] - The initial end position.
   * @param {number} [posEnd.x=0] - The initial x-coordinate.
   * @param {number} [posEnd.y=0] - The initial y-coordinate.
   * @param {number} [zoomStep=0.05] - The step value for zooming.
   */
  constructor(
    zoomableZone,
    gridContainer,
    basicScale = 1,
    maxScale = 2,
    minScale = 0.1,
    posStart = { x: 0, y: 0 },
    posEnd = { x: 0, y: 0 },
    zoomStep = 0.05
  ) {
    this.zoomableZone = zoomableZone;
    this.gridContainer = gridContainer;
    this.activeDrag = false;
    this.basicScale = basicScale;
    this.maxScale = maxScale;
    this.minScale = minScale;
    this.posStart = posStart;
    this.posEnd = posEnd;
    this.zoomStep = zoomStep;
    this.#init();
  }

  /**
   * Initialize event listeners for zoom and drag.
   */
  #init() {
    this.zoomableZone.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.gridContainer.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.gridContainer.addEventListener('wheel', this.onWheel.bind(this));
    this.gridContainer.style.transform = `translate(${this.posEnd.x}px, ${this.posEnd.y}px) scale(${this.basicScale})`;
  }

  /**
   * Update the position of the grid container based on the current scale and position.
   */
  updatePosition() {
    this.gridContainer.style.transform = `translate(${this.posEnd.x}px, ${this.posEnd.y}px) scale(${this.basicScale})`;
  }

  /**
   * Handle the mouse up event to stop dragging.
   * @param {MouseEvent} event - The mouse up event.
   */
  onMouseUp(event) {
    this.activeDrag = false;
  }

  /**
   * Handle the mouse down event to start dragging.
   * @param {MouseEvent} event - The mouse down event.
   */
  onMouseDown(event) {
    if (event.button === 0) {
      this.activeDrag = true;
      event.preventDefault();
      this.posStart.x = event.clientX;
      this.posStart.y = event.clientY;
    }
  }

  /**
   * Handle the mouse move event to drag the grid container.
   * @param {MouseEvent} event - The mouse move event.
   */
  onMouseMove(event) {
    if (this.activeDrag) {
      let shiftX = event.clientX - this.posStart.x;
      let shiftY = event.clientY - this.posStart.y;
      this.posEnd.x += shiftX;
      this.posEnd.y += shiftY;
      this.updatePosition();
      this.posStart.x = event.clientX;
      this.posStart.y = event.clientY;
    }
  }

  /**
   * Handle the wheel event to zoom in and out of the grid container.
   * @param {WheelEvent} event - The wheel event.
   */
  onWheel(event) {
    if (event.deltaY < 0) {
      this.basicScale += this.zoomStep;
    } else {
      this.basicScale -= this.zoomStep;
    }
    this.basicScale = Math.min(this.maxScale, Math.max(this.minScale, this.basicScale));
    this.updatePosition();
  }
}
