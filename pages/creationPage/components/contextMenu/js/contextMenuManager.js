import { TEMPO_CONSTS } from "../../constants.js";
import WheelElement from "../../wheel/js/wheelElement.js";
import { CLASS_NAMES } from "../../constants.js";
import { BACK_GRID_NAMES } from "../../constants.js";
import { ORDER_MOVE_TYPES } from "../../constants.js";
import { ORDER_BUTTONS_TEXT } from "../../constants.js";


export default class ContextMenuManager{
    constructor(
        elementClass = TEMPO_CONSTS.CONTEXT_MENU_CLASS,
        maxWheels = 6,
    ) {
        this.element = document.createElement('div');
        this.element.className = elementClass;

        // Tempo orderManager
        this.orderManager = null;
        this.button = document.createElement('div');
        this.button.className = 'context-menu-move-wheelstack-button';
        this.button.innerText = ORDER_BUTTONS_TEXT.WHOLE_STACK_INACTIVE;
        this.element.appendChild(this.button);
        this.button.addEventListener('click', (event) => {
            if (null !== this.orderManager) {
                if (!this.orderManager.creatingOrder) {
                    this.hideContextMenu();
                    this.orderManager.toggleCreation();
                    this.orderManager.setSource(this.assignedWheelStackElement);
                } else {
                    this.hideContextMenu();
                    this.orderManager.cancelCreation();
                    this.orderManager.setDestination(this.assignedWheelStackElement);
                    this.orderManager.createOrder(ORDER_MOVE_TYPES.WHOLE_STACK);
                }
            }
        })
        // ----

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
        const newData = this.assignedWheelStackElement.wheelStackData;
        if (null !== newData) {
            for (let wheelId in newData.wheels) {
                const chosenWheel = this.storedWheels[wheelId];
                chosenWheel.setWheel(newData.wheels[wheelId]);
            }
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

    showContextMenu(event, wheelStackElement, orderManager = null) {
        // Tempo orderManager
        if (null !== orderManager) {
            this.orderManager = orderManager;    
            this.orderManager.assignWholeOrderButton(this.button);
        } 
        // ----
        this.clearWheelsData();
        event.preventDefault();
        this.element.style.display = 'block';
        this.updateContextMenuPosition(event);
        this.assignedWheelStackElement = wheelStackElement;
        const wheelStackData = this.assignedWheelStackElement.wheelStackData;
        if (null !== wheelStackData) {
            for (let wheel in wheelStackData.wheels) {
                const chosenWheel = this.storedWheels[wheel];
                chosenWheel.setWheel(wheelStackData.wheels[wheel]);
            }
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
