import ZoomAndDrag from './zoomDrag.js';
import GridManager from './gridManager.js';
import FlashMessage from '../../utility/flashMessage.js';
import OrderManager from './OrderManager.js';
import WheelStack from './WheelStack.js';
import ContextMenuManager from './contextMenuManager.js';

document.addEventListener('DOMContentLoaded', () => {
  const viewport = document.getElementById('viewport');
  const contextMenu = document.getElementById('contextMenu');
  const wheelDetailsMenu = document.getElementById('wheelDetailsMenu'); // Assuming this is also defined in your HTML
  const message = new FlashMessage();

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
      contextMenuManager.showContextMenu(event, wheelStack)
    }
  });

  const createGrid = () => {
    const gridElement = gridManager.createBasicGrid();
    viewport.appendChild(gridElement);
    const zoomer = new ZoomAndDrag({
      'zoomableZone': viewport,
      'gridContainer': gridElement,
      'maxScale': 6,
    });
    gridManager.setZoomAndDragInstance(zoomer);
  };
  createGrid();

  // ---------------------^^SomewhatStable^^--------
  // TestingGround
  // Test context-menu
  // ++++++++++++
  const contextMenuManager = new ContextMenuManager({
    'contextMenuClass': `context-menu`,
    'wheelDetailsMenuClass': `context-menu`
  });
  // -----------
  // +++++++
  // TestingOrders
  const mockOrders = [
    {
      order_id: '1',
      action: 'move_wheelstack',
      posFrom: { row: 'A', column: 1 },
      posTo: { row: 'B', column: 2 },
      completed: false
    },
    {
      order_id: '2',
      action: 'move_wheelstack',
      posFrom: { row: 'C', column: 3 },
      posTo: { row: 'D', column: 4 },
      completed: false
    }
  ];
  let orderCounter = 3;

  const fetchNewOrders = () => {
    // Simulate adding a new order every second
    const newOrder = {
      order_id: orderCounter.toString(),
      action: 'move_wheelstack',
      posFrom: { row: 'E', column: 5 },
      posTo: { row: 'F', column: 6 },
      completed: false
    };
    orderCounter++;
    mockOrders.push(newOrder);
    return mockOrders;
  };
  const orderManager = new OrderManager('column3');
  window.completeOrder = (orderId) => orderManager.completeOrder(orderId);

  // Initial orders
  mockOrders.forEach(order => {
    orderManager.addOrder(order);
  });

  // Periodically fetch new orders and update the front-end
  setInterval(() => {
    const newOrders = fetchNewOrders();
    orderManager.ordersStack = [];
    orderManager.allOrders = {};
    newOrders.forEach(order => {
      orderManager.addOrder(order);
    });
  }, 2500); // Update every second
  // ------------
  // +++++++++
  // TestingColumn1
  const wheelContainer1 = document.getElementById('wheel-container1');
  const wheelContainer2 = document.getElementById('wheel-container2');

  for (let i = 0; i < 8; i += 1) {
    const newWheelStack = new WheelStack({
      'placementRow': `${i < 4 ? String(i + 1) : String(i - 3)}`,
      'placementColumn': `${i < 4 ? '0' : '1'}`,
      'wheelStackClickHandler': (wheelStack, event) => {
        contextMenuManager.showContextMenu(event, wheelStack);
      }
    })
    if (i < 4) {
      wheelContainer1.appendChild(newWheelStack.element);
    } else {
      wheelContainer2.appendChild(newWheelStack.element);
    }
    
  }
  // -----------------

});
