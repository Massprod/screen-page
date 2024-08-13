import flashMessage from "../../../../utility/flashMessage.js";
import {
    FLASH_MESSAGES,
    ORDER_TYPES_TRANSLATE,
    UPDATE_PERIODS,
 } from "../../constants.js";
import { gridManager, platformManager } from "../../mainScript.js";


export default class OrdersContextMenu{
    constructor(
        ordersDataUrl,
        active,
        completed,
        canceled,
        completeOrdersUrl,
        cancelOrdersUrl,
    ) {
        this.orderDataUrl = `${ordersDataUrl}`;
        this.completeOrdersUrl = `${completeOrdersUrl}`;
        this.cancelOrdersUrl = `${cancelOrdersUrl}`;
        this.activeFilter = `active_order=${active}`;
        this.completedFilter = `completed_order=${completed}`;
        this.canceledFilter = `canceled_order=${canceled}`;
        this.orderData = null;
    }

    async #getOrderData(url) {
        try {
            const response = await fetch(url);
            if (404 === response.status) {
                return null;
            }
            if (!response.ok) {
                flashMessage.show({
                    message: `Ошибка при получении данных Заказа: ${response.status}`,
                    color: FLASH_MESSAGES.FETCH_ERROR_FONT_COLOR,
                    backgroundColor: FLASH_MESSAGES.FETCH_ERROR_BG_COLOR,
                    position: 'top-center',
                    duration: FLASH_MESSAGES.FETCH_ERROR_DURATION,
                });
                throw new Error(`Error while getting orderData ${response.statusText}. URL = ${url}`);
            }
            const presetData = await response.json();
            return presetData;
        } catch (error) {
            console.error(
                `There was a problem with getting orderData: ${error}`
            );
            throw error
        }
    }

    async #postOrderData(url) {
        try {
            const response = await fetch(url, {
                method: "POST",
            });
            if (!response.ok) {
                flashMessage.show({
                    message: `Ошибка при обновлении статуса заказа: ${response.status}`,
                    color: FLASH_MESSAGES.FETCH_ERROR_FONT_COLOR,
                    backgroundColor: FLASH_MESSAGES.FETCH_ERROR_BG_COLOR,
                    position: 'top-center',
                    duration: 5000,
                });
                throw new Error(`Error while updating orderStatus ${response.statusText}. URL = ${url}`);
            }
            return response
        } catch (error) {
            console.error(
                `There was a problem with updating orderStatus: ${error}`
            );
            throw error
        }
    }

    #buildMenu(event) {
        if (this.element) {
            this.element.remove();
        }
        this.element = document.createElement('div');
        this.element.classList.add("orders-context-menu-container");
        this.element.id = `OrderMenu:${this.orderData['_id']}`;
        // ID ROW
        const orderIdRow = document.createElement('div');
        orderIdRow.classList.add("orders-context-menu-row");
        orderIdRow.id = `${this.orderData['_id']}`;
        const orderIdRowParag = document.createElement('p');
        orderIdRowParag.innerHTML = `ID: <b>${this.orderData['_id']}</b>`;
        orderIdRow.appendChild(orderIdRowParag);
        this.element.appendChild(orderIdRow);
        orderIdRow.addEventListener('click', (event) => {
            if (!this.cellsMarked) {
                this.markCells(this.orderData['_id']);
                this.highlightInterval(this.orderData['_id']);
            } else {
                this.unmarkHiglighted();
                if (this.highlightTimeout) {
                    clearTimeout(this.highlightTimeout);
                }
                // console.log('CURRENTORDER', this.orderData['_id'])
                // console.log("CLICKEDBEFORE", this.clickedOrderId);
                if (this.clickedOrderId !== this.orderData['_id']) {   
                    this.markCells(this.orderData['_id']);
                    this.clearHighlightInterval();
                    this.highlightInterval(this.orderData['_id']);
                } else {
                    this.clearHighlightInterval();
                    this.cellsMarked = false;
                }
                
            }
        })
        // TYPE ROW
        const orderTypeRow = document.createElement('div');
        orderTypeRow.classList.add("orders-context-menu-row");
        const orderType = ORDER_TYPES_TRANSLATE[this.orderData['orderType']];
        orderTypeRow.id = `OrderType:${orderType}`;
        const orderTypeParag = document.createElement('p');
        orderTypeParag.innerHTML = `Тип: ${orderType}`;
        orderTypeRow.appendChild(orderTypeParag);
        this.element.appendChild(orderTypeRow);
        // +++ BUTTONS ROW
        const orderButtonsRow = document.createElement('div');
        orderButtonsRow.classList.add('orders-context-menu-buttons-row');
        orderButtonsRow.id = 'orderButtons';
        //   COMPLETE BUTTON
        const orderCompleteButton = document.createElement('div');
        orderCompleteButton.classList.add('orders-context-menu-button');
        orderCompleteButton.classList.add('order-complete');
        orderCompleteButton.id = 'orderComplete';
        orderCompleteButton.textContent = 'Выполнить';
        orderCompleteButton.addEventListener('click', async () => {
            const completeUrl = `${this.completeOrdersUrl}/${this.orderData['_id']}`;
            const response = await this.#postOrderData(completeUrl);
            flashMessage.show({
                message: `Статус заказа "${this.orderData['_id']}" изменён на Выполнен`,
                color: FLASH_MESSAGES.FETCH_ERROR_FONT_COLOR,
                backgroundColor: FLASH_MESSAGES.FETCH_ERROR_BG_COLOR,
                position: 'top-center',
                duration: 6000,
            });
            this.removeMenu();
        })
        orderButtonsRow.appendChild(orderCompleteButton);
        //   CANCEL BUTTON
        const orderCancelButton = document.createElement('div');
        orderCancelButton.classList.add("orders-context-menu-button");
        orderCancelButton.classList.add('order-cancel')
        orderCancelButton.id = 'orderCancel';
        orderCancelButton.textContent = 'Отменить';
        orderCancelButton.addEventListener('click', async () => {
            const cancelUrl = `${this.cancelOrdersUrl}/${this.orderData['_id']}`;
            const response =await this.#postOrderData(cancelUrl);
            flashMessage.show({
                message: `Статус заказа "${this.orderData['_id']}" изменён на Отменён`,
                color: FLASH_MESSAGES.FETCH_ERROR_FONT_COLOR,
                backgroundColor: FLASH_MESSAGES.FETCH_ERROR_BG_COLOR,
                position: 'top-center',
                duration: 6000,
            });
            this.removeMenu();
        })
        orderButtonsRow.appendChild(orderCancelButton);
        this.element.appendChild(orderButtonsRow);
        // BUTTONS ROW ---
        document.body.appendChild(this.element);
        this.menuCloser = (event) => {
            if (this.element && !this.element.contains(event.target)) {
                this.removeMenu(true);
                this.stopUpdating();
                document.removeEventListener('click', this.menuCloser);
                this.menuCloser = null;
            }
        } 
        document.addEventListener("click", this.menuCloser);
        this.updateMenuPosition(event)
    }

    markCells(clickedOrderId) {
        this.clickedOrderId = clickedOrderId;
        // TODO: Adjust when we add pages for a platforms and grids.
        //       Additionally highlight order in OrdersTable.
        // SOURCE <- GRID || basePlatform
        const sourceId = this.orderData['source']['placementId'];
        const sourceType = this.orderData['source']['placementType'];
        const sourceRow = this.orderData['source']['rowPlacement'];
        const sourceCol = this.orderData['source']['columnPlacement'];
        this.sourceCell = null;
        if (gridManager.gridId !== sourceId && platformManager.platformId !== sourceId) {
            flashMessage.show({
                message: 'Исходная клетка не находится в активных окнах',
                color: FLASH_MESSAGES.FETCH_NOT_FOUND_FONT_COLOR,
                backgroundColor: FLASH_MESSAGES.FETCH_NOT_FOUND_BG_COLOR,
                position: 'top-center',
                duration: FLASH_MESSAGES.FETCH_NOT_FOUND_DURATION,
            });
            return;
        }
        if (sourceType === 'grid') {
            this.sourceCell = gridManager['gridRows'][sourceRow].columns[sourceCol];
        } else if (sourceType === 'basePlatform') {
            this.sourceCell = platformManager['platformRows'][sourceRow].columns[sourceCol];
        }
        // DESTINATION <- only can be a GRID
        const destinationId = this.orderData['destination']['placementId'];
        const destinationRow = this.orderData['destination']['rowPlacement'];
        const destinationCol = this.orderData['destination']['columnPlacement'];
        this.destinationCell = null;
        if (gridManager.gridId !== destinationId) {
            flashMessage.show({
                message: 'Конечная клетка не находится в активных окнах',
                color: FLASH_MESSAGES.FETCH_NOT_FOUND_FONT_COLOR,
                backgroundColor: FLASH_MESSAGES.FETCH_NOT_FOUND_BG_COLOR,
                position: 'top-center',
                duration: FLASH_MESSAGES.FETCH_NOT_FOUND_DURATION,
            });
            return;
        }
        if ('extra' == destinationRow) {
            this.destinationCell = gridManager.extraElements[destinationCol];
        } else {
            this.destinationCell = gridManager['gridRows'][destinationRow].columns[destinationCol];
        }
        this.sourceCell.orderMarked = true;
        this.sourceCell.element.classList.add('highlight')
        this.destinationCell.orderMarked = true;
        this.destinationCell.element.classList.add('highlight');
        this.cellsMarked = true;
        flashMessage.show({
            message: 'Выделены объекты относящиеся к выбранному Заказу',
            color: FLASH_MESSAGES.FETCH_NOT_FOUND_FONT_COLOR,
            backgroundColor: FLASH_MESSAGES.FETCH_NOT_FOUND_BG_COLOR,
            position: 'top-center',
            duration: 3000,
        });
        // TODO: ADD same mark for a row in the ORDERS table.
    }

    unmarkHiglighted() {
        this.sourceCell.orderMarked = false;
        this.destinationCell.orderMarked = false;
        const allMarked = document.querySelectorAll('.highlight');
        allMarked.forEach((element) => {
            element.classList.remove('highlight');
        })
    }

    highlightInterval(orderId) {
        // console.log('CHECK_UPDATE_HIGHLIGHT');
        if (this.highlightIntervalId) {
            return
        }
        this.highlightIntervalId = setInterval(async () => {
            const allRelated = document.querySelectorAll(`#${CSS.escape(orderId)}`);
            allRelated.forEach((element) => {
                element.classList.add('highlight');
            })
            const orderDataUrl = `${this.orderDataUrl}/${orderId}?${this.activeFilter}&${this.completedFilter}&${this.canceledFilter}`;
            const orderData = await this.#getOrderData(orderDataUrl);
            if (null == orderData) {
                this.clearHighlightInterval();
                this.unmarkHiglighted();
                this.removeMenu();
                this.cellsMarked = false;
                flashMessage.show({
                    message: 'Данные заказа более не представлены среди Активных',
                    color: FLASH_MESSAGES.FETCH_NOT_FOUND_FONT_COLOR,
                    backgroundColor: FLASH_MESSAGES.FETCH_NOT_FOUND_BG_COLOR,
                    position: 'top-center',
                    duration: 4000,
                });
            }
            // console.log(orderId);
            // console.log(allRelated);
        }, 50
        )
    }

    clearHighlightInterval() {
        if (!this.highlightIntervalId) {
            return;
        }
        clearInterval(this.highlightIntervalId);
        this.highlightIntervalId = null;
    }

    removeMenu() {
        if (this.element) {
            this.element.remove();
            this.orderData = null;
            this.element = null;
            if (this.highlightTimeout) {
                clearTimeout(this.highlightTimeout);
            }
            if (this.highlightIntervalId) {
                this.highlightTimeout = setTimeout(() => {
                    this.clearHighlightInterval();
                    this.unmarkHiglighted();
                    this.cellsMarked = false;
                    flashMessage.show({
                        message: 'Выделение объектов заказа отключено',
                        color: FLASH_MESSAGES.FETCH_NOT_FOUND_FONT_COLOR,
                        backgroundColor: FLASH_MESSAGES.FETCH_NOT_FOUND_BG_COLOR,
                        position: 'top-center',
                        duration: 4000,
                    });
                }, 20000);
            }
        }
    }

    async showMenu(orderId, event) {
        const orderDataUrl = `${this.orderDataUrl}/${orderId}?${this.activeFilter}&${this.completedFilter}&${this.canceledFilter}`;
        const orderData = await this.#getOrderData(orderDataUrl);
        if (null === orderData) {
            flashMessage.show({
                message: 'Заказ не найден',
                color: FLASH_MESSAGES.FETCH_NOT_FOUND_FONT_COLOR,
                backgroundColor: FLASH_MESSAGES.FETCH_NOT_FOUND_BG_COLOR,
                position: 'top-center',
                duration: FLASH_MESSAGES.FETCH_NOT_FOUND_DURATION,
            });
            this.removeMenu();
            return;
        }
        this.orderData = orderData;
        this.#buildMenu(event);
        this.updateMenuPosition(event);
        this.startUpdating();
    }

    async checkExistence() {
        if (this.orderData) {
            const orderDataUrl = `${this.orderDataUrl}/${this.orderData['_id']}?${this.activeFilter}&${this.completedFilter}&${this.canceledFilter}`;
            const orderData = await this.#getOrderData(orderDataUrl);
            // console.log("EXISTENCE_CHECK");
            if (null === orderData) {
                // console.log('EXISTENCE_CLOSED'   );
                this.removeMenu();
                this.stopUpdating();
            }
        }
    }


    async startUpdating() {
        if (this.updateIntervalId) {
            return;
        }
        this.updateIntervalId = setInterval(async () => {
            await this.checkExistence();
        }, UPDATE_PERIODS.EXTRA_ELEMENT_ORDERS_CONTAINER
    )
    }

    async stopUpdating() {
        if (!this.updateIntervalId) {
            return;
        }
        clearInterval(this.updateIntervalId);
        this.updateIntervalId = null;
    }

    updateMenuPosition(event) {
        if (!this.element) {
            return;
        }
        const touch = event.targetTouches ? event.targetTouches[0] : event;

        const { clientX: mouseX, clientY: mouseY } = touch;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const elementWidth = this.element.offsetWidth;
        const elementHeight = this.element.offsetHeight;
        
        let positionX = mouseX + 10; // Default position
        let positionY = mouseY + 10; // Default position

        // Adjust position if the hover display goes out of the viewport
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
