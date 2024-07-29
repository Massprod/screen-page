import {
     ORDERS_TABLE_COLUMNS_TRANSLATE,
     UPDATE_PERIODS,
     FLASH_MESSAGES,
     BACK_URLS,
     ORDER_TYPES_TRANSLATE,
     PLACEMENT_TYPES,
} from "../../constants.js";
import flashMessage from "../../../../utility/flashMessage.js";
import convertISOToCustomFormat from "../../../../utility/convertToIso.js";
import { ordersContextMenu } from "../../mainScript.js";


export default class OrdersTable{
    constructor(
        container,
        targetPlatforms,
        targetGrids,
        getOrdersDataUrl,
        tableColumns,
    ) {
        // TODO: For now we're only use 1 grid + 1 platform
        // But in the future, we should be able to build ordersTable
        //  and download only orders of chosen platforms and grids.
        // For this, we will need to change data processing and extra Back part.
        this.container = container;
        this.getOrdersDataUrl = getOrdersDataUrl;
        this.platformsToUpdate = targetPlatforms;
        this.gridsToUpdate = targetGrids;
        this.tableColumns = tableColumns;
        this.createdRows = {};
        this.#init();
    }

    async #getData(url) {
        try {
            const response = await fetch(url);
            if (404 === response.status) {
                return null;
            }
            if (!response.ok) {
                flashMessage.show({
                    message: `Ошибка при получении данных Заказов: ${response.status}`,
                    color: FLASH_MESSAGES.FETCH_ERROR_FONT_COLOR,
                    backgroundColor: FLASH_MESSAGES.FETCH_ERROR_BG_COLOR,
                    position: 'top-center',
                    duration: FLASH_MESSAGES.FETCH_ERROR_DURATION,
                });
                throw new Error(`Error while getting ordersData ${response.statusText}. URL = ${url}`);
            }
            const presetData = await response.json();
            return presetData;
        } catch (error) {
            console.error(
                `There was a problem with getting ordersData: ${error}`
            );
            throw error
        }
    }

    #init() {
        // HEADER
        const headersContainer = document.createElement('div');
        headersContainer.classList.add("orders-table-header");
        const headerTable = document.createElement('table');
        const headerTableTHead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.id = "ordersHeader";
        this.tableColumns.forEach((element) => {
            let headerColumn = document.createElement("th");
            headerColumn.id = element;
            headerColumn.innerHTML = `<b>${ORDERS_TABLE_COLUMNS_TRANSLATE[element]}</b>`;
            headerRow.appendChild(headerColumn);
        })
        headerTableTHead.appendChild(headerRow);
        headerTable.appendChild(headerTableTHead);
        headersContainer.appendChild(headerTable);
        this.container.appendChild(headersContainer);
        // BODY
        const contentContainer = document.createElement("div");
        contentContainer.classList.add("orders-table-content");
        contentContainer.id = "ordersContent";
        const contentTable = document.createElement('table');
        this.contentTableBody = document.createElement('tbody');
        contentTable.appendChild(this.contentTableBody);
        contentContainer.appendChild(contentTable);
        this.container.appendChild(contentContainer);
    }

    async createNewRow(orderId) {
        const orderData = this.activeOrders[orderId];
        // No matter the order, we always going to have same batchNumber for source and dest.
        const wheelStackId = orderData['affectedWheelStacks']['source'];
        const wheelstackDataUrl = `${BACK_URLS.GET_WHEELSTACK_DATA_BY_ID}/${wheelStackId}`;
        const wheelstackData = await this.#getData(wheelstackDataUrl);
        if (null == wheelstackData) {
            flashMessage.show({
                message: `Несуществующая стопка используется в заказе ID: ${orderId}. Сообщите об этом обслуживающему персоналу.`,
                color: FLASH_MESSAGES.FETCH_NOT_FOUND_FONT_COLOR,
                backgroundColor: FLASH_MESSAGES.FETCH_NOT_FOUND_BG_COLOR,
                position: 'top-center',
                duration: 10000,
            });
            return;
        }
        const row = document.createElement('tr');
        row.id = orderData['_id'];
        // TODO: Adjust creation of a class and rows, so we could loop and create by set COLUMNS.
        let column = document.createElement('td');
        column.innerHTML = `${wheelstackData['batchNumber']}`;
        row.appendChild(column);
        column = document.createElement('td');
        column.innerHTML = `${orderData['_id']}`;
        column.id = orderData['_id'];
        row.appendChild(column);
        column = document.createElement('td');
        column.innerHTML = `${ORDER_TYPES_TRANSLATE[orderData['orderType']]}`;
        column.id = orderData['_id'];
        row.appendChild(column);
        column = document.createElement('td');
        const sourceType = orderData['source']['placementType'];
        const sourceId = orderData['source']['placementId'];
        const sourceRow = orderData['source']['rowPlacement'];
        const sourceCol = orderData['source']['columnPlacement'];
        column.innerHTML = `<b>${PLACEMENT_TYPES[sourceType]}</b> - ${sourceId}<br>
                            <b>Ряд</b>: ${sourceRow} | <b>Колонна</b> ${sourceCol}`;
        column.id = orderData['_id'];
        row.appendChild(column);
        column = document.createElement('td');
        const destinationType = orderData['destination']['placementType'];
        const destinationId = orderData['destination']['placementId'];
        const destinationRow = orderData['destination']['rowPlacement'];
        const destinationCol = orderData['destination']['columnPlacement'];
        column.innerHTML = `<b>${PLACEMENT_TYPES[destinationType]}</b> - ${destinationId}<br>
                            <b>Ряд</b>: ${destinationRow} | <b>Колонна</b> ${destinationCol}`;
        column.id = orderData['_id'];
        row.appendChild(column);
        column = document.createElement('td');
        const creationTime = convertISOToCustomFormat(orderData['createdAt'], true);
        column.innerHTML = `<b>${creationTime}</b>`;
        column.id = orderData['_id'];
        row.appendChild(column);
        this.createdRows[orderId] = row;
        this.contentTableBody.appendChild(row);
        row.addEventListener('contextmenu', async (event) => {
            event.preventDefault();
            await ordersContextMenu.showMenu(orderId, event);
        })
    }

    async updateOrderRows(initialFill) {
        for (let orderId in this.activeOrders) {
            if (orderId in this.createdRows) {
                continue
            }
            if (!initialFill) {
                flashMessage.show({
                    message: `Поступил новый заказ ID: ${orderId}`,
                    color: FLASH_MESSAGES.FETCH_NOT_FOUND_FONT_COLOR,
                    backgroundColor: FLASH_MESSAGES.FETCH_NOT_FOUND_BG_COLOR,
                    position: 'top-center',
                    duration: 3500,
                });
            }
            this.createNewRow(orderId);
        }
    }

    async updateActiveOrders() {
        const activeOrdersUrl = `${this.getOrdersDataUrl}?active_orders=true&completed_orders=false&canceled_orders=false`;
        const activeOrders = await this.#getData(activeOrdersUrl);
        // TODO:REfactor this monstrosity later.
        if (null === activeOrders) {
            if (!this.emptyOrdersInterval) {
                flashMessage.show({
                    message: 'В данный момент нет активных заказов',
                    color: FLASH_MESSAGES.FETCH_NOT_FOUND_FONT_COLOR,
                    backgroundColor: FLASH_MESSAGES.FETCH_NOT_FOUND_BG_COLOR,
                    position: 'top-center',
                    duration: 2000,
                })
                this.emptyOrdersInterval = setInterval(() => {
                    flashMessage.show({
                        message: 'В данный момент нет активных заказов',
                        color: FLASH_MESSAGES.FETCH_NOT_FOUND_FONT_COLOR,
                        backgroundColor: FLASH_MESSAGES.FETCH_NOT_FOUND_BG_COLOR,
                        position: 'top-center',
                        duration: 2000,
                    });
                }, 10000);
            }
            return;
        };
        if (this.emptyOrdersInterval) {
            clearInterval(this.emptyOrdersInterval);
            flashMessage.show({
                message: 'Поступили новые заказы',
                color: FLASH_MESSAGES.FETCH_NOT_FOUND_FONT_COLOR,
                backgroundColor: FLASH_MESSAGES.FETCH_NOT_FOUND_BG_COLOR,
                position: 'top-center',
                duration: 3000,
            })
        }
        let initialFill = false;
        if (!this.activeOrders) {
            initialFill = true;
        }
        this.activeOrders = activeOrders['activeOrders'];
        this.updateOrderRows(initialFill);
    }

    cullExpired() {
        for (let createdOrderId in this.createdRows) {
            if (!(createdOrderId in this.activeOrders)) {
                this.createdRows[createdOrderId].remove();
                delete this.createdRows[createdOrderId];
            }
        }
    }

    startUpdating() {
        if (this.updateIntervalId) {
            return;
        }
        this.updateIntervalId = setInterval(async () => {
            this.updateActiveOrders();
            this.cullExpired();
        }, UPDATE_PERIODS.ORDERS_TABLE_UPDATE_RATE
    )
    }

    stopUpdating() {
        if (!this.updateIntervalId) {
            return;
        }
        clearInterval(this.updateIntervalId);
        this.updateIntervalId = null;
    }

}
