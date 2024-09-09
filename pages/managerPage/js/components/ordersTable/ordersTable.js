import {
     ORDERS_TABLE_COLUMNS_TRANSLATE,
     UPDATE_PERIODS,
     FLASH_MESSAGES,
     BACK_URLS,
     ORDER_TYPES_TRANSLATE_TABLE,
     PLACEMENT_TYPES,
     STORAGE_NAME,
     LABORATORY_NAME,
     EXTRA_ELEMENT_NAME,
} from "../../constants.js";
import flashMessage from "../../../../utility/flashMessage/flashMessage.js";
import convertISOToCustomFormat from "../../../../utility/convertToIso.js";
import { ordersContextMenu } from "../../mainScript.js";
import { getRequest } from "../../../../utility/basicRequests.js";


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
            const response = await getRequest(url, false, true);
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

    async #createPlacementRecord(placementData) {
        const placementType = placementData['placementType'];
        const placementId = placementData['placementId'];
        const placementRow = placementData['rowPlacement'];
        const placementCol = placementData['columnPlacement'];
        let placementRecord = "";
        if (placementCol === LABORATORY_NAME) {
            placementRecord = `<b>${PLACEMENT_TYPES[placementCol]}</b>`;
        } else if (placementRow === EXTRA_ELEMENT_NAME) {
            placementRecord = `<b>${PLACEMENT_TYPES[placementType]}</b><br><b>${placementCol}</b>`;
        } else if (placementType !== STORAGE_NAME) {
            placementRecord = `<b>${PLACEMENT_TYPES[placementType]}</b><br>Р: <b>${placementRow}</b> | К: <b>${placementCol}</b>`;
        } else {
            const storageGetNoDataURL = `${BACK_URLS.GET_STORAGE}/?storage_id=${placementId}&include_data=false`;
            const storageData = await getRequest(storageGetNoDataURL, true, true);
            const storageName = storageData['name'];
            placementRecord = `${PLACEMENT_TYPES[placementType]}<br><b>${storageName}</b>`;
        }
        return placementRecord;
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
        // BATCH
        column.innerHTML = `<b>${wheelstackData['batchNumber']}</b>`;
        column.id = orderData['_id'];
        row.appendChild(column);
        // ORDER `ObjectId`
        column = document.createElement('td');
        column.innerHTML = `${orderData['_id']}`;
        column.id = orderData['_id'];
        row.appendChild(column);
        // ORDER Type
        column = document.createElement('td');
        column.innerHTML = `${ORDER_TYPES_TRANSLATE_TABLE[orderData['orderType']]}`;
        column.id = orderData['_id'];
        row.appendChild(column);
        // SOURCE data
        column = document.createElement('td');
        let placementData = orderData['source'];
        column.innerHTML = await this.#createPlacementRecord(placementData);
        column.id = orderData['_id'];
        row.appendChild(column);
        // DESTINATION data
        column = document.createElement('td');
        placementData = orderData['destination'];
        column.innerHTML = await this.#createPlacementRecord(placementData);
        column.id = orderData['_id'];
        // RECEIPT DATE
        row.appendChild(column);
        column = document.createElement('td');
        const creationTime = convertISOToCustomFormat(orderData['createdAt'], true, true);
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
        let activeOrders = await this.#getData(activeOrdersUrl);
        activeOrders = activeOrders['activeOrders'];
        if (0 === Object.keys(activeOrders).length) {
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
            this.activeOrders = null;
            return;
        };
    if (this.emptyOrdersInterval) {
        clearInterval(this.emptyOrdersInterval);
        this.emptyOrdersInterval = null;
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
        this.activeOrders = activeOrders;
        this.updateOrderRows(initialFill);
    }

    cullExpired() {
        if (!this.activeOrders) {
            Object.keys(this.createdRows).forEach( key => {
                this.createdRows[key].remove();
                delete this.createdRows[key]
            })
            return;
        }
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
