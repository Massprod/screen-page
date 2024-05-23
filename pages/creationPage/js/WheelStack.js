import Wheel from './Wheel.js';

export default class WheelStack {
  constructor({
    stackWidth = 75,
    stackHeight = 75,
    placementRow = '',
    placementColumn = '',
    wheelStackStyle = {},
    wheelStackBgColor = '#f5f5f5',
    maxStackSize = 6,
    stackData = {},
    wheelStackContextMenuHandler,
    wheelStackLeftClickHandler,
  } = {}) {
    // Placement data
    this.wheelStackRow = placementRow;
    this.wheelStackColumn = placementColumn;
    this.wheelStackContextMenuHandler = wheelStackContextMenuHandler;
    this.wheelStackLeftClickHandler = wheelStackLeftClickHandler;
    // Basic stats
    this.stylesData = wheelStackStyle;
    this.width = stackWidth;
    this.height = stackHeight;
    this.bgColor = wheelStackBgColor;
    this.stackData = {};
    this.maxStackSize = maxStackSize;
    this.#init();
    this.createEmptyStack();
    this.takenPositions = 0;
    this.fillTheStack(stackData);
  }

  #init() {
    this.element = document.createElement('div');
    this.applyStyles(this.stylesData);
    this.element.addEventListener('contextmenu', (event) => {this.wheelStackContextMenuHandler(this, event)});
    this.element.addEventListener('click', (event) => {this.wheelStackLeftClickHandler(this, event)});
    this.element.appendChild(this.#numberIndicator());
    this.updateIndicator();
  }

  #numberIndicator() {
    this.numberSpan = document.createElement('span');
    this.numberSpan.style.position = 'absolute';
    this.numberSpan.style.top = '50%';
    this.numberSpan.style.left = '50%';
    this.numberSpan.style.transform = 'translate(-50%, -50%)';
    this.numberSpan.style.color = '#000';
    this.numberSpan.style.fontWeight = 'bold';
    this.numberSpan.style.fontSize = '35px';
    return this.numberSpan;
  }

  createEmptyStack() {
    for (let index = 0; index < this.maxStackSize; index += 1) {
      this.stackData[index] = new Wheel({
        'wheelStackColumn': this.wheelStackColumn,
        'wheelStackRow': this.wheelStackRow,
        'wheelStackPosition': index,
      });
    }
  }

  fillTheStack(stackData) {
    const stackKeys = Object.keys(stackData);
    for (const key in stackData) {
      if (key >= this.maxStackSize) {
        throw(new Error(`Incorrect input. Provided 'stackData' can't have position higher than 'stackSize' == ${this.maxStackSize}`));
      }
      this.stackData[key].wheelId = stackData[key]['wheelId'];
      this.stackData[key].wheelSize = stackData[key]['wheelSize'];
      this.stackData[key].wheelBatch = stackData[key]['wheelBatch'];
      this.stackData[key].wheelStackRow = this.wheelStackRow;
      this.stackData[key].wheelStackColumn = this.wheelStackColumn;
      this.stackData[key].wheelStackPosition = key;
    }
    this.updateIndicator();
  }

  checkPositions() {
    let currentlyTaken = 0
    for (const key in this.stackData) {
      if (null !== this.stackData[key].wheelId) {
        currentlyTaken += 1;
      }
    }
    return currentlyTaken;
  }

  /**
   * Apply styles to the wheelStack element.
   */
  applyStyles(styles) {
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.element.style.backgroundColor = this.bgColor;
    this.element.style.border = '5px solid black';
    this.element.style.borderRadius = '50%';
    this.element.style.position = 'relative';
    this.element.style.margin = '5px';
    this.element.style.display = 'flex';
    this.element.style.alignItems = 'center';
    this.element.style.justifyContent = 'center';
    // Override default if provided.
    for (const [key, value] of Object.entries(styles)) {
      this.element.style[key] = value;
    }
  }

  /**
   * Set the background color of the wheelStack.
   * @param {string} color - The new background color.
   */
  setBgColor(color) {
    this.element.style.backgroundColor = `${color}`;
  }

  /**
   * Get the current background color of the wheelStack.
   * @return {string} The background color of the wheelStack.
   */
  getBgColor() {
    return window.getComputedStyle(this.element).backgroundColor;
  }

  updateIndicator() {
    this.takenPositions = this.checkPositions();
    if (0 !== this.takenPositions) {
      this.numberSpan.textContent = this.takenPositions;
    }
  }

  setIndicatorColor(color) {
    this.numberSpan.style.color = `${color}`;
  }
}
