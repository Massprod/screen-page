export default class CellHoverCoordinate {
    constructor(hoverClass) {
        this.hoverClass = hoverClass;
        this.#init();
    }

    #init() {
        this.element = document.createElement('div');
        this.element.className = "cell-hover-coordinate";
        document.body.appendChild(this.element);

        document.addEventListener('mouseover', (event) => {
            this.showCoordinate(event);
        });

        document.addEventListener('mouseout', (event) => {
            this.hideCoordinate(event);
        });

        document.addEventListener('mousemove', (event) => {
            this.updateCoordinate(event);
        });

        // Touch events for mobile
        document.addEventListener('touchstart', (event) => {
            this.showCoordinate(event);
        });

        document.addEventListener('touchmove', (event) => {
            this.hideCoordinate(event);
        });
    }

    hideCoordinate(event) {
        this.element.classList.remove('show');
        this.element.classList.add('hidden');
    }

    showCoordinate(event) {
        const target = event.targetTouches ? event.targetTouches[0].target : event.target;
        if (!target.classList.contains(this.hoverClass) && (target.parentElement &&  !target.parentElement.classList.contains(this.hoverClass))) {
            return;
        }
        this.element.classList.remove('hidden');
        this.element.classList.add('show');
        this.updateCoordinate(event);
    }

    updateCoordinate(event) {
        const target = event.targetTouches ? event.targetTouches[0].target : event.target;
        this.element.innerText = `${target.id}`;
        this.updateHoverDisplayPosition(event);
    }

    updateHoverDisplayPosition(event) {
        const touch = event.targetTouches ? event.targetTouches[0] : event;

        const { clientX: mouseX, clientY: mouseY } = touch;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const elementWidth = this.element.offsetWidth;
        const elementHeight = this.element.offsetHeight;

        let positionX = mouseX + 10; // Default position
        let positionY = mouseY + 10; // Default position

        // Adjust position if the hover display goes out of the viewport
        if (positionX + elementWidth > viewportWidth) {
            positionX = mouseX - elementWidth - 10;
        }
        if (positionY + elementHeight > viewportHeight) {
            positionY = mouseY - elementHeight - 10;
        }

        this.element.style.top = `${positionY}px`;
        this.element.style.left = `${positionX}px`;
    }
}
