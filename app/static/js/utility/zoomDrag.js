class ZoomAndDrag {
  constructor({ viewport, grid, initialScale = 0.5, maxScale = 1.5, minScale = 0.15, zoomStep = 0.05 }) {
    this.viewport = viewport;
    this.grid = grid;
    this.scale = initialScale;
    this.maxScale = maxScale;
    this.minScale = minScale;
    this.zoomStep = zoomStep;
    this.dragging = false;
    this.lastMousePos = { x: 0, y: 0 };
    this.translation = { x: 0, y: 0 };
    this.initialTouchDistance = null;
    this.initialScale = null;

    this.init();
  }

  init() {
    this.updateTransform();

    this.viewport.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
    this.viewport.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.viewport.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    
    // Touch events for mobile devices
    this.viewport.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.viewport.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    this.viewport.addEventListener('touchend', this.onTouchEnd.bind(this));
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

    this.translation.x = offsetX - scaleRatio * (offsetX - this.translation.x);
    this.translation.y = offsetY - scaleRatio * (offsetY - this.translation.y);

    this.updateTransform(true); // Indicate that this is a zoom operation
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

    this.updateTransform(false); // Indicate that this is a drag operation
  }

  onMouseUp() {
    if (this.dragging) {
      this.dragging = false;
    }
  }

  // Touch event handlers for mobile
  onTouchStart(event) {
    if (event.touches.length === 1) {
      this.dragging = true;
      this.lastMousePos = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    } else if (event.touches.length === 2) {
      this.dragging = false;
      this.initialTouchDistance = this.getTouchDistance(event.touches);
      this.initialScale = this.scale;
    }
  }

  onTouchMove(event) {
    event.preventDefault();
    if (this.dragging && event.touches.length === 1) {
      const deltaX = event.touches[0].clientX - this.lastMousePos.x;
      const deltaY = event.touches[0].clientY - this.lastMousePos.y;

      this.translation.x += deltaX;
      this.translation.y += deltaY;

      this.lastMousePos = { x: event.touches[0].clientX, y: event.touches[0].clientY };

      this.updateTransform(false); // Indicate that this is a drag operation
    } else if (event.touches.length === 2) {
      const currentTouchDistance = this.getTouchDistance(event.touches);
      const scaleRatio = currentTouchDistance / this.initialTouchDistance;
      this.scale = Math.max(this.minScale, Math.min(this.maxScale, this.initialScale * scaleRatio));
      console.log("Pinch zoom triggered"); // Add console log here
      this.updateTransform(true); // Indicate that this is a zoom operation
    }
  }

  onTouchEnd(event) {
    if (this.dragging && event.touches.length === 0) {
      this.dragging = false;
    }
  }

  getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  updateTransform(isZoom = false) {
    const viewportRect = this.viewport.getBoundingClientRect();
    const scaledWidth = this.grid.offsetWidth * this.scale;
    const scaledHeight = this.grid.offsetHeight * this.scale;

    const minTranslateX = Math.min(0, viewportRect.width - scaledWidth);
    const minTranslateY = Math.min(0, viewportRect.height - scaledHeight);

    this.translation.x = Math.max(minTranslateX, Math.min(0, this.translation.x));
    this.translation.y = Math.max(minTranslateY, Math.min(0, this.translation.y));

    if (isZoom) {
      this.grid.style.transition = 'transform 0.3s ease'; // Smooth transition for zooming
    } else {
      this.grid.style.transition = 'none'; // No transition for dragging
    }

    this.grid.style.transform = `translate(${this.translation.x}px, ${this.translation.y}px) scale(${this.scale})`;
  }
}

export default ZoomAndDrag;
