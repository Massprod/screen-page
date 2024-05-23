import ColorManager from '../../utility/colorManager.js';
import FlashMessage from '../../utility/flashMessage.js';
import Row from './Row.js';

export default class GridManager {
  constructor({
    baseWheelStackHeight = 75,
    baseWheelStackWidth = 75,
    gridRowsData = {},
    wheelStackBgColor = '#00ffdd',
    wheelStackBorder = '0.5px solid #1c0080',
    wheelStackClassStyle = 'wheelStack',
    wheelStackContextMenuHandler,
    wheelStackLeftClickHandler,
    orderManager,
  } = {}) {
    this.choosingStackPlacement = false;
    this.stackToMove = null;
    this.orderManager = orderManager;
    this.wheelStackLeftClickHandler = wheelStackLeftClickHandler;

    this.gridRowsData = gridRowsData;
    this.zoomAndDragInstance = false;
    this.wheelStackContextMenuHandler = wheelStackContextMenuHandler;
    // Size limits
    this.baseStackHeightLimit = 500;
    this.baseStackWidthLimit = 500;
    // Stacks sizing
    this.baseStackHeight = this.validateSize(baseWheelStackHeight);
    this.baseStackWidth = this.validateSize(baseWheelStackWidth, false);
    // Base styling
    this.baseStackBorder = wheelStackBorder;
    this.baseStackStyle = wheelStackClassStyle;
    this.bastStackBgColor = wheelStackBgColor;
    // Grid data
    this.gridPlacements = {};  // {rowIdentifier: {columnId: wheelStack}}
    this.allWheels = {};  // {wheelId: wheelData}
    this.wheelBatches = {};  // {batchId: [...wheelId...]}
    // Grid coloring
    this.colorManager = new ColorManager(this.defaultTileColor, 75);
    this.currentColor = '';
    this.#init();
  }

  /**
   * Validate that a value is a positive number.
   * @param {number} value - The value to validate.
   * @returns {number} The validated number.
   * @throws {Error} If the value is not a valid number.
   */
  validateNumber(value) {
    if (typeof value !== 'number' || value <= 0) {
      throw new Error('Invalid value, positive `number` expected');
    }
    return value;
  }

  validateSize(value, height = true) {
    this.validateNumber(value);
    if (height) {
      if (value > this.baseStackHeightLimit) {
        throw new Error(`Invalid value, 'height' can't be higher than limit: ${this.baseStackHeightLimit}`);
      }
    else if (!height) {
      if (value > this.baseStackWidthLimit) {
        throw new Error(`Invalid value, 'width' can't be higher tnan limit: ${this.baseStackWidthLimit}`);
      }
    }
    }
    return value;
  }


  #init() {
    this.#addStyles();
    this.gridContainer = document.createElement('div');
    this.gridContainer.className = 'grid-container';
  }

  /**
   * Add styles to the document head for grid and tile elements.
   * @private
   */
  #addStyles() {
    const style = document.createElement('style');
    style.textContent = this.getGridStyle();
    document.head.appendChild(style);
  }

  /**
   * Get the CSS styles for the grid and tile elements.
   * @returns {string} The CSS styles.
   */
  getGridStyle() {
    return `
      .grid-container {
        position: absolute;
        transform-origin: top left;
        background-color: whitesmoke;
        will-change: transform;
      }
      .row {
        height: max-content;
        width: max-content;
        display: flex;
      }
      .wheelStack {
        width: ${this.baseTileWidth}px;
        height: ${this.baseTileHeight}px;
        border: ${this.defaultBorder};
        overflow: hidden;
      }
    `;
  }

  /**
   * Fill the grid with tiles.
   * @returns {HTMLElement} The grid container element with tiles.
   */
  createBasicGrid() {
    this.gridContainer.replaceChildren([]);
    // First row
    const firstRow = new Row({
      'rowColumns': this.gridRowsData['first'],
      'rowElementHeight': this.baseStackHeight,
      'rowElementWidth': this.baseStackWidth,
    });
    firstRow.createFirstRow();
    this.gridContainer.appendChild(firstRow.rowElement);
    for (let index in this.gridRowsData['else']) {
      const rowIdent = this.gridRowsData['else'][index][0];
      const rowColumns = this.gridRowsData['else'][index][1];
      const newRow = new Row({
        'rowColumns': rowColumns,
        'rowIdentifier': rowIdent,
        'rowElementHeight': this.baseStackHeight,
        'rowElementWidth': this.baseStackWidth,
        'wheelStackContextMenuHandler': this.wheelStackContextMenuHandler,
        'wheelStackLeftClickHandler': this.wheelStackLeftClickHandler,
      });
      this.gridContainer.appendChild(newRow.rowElement);
      const createdWheelStacks = newRow.createRow();
      for (let index in createdWheelStacks) {
        const wheelStack = createdWheelStacks[index];
        const wheelStackRow = wheelStack.wheelStackRow;
        const wheelStackCol = wheelStack.wheelStackColumn;
        if (!(wheelStackRow in this.gridPlacements)) {
          this.gridPlacements[wheelStackRow] = {};
        }
        this.gridPlacements[wheelStackRow][wheelStackCol] = wheelStack;
      }
      }
    return this.gridContainer;
  }
  
  setZoomAndDragInstance(zoomAndDragInstance) {
    this.zoomAndDragInstance = zoomAndDragInstance;
  }

  createMoveWheelStackOrder(wheelStack) {
    console.log(wheelStack);
    console.log(this.stackToMove);
    console.log(this.choosingStackPlacement);
    if (this.orderManager.createMoveWheelStackOrder(this.stackToMove, wheelStack)) {
      this.stackToMove = null;
      this.choosingStackPlacement = false;
      this.cursorInitialMode();
      return;
    }
    FlashMessage('No space');
  }


  cursorPlacementMode(cursor = 'cell') {
    document.querySelector('.bottom-half').style.cursor = cursor;
  }

  cursorInitialMode(cursor = 'initial') {
    document.querySelector('.bottom-half').style.cursor = cursor;
  }
}
