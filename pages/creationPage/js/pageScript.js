import ZoomAndDrag from './zoomDrag.js';
import GridManager from './gridManager.js';
import FlashMessage from '../../utility/flashMessage.js';

document.addEventListener('DOMContentLoaded', () => {
  const viewport = document.getElementById('viewport');
  const createGridButton = document.getElementById('testBut');
  const heightBox = document.getElementById('heightBox');
  const widthBox = document.getElementById('widthBox');
  const contextMenu = document.getElementById('contextMenu');
  const wheelDetailsMenu = document.getElementById('wheelDetailsMenu'); // Assuming this is also defined in your HTML

  const rowsData = {
    'first': 58,
    'else': [
      ['A', 58],
      ['B', 58],
      ['C', 58],
      ['D', 58],
      ['E', 58],
      ['F', 58],
      ['G', 27],
      ['H', 27],
      ['I', 27]
    ]
  };

  const gridManager = new GridManager({
    'baseTileHeight': 75,
    'baseTileWidth': 75,
    'basicGridRows': 6,
    'basicGridColumns': 31,
    'gridRowsData': rowsData,
    'wheelStackElementCLickHandler': (wheelStack, event) => {
      showContextMenu(event, wheelStack);
    }
  });

  // Test context-menu
  const showContextMenu = (event, wheelStack) => {
    event.preventDefault();
    populateContextMenu(wheelStack);
    const { clientX: mouseX, clientY: mouseY } = event;
    contextMenu.style.top = `${mouseY}px`;
    contextMenu.style.left = `${mouseX}px`;
    contextMenu.style.display = `block`;
    adjustMenuPosition(contextMenu, mouseX, mouseY);
  };

  const adjustMenuPosition = (menu, mouseX, mouseY) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = menu.offsetWidth;
    const menuHeight = menu.offsetHeight;

    let positionX = mouseX;
    let positionY = mouseY;

    if (mouseX + menuWidth > viewportWidth) {
      positionX = viewportWidth - menuWidth;
    }
    if (mouseY + menuHeight > viewportHeight) {
      positionY = viewportHeight - menuHeight;
    }

    menu.style.top = `${positionY}px`;
    menu.style.left = `${positionX}px`;
  };

  const populateContextMenu = (wheelStack) => {
    contextMenu.innerHTML = ''; // Clear existing menu items

    // Add a button to add a new wheel if the stack is not full
    if (wheelStack.takenPositions < wheelStack.stackSize) {
      const addButton = document.createElement('button');
      addButton.textContent = 'Add Wheel';
      addButton.className = 'context-menu-add-button';
      addButton.onclick = () => {
        addWheelToStack(wheelStack);
      };
      contextMenu.appendChild(addButton);
    }

    // Add buttons for existing wheels
    Object.keys(wheelStack.stackData).forEach((position) => {
      const wheel = wheelStack.stackData[position];
      const wheelButton = document.createElement('button');
      wheelButton.textContent = `ID: ${wheel.wheelId || 'Empty'}`;
      wheelButton.className = 'context-menu-option';
      wheelButton.addEventListener('click', (event) => {
        showWheelDetails(event, wheel);
      });
      contextMenu.appendChild(wheelButton);
    });
  };

  const addWheelToStack = (wheelStack) => {
    // Implement the logic to add a new wheel to the stack
    console.log('Adding new wheel to', wheelStack);
    // Hide the context menu
    contextMenu.style.display = 'none';
  };

  const showWheelDetails = (event, wheel) => {
    event.preventDefault();
    wheelDetailsMenu.innerHTML = ''; // Clear existing menu items

    const details = document.createElement('div');
    details.innerHTML = `
      <div>ID: ${wheel.wheelId}</div>
      <div>Size: ${wheel.wheelSize}</div>
      <div>Batch: ${wheel.wheelBatch}</div>
      <button class="context-menu-option" id="extraActionButton">Extra Action</button>
    `;
    wheelDetailsMenu.appendChild(details);

    adjustMenuPosition(wheelDetailsMenu, event.clientX, event.clientY);
    wheelDetailsMenu.style.display = 'block';

    // Add event listener for the extra action button
    document.getElementById('extraActionButton').addEventListener('click', () => {
      extraAction(wheel);
    });

    // Add event listeners to close the details menu when clicking outside
    document.addEventListener('click', (event) => {
      if (!wheelDetailsMenu.contains(event.target) && !contextMenu.contains(event.target)) {
        hideWheelDetails();
      }
    }, { once: true });
  };

  const extraAction = (wheel) => {
    console.log('Extra action for', wheel);
    // Implement the extra action logic here
  };

  const hideWheelDetails = () => {
    wheelDetailsMenu.style.display = 'none';
  };

  const hideContextMenu = () => {
    contextMenu.style.display = 'none';
    hideWheelDetails();
  };

  document.addEventListener('click', (event) => {
    if (!contextMenu.contains(event.target) && !wheelDetailsMenu.contains(event.target)) {
      hideContextMenu();
    }
  });

  const message = new FlashMessage();

  const assignZoom = (gridElement) => {
    const zoomer = new ZoomAndDrag({
      'zoomableZone': viewport,
      'gridContainer': gridElement,
      'maxScale': 6,
    });
    gridManager.setZoomAndDragInstance(zoomer);
  };

  createGridButton.addEventListener('click', () => {
    const gridElement = gridManager.createBasicGrid();
    viewport.appendChild(gridElement);
    assignZoom(gridElement);
  });

});
