import WheelStackData from './WheelStackData.js';
import { CLASS_NAMES } from '../../constants.js';

/**
 * Class representing the visual representation of a wheel stack.
 */
export default class WheelStackElement {
  /**
   * Create a wheel stack element.
   * @param {Object} params - The parameters for the wheel stack element.
   * @param {string} params.stackId - The unique identifier for the wheel stack.
   * @param {number} params.maxSize - The maximum number of wheels the stack can hold.
   * @param {string} params.placementRow - The row placement of the wheel stack.
   * @param {number} params.placementColumn - The column placement of the wheel stack.
   * @param {HTMLElement} params.container - The container element to render the wheel stack element.
   */
  constructor({
    stackId = null,
    maxSize = 6,
    placementRow = null,
    placementColumn = null,
    wheels = [],
    container = null,
    identifier = null
  } = {}) {
    this.container = container;
    this.element = document.createElement('div');
    this.element.className = CLASS_NAMES.WHEEL_STACK;
    this.container.appendChild(this.element);
    if (identifier === null) {
      this.wheelStackData = new WheelStackData({ stackId, maxSize, placementRow, placementColumn, wheels});
      this.updateVisual();
    } else {
      this.wheelStackData = null;
      this.identifier = identifier;
      this.setIdentifier();
    }
  }

  /**
   * Update the visual representation of the wheel stack element.
   */
  updateVisual() {
    if (this.wheelStackData.wheels.length === 0) {
      return;
    }
    this.element.textContent = this.wheelStackData.wheels.length;
  }

  setIdentifier() {
    this.element.textContent = this.identifier;
    this.element.style.border = 'none';
  }

  /**
   * Attach an event to the wheel stack element.
   * @param {string} eventType - The type of the event (e.g., 'click', 'contextmenu').
   * @param {Function} handler - The function to handle the event.
   */
  attachEvent(eventType, handler) {
    this.element.addEventListener(eventType, handler);
  }

  hideElement() {
    this.element.style.visibility = 'hidden';
  }
  
  showElement() {
    this.element.style.visibility = 'visible';
  }

  isHidden() {
    return 'hidden' === this.element.style.visibility;
  }
}
