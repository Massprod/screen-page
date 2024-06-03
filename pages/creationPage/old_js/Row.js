import WheelStack from './WheelStack.js';
import Identifier from './identifier.js';

export default class Row {
  constructor({
    rowColumns = 0,
    rowIdentifier = '',
    rowElementHeight = 75,
    rowElementWidth = 75,
    rowPresetStyle = '',
    rowBgColor = 'whitesmoke',
    wheelStackContextMenuHandler,
    wheelStackLeftClickHandler,
  } = {}) {
    this.rowColumns = rowColumns;
    this.rowIdentifier = rowIdentifier;
    this.rowPresetStyle = rowPresetStyle;
    this.rowElementHeight = rowElementHeight;
    this.rowElementWidth = rowElementWidth;
    this.rowBgColor = rowBgColor;
    this.wheelStacks = [];
    this.wheelStackContextMenuHandler = wheelStackContextMenuHandler;
    this.wheelStackLeftClickHandler = wheelStackLeftClickHandler;
    this.#init();
    this.#setDefRowStyle();
  }

  #init() {
    this.rowElement = document.createElement('div');
    if ('' !== this.rowPresetStyle) {
      this.rowElement.className = this.rowPresetStyle;
    } else {
      this.rowElement.className = this.#setDefRowStyle();
    }
  }

  #setDefRowStyle(styleName = 'rowCoordinate') {
    const style = document.createElement('style');
    style.textContent = `.rowCoordinate {
      height: max-content;
      width: max-content; 
      display: flex;
      overflow: hidden;
      background-color: ${this.rowBgColor};
    }`;
    document.head.appendChild(style);
    return styleName;
  }

  createFirstRow() {
    let newIdent = new Identifier({
      'identSymbol': '',
      'identHeight': `${this.rowElementHeight}`,
      'identWidth': `${this.rowElementWidth}`,
    });
    this.rowElement.appendChild(newIdent.element);
    for (let col = 1; col <= this.rowColumns; col += 1) {
      newIdent = new Identifier({
        'identSymbol': String(col),
        'identHeight': `${this.rowElementHeight}`,
        'identWidth': `${this.rowElementWidth}`,
        'identBgColor': this.rowBgColor,
      })
      this.rowElement.appendChild(newIdent.element);
    }
    return this.rowElement;
  }

  createRow() {
    const newIdent = new Identifier({
      'identSymbol': this.rowIdentifier,
      'identHeight': `${this.rowElementHeight}`,
      'identWidth': `${this.rowElementWidth}`,
      'identBgColor': this.rowBgColor,
    })
    this.rowElement.appendChild(newIdent.element);
    for (let col = 1; col <= this.rowColumns; col += 1) {
      let newWheelStack = new WheelStack({
        'stackWidth': `${this.rowElementWidth}`,
        'stackHeight': `${this.rowElementHeight}`,
        'placementRow': this.rowIdentifier,
        'placementColumn': col,
        'wheelStackBgColor': this.rowBgColor,
        'wheelStackContextMenuHandler': this.wheelStackContextMenuHandler,
        'wheelStackLeftClickHandler': this.wheelStackLeftClickHandler,
      })
      this.rowElement.appendChild(newWheelStack.element);
      this.wheelStacks.push(newWheelStack);
    }
    return this.wheelStacks;
  }
}