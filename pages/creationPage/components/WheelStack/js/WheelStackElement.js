import WheelStackData from './WheelStackData.js';
import { CLASS_NAMES } from '../../constants.js';
import { BACK_GRID_NAMES } from '../../constants.js';
import HoverDisplayManager from '../../hoverWheelstack/js/hoverDisplayManager.js';
import ContextMenuManager from '../../../components/contextMenu/js/contextMenuManager.js';
import { TEMPO_CONSTS } from '../../constants.js';
import OrderManager from '../../orderManager/js/orderManager.js';



// TEMPO HoverDisplay
const hoverDisplayManager = new HoverDisplayManager(
  CLASS_NAMES.WHEEL_STACK_ELEMENT.WHEEL_STACK,
  CLASS_NAMES.TOOLTIP,
);
// ----

// Tempo click ContextMenu
const contextMenuManager = new ContextMenuManager(
  TEMPO_CONSTS.CONTEXT_MENU_CLASS
)
// ----

// TEMPO OrderManager
const orderManager = new OrderManager();
// ----


export default class WheelStackElement {
  constructor(
    container,
    rowPlacement = null,
    colPlacement = null,
  )
  {
    // Only represents element on page, all data in different class.
    // It can be one of 3 options for now:
    //   - used to show rowIdentifier as visual part of the row, to identify it.
    //   - used to show wheelStackElement and use it as gate for all data attached to this element.
    //   - empty placeholder, we can have empty cells on the row, they should be the same size and style, only `hidden`.
    this.whiteSpace = false;  // to check if it's empty cell
    this.rowIdentifier = '';  // to show as rowIdentifier for row disting.
    this.container = container;
    this.element = document.createElement('div');
    this.element.className = CLASS_NAMES.WHEEL_STACK_ELEMENT.WHEEL_STACK;
    if (this.container.parentNode.className === CLASS_NAMES.BASE_PLATFORM) {
      this.element.classList.add(CLASS_NAMES.WHEEL_STACK_ELEMENT.WHEEL_STACK_BASE_PLATFORM);
    }
    this.container.appendChild(this.element);
    this.wheelStackData = null;
    this.rowPlacement = rowPlacement;
    this.colPlacement = colPlacement;

    
    // Tempo click
    document.addEventListener('mousedown', (event) => {
      this.hideContextMenu(event);
    });

    this.element.addEventListener('click', (event) => {
      this.showContextMenu(event);
      // Tempo orderManager
      // ----
    })
    // ----
    // Tempo hover
    this.element.addEventListener('mouseover', (event) => {
      this.showHoverDetails(event);
    })
    this.element.addEventListener('mouseout', (event) => {
      this.hideHoverDetails(event);
    })
    this.element.addEventListener('mousemove', (event) => {
      this.updateHoverDisplay(event);
    })
    // ----
  }

  // Tempo hover
  showHoverDetails(event) {
    if (!this.whiteSpace && !this.rowIdentifier) {
      const hoverContent = `R-${this.rowPlacement}<br>C-${this.colPlacement}`;
      hoverDisplayManager.element.innerHTML = hoverContent;
      hoverDisplayManager.element.style.display = 'block';
      hoverDisplayManager.showHoverDisplay(event);
      hoverDisplayManager.updateHoverDisplayPosition(event);
    }
  }

  hideHoverDetails(event) {
    hoverDisplayManager.hideHoverDisplay(event);
  }

  updateHoverDisplay(event) {
   hoverDisplayManager.updateHoverDisplayPosition(event); 
  }
  // ----

  // Tempo Click
  showContextMenu(event) {
    if (this.wheelStackData === null && !orderManager.creatingOrder) {
      return;
    }
    if (!this.whiteSpace && !this.rowIdentifier) {
      this.contextMenuOpened = true;
      contextMenuManager.showContextMenu(
        event,
        this,
        orderManager,
      );
      this.element.classList.add('active');
    }
  }

  hideContextMenu(event) {
    this.element.classList.remove('active');
    if ('none' !== contextMenuManager.element.style.display && !(event.target.className in TEMPO_CONSTS.CONTEXT_MENU_ALLOWED_STYLES)) {
      contextMenuManager.hideContextMenu();
    }
  }
  // ----

  // Main of element
  resetElement() {
    this.whiteSpace = false,
    this.rowIdentifier = '';
    this.element.textContent = this.rowIdentifier;
    this.element.className = CLASS_NAMES.WHEEL_STACK_ELEMENT.WHEEL_STACK;
    if (this.container.parentNode.className === CLASS_NAMES.BASE_PLATFORM) {
      this.element.classList.add(CLASS_NAMES.WHEEL_STACK_ELEMENT.WHEEL_STACK_BASE_PLATFORM);
    }
    this.wheelStackData = null;
  }

  updateVisual() {
    if (null === this.wheelStackData) {
      return false;
    }
    // Tempo orderManager
    // After creating orderStorageManager
    // We will update every row|col placement of wheelStackElement in grid and basePlatform
    //  to some unique color. Also might be good to store this color, so it will be persistent through pages == store in DB for order.
    if (this.wheelStackData.blocked) {
      this.element.className = `${CLASS_NAMES.WHEEL_STACK_ELEMENT.WHEEL_STACK} ${CLASS_NAMES.WHEEL_STACK_ELEMENT.WHEEL_STACK_ORDER_BLOCK}`;
    }
    // ----
    this.element.textContent = this.wheelStackData.wheels.length;
    return true;
  }

  setAsIdentifier(identifier) {
    this.resetElement();
    this.rowIdentifier = identifier;
    this.element.textContent =  this.rowIdentifier;
    this.element.className = `${CLASS_NAMES.WHEEL_STACK_ELEMENT.WHEEL_STACK_IDENTIFIER}`;
  }

  setAsWhiteSpace() {
    this.resetElement();
    this.whiteSpace = true;
    this.element.className = `${CLASS_NAMES.WHEEL_STACK_ELEMENT.WHEEL_STACK_WHITESPACE}`;
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
  // ---
}
