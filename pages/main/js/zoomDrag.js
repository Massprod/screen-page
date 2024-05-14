export default class ZoomAndDrag {
    constructor(zoomableZone, gridContainer) {
        this.zoomableZone = zoomableZone;
        this.gridContainer = gridContainer;
        this.activeDrag = false;
        this.basicScale = 1;
        this.maxScale = 2;
        this.minScale = 0.1;
        this.posStart = {
            x: 0,
            y: 0,
        };
        this.posEnd ={
            x: 0,
            y: 0,
        };
        this.init();
    }
    
    init() {
        this.gridContainer.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.zoomableZone.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.gridContainer.addEventListener('wheel', this.onWheel.bind(this));
    }

    updatePosition() {
        this.gridContainer.style.transform = `translate(${this.posEnd.x}px, ${this.posEnd.y}px scale(${this.basicScale}))`;
    }

    onMouseUp(event) {
        this.activeDrag = false;
    }

    onMouseDown(event) {
        if (0 === event.button) {
            this.activeDrag = true;
            event.preventDefault();
            this.posStart.x = event.clientX;
            this.posStart.y = event.clientY;
        }
    }

    onMouseMove(event) {
        if (this.activeDrag) {
            let shiftX = event.clientX - this.posStart.x;
            let shiftY = event.clientY - this.posStart.y;
            this.posEnd.x += shiftX;
            this.posEnd.y += shiftY;
            this.updatePosition();
        }
    }

    onWheel(event) {
        if (event.deltaY < 0) {
            this.basicScale += 0.05;
        } else {
            this.basicScale -= 0.05;
        }
        this.basicScale = Math.min(this.maxScale, Math.max(this.minScale, this.basicScale));
        this.updatePosition();
    }
}