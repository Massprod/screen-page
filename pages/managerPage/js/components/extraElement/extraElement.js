import { UPDATE_PERIODS } from "../../constants.js";
import flashMessage from "../../../../utility/flashMessage/flashMessage.js";
import { ordersContextMenu } from "../../mainScript.js";


export default class ExtraElement{
    constructor(
        container,
        elementName,
        elementData,
    ) {
        this.container = container;
        this.elementName = elementName;
        this.elementData = elementData;
        this.#init();
        this.updateIntervalId = null;
    }

    #init() {
        this.element = document.createElement("div");
        this.element.classList.add("extra-element-dropdown-row");
        const parag = document.createElement('p');
        parag.innerHTML = `Имя: <b>${this.elementName}</b>`;
        this.element.appendChild(parag);
        this.element.id = this.elementName;
        this.container.appendChild(this.element);
        this.element.addEventListener("click", (event) => {
            event.preventDefault();
            const exist = document.getElementById(`${this.elementName}OrdersContainer`);
            if (exist) {
                exist.remove();
                return;
            }
            this.showOrders();
        })
    }

    createOrderRow(orderId) {
        const orderRow = document.createElement('div');
        orderRow.classList.add('extra-element-expanded-row');
        const parag = document.createElement('p');
        parag.innerHTML = `ID: <b>${orderId}</b>`;
        orderRow.appendChild(parag);
        orderRow.id = `${orderId}`;
        // +++ CONTEXT_MENU
        orderRow.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            ordersContextMenu.showMenu(orderId, event);
        })
        // CONTEXT_MENU ---
        return orderRow;
    }

    showOrders() {
        const exist = document.querySelector('.extra-element-expanded-container')
        if (exist) {
            exist.remove();
        }
        const currentOrders = this.elementData['orders'];
        if (0 === Object.keys(currentOrders).length) {
            flashMessage.show({
                message: 'Элемент не имеет привязанных Заказов',
                color: 'white',
                backgroundColor: 'black',
                position: 'top-center',
                duration: 3000,
            });
            return;
        } 
        const ordersContainer = document.createElement('div');
        ordersContainer.classList.add('extra-element-expanded-container');
        ordersContainer.id = `${this.elementName}OrdersContainer`
        const coordinates = this.element.getBoundingClientRect();
        const rowTopCoordinate = coordinates.top;
        const rowRightCoordinate = coordinates.right;
        ordersContainer.style.top = `${rowTopCoordinate}px`;
        ordersContainer.style.left = `${rowRightCoordinate}px`;
        ordersContainer.style.display = 'block';
        for (let orderId in currentOrders) {
            const orderRow = this.createOrderRow(orderId);
            ordersContainer.appendChild(orderRow);
        }
        document.body.appendChild(ordersContainer);
        this.startUpdating();
    }
    
    async updateRows() {
        const ordersContainer = document.querySelector(`#${this.elementName}OrdersContainer`);
        if (!ordersContainer) {
            this.stopUpdating();
            return;
        }
        const currentOrders = this.elementData['orders'];
        if (0 === Object.keys(currentOrders).length) {
            ordersContainer.remove();
            this.stopUpdating();
            flashMessage.show({
                message: 'Элемент больше не имеет привязанных Заказов',
                color: 'white',
                backgroundColor: 'black',
                position: 'top-center',
                duration: 1500,
            });
            return;
        }
        for (let orderRow of ordersContainer.childNodes) {
            if (orderRow.id in currentOrders) {
                continue
            }
            orderRow.remove();
        }
        for (let newOrder in currentOrders) {
            const checkId = CSS.escape(newOrder);
            if (ordersContainer.querySelector(`#${checkId}`)) {
                continue;
            };
            const newOrderRow = this.createOrderRow(newOrder);
            ordersContainer.appendChild(newOrderRow);
        }
    }

    async startUpdating() {
        if (this.updateIntervalId !== null) {
            return;
        }
        this.updateIntervalId = setInterval(() => {
            this.updateRows();
        }, UPDATE_PERIODS.EXTRA_ELEMENT_ORDERS_CONTAINER
    )
    }

    async stopUpdating() {
        if (this.updateIntervalId === null) {
            return;
        }
        clearInterval(this.updateIntervalId);
        this.updateIntervalId = null;
    }
}