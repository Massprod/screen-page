import { TEMPO_CONSTS } from "../../constants.js";
import WheelElement from "../../wheel/js/wheelElement.js";


export default class ContextMenuManager{
    constructor(
        elementClass = TEMPO_CONSTS.CONTEXT_MENU_CLASS,
        maxWheels = 6,
    ) {
        this.element = document.createElement('div');
        this.element.className = elementClass;
        document.body.appendChild(this.element);
        this.element.style.display = 'block';
        this.maxWheels = maxWheels;
        this.storedWheels = {}
        this.#wheelOptions();
        this.intervalId = null;
        this.assignedWheelStackElement = null;
    }
    
    // tempo

    #updateWheelstackData() {
        this.clearWheelsData();
        const newWheels = this.assignedWheelStackElement.wheelStackData.wheels;
        for (let wheelId in newWheels) {
            const chosenWheel = this.storedWheels[wheelId];
            chosenWheel.setWheel(newWheels[wheelId]);
        }
    }

    startUpdating() {
        if (this.intervalId !== null) {
            return;
        }
        this.intervalId = setInterval(() => {
            this.#updateWheelstackData();
        }, 500)
    }

    stopUpdating() {
        if (this.intervalId === null) {
            return;
        }
        clearInterval(this.intervalId);
        this.intervalId = null;
    }

    // ---



    #wheelOptions() {
        for (let wheel = this.maxWheels - 1; wheel >= 0; wheel -= 1) {            
            const option = new WheelElement(TEMPO_CONSTS.CONTEXT_MENU_OPTION);
            this.element.appendChild(option.element);
            this.storedWheels[wheel] = option;
        }
    }

    // clear data
    clearWheelsData() {
        for (let wheel of Object.values(this.storedWheels)) {
            wheel.clearWheel();
        }
    }

    showContextMenu(event, wheelStackElement) {
        this.clearWheelsData();
        event.preventDefault();
        this.element.style.display = 'block';
        this.updateContextMenuPosition(event);
        this.assignedWheelStackElement = wheelStackElement;
        const wheelStackData = this.assignedWheelStackElement.wheelStackData;
        for (let wheel in wheelStackData.wheels) {
            const chosenWheel = this.storedWheels[wheel];
            chosenWheel.setWheel(wheelStackData.wheels[wheel]);
        }
        this.startUpdating();
    }

    hideContextMenu() {
        this.stopUpdating();
        this.element.style.display = 'none';
    }

    updateContextMenuPosition(event) {
        if (this.element.style.display === 'block') {
          const { clientX: mouseX, clientY: mouseY } = event;
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const elementWidth = this.element.offsetWidth;
          const elementHeight = this.element.offsetHeight;
    
          let positionX = mouseX + 10; // Default position
          let positionY = mouseY + 10; // Default position
    
          // Adjust position if the context menu goes out of the viewport
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
}
