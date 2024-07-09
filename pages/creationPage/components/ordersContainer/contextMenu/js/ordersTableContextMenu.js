import { ORDER_MOVE_TYPES_TRANSLATION, BACK_GRID_TYPE_TRANSLATIONS } from "../../../constants.js";
import OrderTableWheelstackContextMenu from "../js/ordersTableWheelstackContextMenu.js";

export default class OrderContextMenu {
    constructor(tableRow) {
        this.assignedRow = tableRow;
        this.buttonsRow = null;
        this.element = this.#createMenu();
        document.body.appendChild(this.element);
        this.#addEventListeners();
        this.assignedWheelstackMenu = null;
        this.previousUpdate = this.assignedRow['rowData']['lastUpdated'];
        this.updateIntervalId = null;
    }

    #createMenu() {
        const menu = document.createElement('div');
        menu.classList = 'order-context-menu';
        // typeRow
        const typeRow = document.createElement('div');
        typeRow.classList.add('order-context-menu-standard-row');
        menu.appendChild(typeRow);
        const typeRowName = document.createElement('div');
        typeRowName.classList.add('order-context-menu-standard-row-name');
        typeRowName.innerHTML = '<b>Тип</b>:';
        typeRow.appendChild(typeRowName);
        const typeRowData = document.createElement('div');
        typeRowData.classList.add('order-context-menu-standard-row-data');
        typeRowData.textContent = ORDER_MOVE_TYPES_TRANSLATION[this.assignedRow.rowData['orderType']];
        typeRow.appendChild(typeRowData);
        // ---
        // idRow
        const idRow = document.createElement('div');
        idRow.classList.add('order-context-menu-standard-row');
        menu.appendChild(idRow);
        const idRowName = document.createElement('div');
        idRowName.classList.add('order-context-menu-standard-row-name');
        idRowName.innerHTML = '<b>Номер</b>:';
        idRow.appendChild(idRowName);
        const idRowData = document.createElement('div');
        idRowData.classList.add('order-context-menu-standard-row-data');
        idRowData.textContent = this.assignedRow.rowData['_id'];
        idRow.appendChild(idRowData);
        // wheelStack
        const wheelStackRow = document.createElement('div');
        wheelStackRow.classList.add('order-context-menu-standard-row');
        menu.appendChild(wheelStackRow);
        const wheelStackRowName = document.createElement('div');
        wheelStackRowName.classList.add('order-context-menu-standard-row-name');
        wheelStackRowName.innerHTML = '<b>Стопка</b>';
        wheelStackRow.appendChild(wheelStackRowName);
        const wheelStackRowData = document.createElement('div');
        wheelStackRowData.classList.add('order-context-menu-standard-row-data');
        wheelStackRowData.textContent = `${this.assignedRow.rowData['affectedWheelStacks']['source']}`;
        // TODO: tempo context menu for the wheelStack.
        wheelStackRowData.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            if (null !== this.assignedWheelstackMenu) {
                this.assignedWheelstackMenu.element.remove();
            }
            const wheelStackContextMenu = new OrderTableWheelstackContextMenu(this);
            wheelStackContextMenu.showMenu(event);
            this.assignedWheelstackMenu = wheelStackContextMenu;
        })
        // --
        wheelStackRow.appendChild(wheelStackRowData);
        // ---
        this.#updateButtons(menu);
        this.setUpdatingButtons(100);
        // ---
        return menu;
    }

    // Cringe buttons. <- full rebuild later, just for test.
    #updateButtons(menu) {
        if (this.buttonsRow) {
            this.buttonsRow.remove();
        }
        // Tempo buttons
        const buttonsRow = document.createElement('div');
        buttonsRow.classList.add('order-context-menu-buttons-row');
        const orderData = this.assignedRow.rowData;
        if ('pending' === orderData['status']) {
            buttonsRow.appendChild(this.#createStartButton('Начать'));
            buttonsRow.appendChild(this.#createCancelButton('Отменить'));
        } else if ('inProgress' === orderData['status']) {
            buttonsRow.appendChild(this.#createCompleteButton('Выполнить'));
            buttonsRow.appendChild(this.#createStopButton('Остановить'));
        }
        this.buttonsRow = buttonsRow;
        menu.appendChild(this.buttonsRow);
        // ---

    }


    #createStartButton(text) {
        const button = document.createElement('button');
        button.textContent = text;
        button.classList.add('order-context-menu-button');
        button.addEventListener('click', event => {
            const orderId = this.assignedRow['rowData']['_id'];
            fetch(
                `http://127.0.0.1:8000/orders/${orderId}/start`,
                {
                    method: 'PUT',
                }
            ).then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
            }).catch((error) => {
                console.error('Error: ', error);
            });
        });
        return button;
    }

    #createCancelButton(text) {
        const button = document.createElement('button');
        button.textContent = text;
        button.classList.add('order-context-menu-button');
        button.addEventListener('click', event => {
            const orderId = this.assignedRow['rowData']['_id'];
            fetch(
                `http://127.0.0.1:8000/orders/${orderId}/cancel`,
                {
                    method: 'POST',
                }
            ).then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
            }).catch((error) => {
                console.error('Error: ', error);
            });
        });
        return button;
    }

    #createCompleteButton(text) {
        const button = document.createElement('button');
        button.textContent = text;
        button.classList.add('order-context-menu-button');
        button.addEventListener('click', event => {
            const orderId = this.assignedRow['rowData']['_id'];
            fetch(
                `http://127.0.0.1:8000/orders/${orderId}/complete`,
                {
                    method: 'POST',
                }
            ).then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
            }).catch((error) => {
                console.error('Error: ', error);
            });
        })
        return button;
    }

    #createStopButton(text) {
        const button = document.createElement('button');
        button.textContent = text;
        button.classList.add('order-context-menu-button');
        button.addEventListener('click', event => {
            const orderId = this.assignedRow['rowData']['_id'];
            fetch(
                `http://127.0.0.1:8000/orders/${orderId}/stop`,
                {
                    method: 'PUT',
                }
            ).then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
            }).catch((error) => {
                console.error('Error: ', error);
            });
        })
        return button;
    }
    //----

    #addEventListeners() {
        // Close context menu on outside click
        document.addEventListener('click', this.#closeMenu.bind(this));
    }

    #closeMenu(event) {
        if (!this.element.contains(event.target) && null === this.assignedWheelstackMenu) {
            this.element.remove();
            document.removeEventListener('click', this.#closeMenu.bind(this));
            if (null !== this.assignedWheelstackMenu) {
                this.assignedWheelstackMenu.forceCloseMenu();
            }
            if (this.updateIntervalId) {
                console.log('test1');
                clearInterval(this.updateIntervalId);
            }
        }
    }

    forceClose() {
        this.element.remove();
        document.removeEventListener('click', this.#closeMenu.bind(this));
        if (null != this.assignedWheelstackMenu) {
            this.assignedWheelstackMenu.forceCloseMenu();
        }
        if (this.updateIntervalId) {
            console.log('test');
            clearInterval(this.updateIntervalId);
        }
    }

    show(event) {
        this.element.style.display = 'block';
        this.element.classList.add('order-context-menu-show');
        this.updateContextMenuPosition(event);
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

    #checkTime() {
        if (this.previousUpdate !== this.assignedRow['rowData']['lastUpdated']) {
            this.#updateButtons(this.element);
            this.previousUpdate = this.assignedRow['rowData']['lastUpdated'];
        }
    }

    setUpdatingButtons(frequency) {
        this.updateIntervalId = setInterval(() => this.#checkTime(), frequency);
    }

}
