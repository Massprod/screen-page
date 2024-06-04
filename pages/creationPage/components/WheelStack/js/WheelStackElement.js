import WheelStackData from './WheelStackData.js';
import { CLASS_NAMES } from '../../constants.js';


export default class WheelStackElement {
  constructor(container)
  {
    // Only represenets element on page, all data in different class.
    // It can be one of 3 options for now:
    //   - used to show rowIdentifier as visual part of the row, to identify it.
    //   - used to show wheelStackElement and use it as gate for all data attached to this element.
    //   - empty placeholder, we can have empty cells on the row, they should be the same size and style, only `hidden`.
    this.whiteSpace = false;  // to check if it's empty cell
    this.rowIdentifier = '';  // to show as rowIdentifier for row disting.
    this.container = container;
    this.element = document.createElement('div');
    this.element.className = CLASS_NAMES.WHEEL_STACK_ELEMENT.WHEEL_STACK;
    this.container.appendChild(this.element);
    this.wheelStackData = null;
    this.element.addEventListener('click', () => {
      console.log('123');
      console.log(this.wheelStackData);
    })
  }
  
  resetElement() {
    this.whiteSpace = false,
    this.rowIdentifier = '';
    this.element.textContent = this.rowIdentifier;
    this.element.className = CLASS_NAMES.WHEEL_STACK_ELEMENT.WHEEL_STACK;
    this.wheelStackData = null;
  }

  updateVisual() {
    if (null === this.wheelStackData) {
      return false;
    }
    this.element.textContent = this.wheelStackData.wheels.length;
    return true;
  }

  setAsIdentifier(identifier) {
    this.resetElement();
    this.rowIdentifier = identifier;
    this.element.textContent =  this.rowIdentifier;
    this.element.style = CLASS_NAMES.WHEEL_STACK_ELEMENT.WHEEL_STACK + CLASS_NAMES.WHEEL_STACK_ELEMENT.WHEEL_STACK_IDENTIFIER;
  }

  setAsWhiteSpace() {
    this.resetElement();
    this.whiteSpace = true;
    this.element.style = CLASS_NAMES.WHEEL_STACK_ELEMENT.WHEEL_STACK + CLASS_NAMES.WHEEL_STACK_ELEMENT.WHEEL_STACK_WHITESPACE;
  }

  setAsWheelStack(wheelStackData) {
    this.wheelStackData = new WheelStackData(
      wheelStackData['_id'],
      wheelStackData['originalPisId'],
      wheelStackData['batchNumber'],
      wheelStackData['maxSize'],
      wheelStackData['blocked'],
      wheelStackData['placement'],
      wheelStackData['colPlacement'],
      wheelStackData['rowPlacement'],
      wheelStackData['wheels']
    )
    this.updateVisual();
  }
  
  // Because we rebuilded everything with Async.
  // We can't get hold of the element before it's created.
  // And I have no idea how we can get it from allRows and columns like planned.
  // But I can assign it with simple eventListener and add context-menus like that.
  // We will get all the data we need, and all operations are done on Back anyway0999
  attachEvent(eventType, handler) {
    this.element.addEventListener(eventType, handler);
  }

}
