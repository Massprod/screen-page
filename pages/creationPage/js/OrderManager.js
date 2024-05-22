import Order from './Order.js';

export default class OrderManager {
  constructor(containerId) {
    this.ordersStack = [];
    this.allOrders = {};
    this.container = document.getElementById(containerId);
    this.orderTable = this.#createOrderTable();
    this.orderDetailsMenu = this.#createOrderDetailsMenu();
    this.container.appendChild(this.orderTable);
    this.container.appendChild(this.orderDetailsMenu);
    this.hideOrderDetails = this.hideOrderDetails.bind(this);
    document.addEventListener('click', this.hideOrderDetails);
  }


  /**
   * Create the order table and return the table element.
   * @returns {HTMLElement} The created order table element.
   */
  #createOrderTable() {
    const table = document.createElement('table');
    table.id = 'orderTable';
    table.innerHTML = `
      <thead>
        <tr>
          <th>ID</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    return table;
  }

  /**
   * Create the order details menu and return the menu element.
   * @returns {HTMLElement} The created order details menu element.
   */
  #createOrderDetailsMenu() {
    const menu = document.createElement('div');
    menu.id = 'orderDetailsMenu';
    menu.className = 'context-menu';
    menu.style.display = 'none';
    return menu;
  }

  /**
   * Add a new order and display it in the table.
   * @param {Object} orderData - The data for the new order.
   */
  addOrder(orderData) {
    const order = new Order(orderData);
    this.ordersStack.push(order);
    this.allOrders[order.order_id] = order;
    this.displayOrders();
  }

  /**
   * Display all orders in the table.
   */
  displayOrders() {
    const orderTableBody = this.orderTable.querySelector('tbody');
    orderTableBody.innerHTML = ''; // Clear existing rows
    for (let index = (this.ordersStack.length - 1); index > -1; index -= 1) {
      console.log(index);
      console.log(this.ordersStack[index]);
      const row = this.createOrderElement(this.ordersStack[index]);
      orderTableBody.appendChild(row);
    }
  }

  /**
   * Create a table row element for an order.
   * @param {Order} order - The order for which to create the table row.
   * @returns {HTMLElement} The created table row element.
   */
  createOrderElement(order) {
    const row = document.createElement('tr');
    if (order.canceled) {
      row.innerHTML = `
      <td id='tableRow'>${order.order_id}</td>
      <td id='tableRow'>Canceled</td>
    `;
    } else {
      row.innerHTML = `
      <td id='tableRow'>${order.order_id}</td>
      <td id='tableRow'>${order.completed ? 'Completed' : 'Pending'}</td>
    `;
    }
    row.addEventListener('click', (event) => this.showOrderDetails(event, order));
    return row;
  }

  /**
   * Show the details of an order in the details menu.
   * @param {Event} event - The event that triggered showing the order details.
   * @param {Order} order - The order for which to show the details.
   */
  showOrderDetails(event, order) {
    let htmlString = `
      <div>ID: ${order.order_id}</div>
      <div>Action: ${order.action}</div>
      <div>From: ${JSON.stringify(order.posFrom)}</div>
      <div>To: ${JSON.stringify(order.posTo)}</div>
    `
    if (order.canceled) {
      htmlString += `<div>Status: Canceled</div>`;
    } else {
      htmlString += `<div>Status: ${order.completed ? 'Completed' : 'Pending'}</div>`;
    }
    htmlString += `<button class="context-menu-option" onclick="completeOrder('${order.order_id}')">Complete</button>`;
    this.orderDetailsMenu.innerHTML = htmlString;
    this.orderDetailsMenu.style.display = 'block';
    const { clientX: mouseX, clientY: mouseY } = event;
    this.orderDetailsMenu.style.top = `${mouseY}px`;
    this.orderDetailsMenu.style.left = `${mouseX}px`;
    this.adjustMenuPosition(this.orderDetailsMenu, mouseX, mouseY);
  }

  /**
   * Complete an order and update the table display.
   * @param {string} orderId - The ID of the order to complete.
   */
  completeOrder(orderId) {
    const order = this.allOrders[orderId];
    console.log('completeBut_dont');
    if (order) {
      console.log('completeBut_works');
      order.complete();
      this.displayOrders();
      this.hideOrderDetails();
    }
  }

  /**
   * Hide the order details menu.
   * @param {Event} event - The event that triggered hiding the order details.
   */
  hideOrderDetails(event) {
    if (!this.orderTable.contains(event.target) && !this.orderDetailsMenu.contains(event.target)) {
      this.orderDetailsMenu.style.display = 'none';
    }
  }

  /**
   * Adjust the position of the details menu to ensure it fits within the viewport.
   * @param {HTMLElement} menu - The details menu element.
   * @param {number} mouseX - The x-coordinate of the mouse event.
   * @param {number} mouseY - The y-coordinate of the mouse event.
   */
  adjustMenuPosition(menu, mouseX, mouseY) {
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
  }
}