import { getRequest, patchRequest } from "../../../../utility/basicRequests.js";
import { BACK_URLS, ELEMENT_TYPES, UPDATE_PERIODS } from "../../constants.js";
import updateMenuPosition from "../../../../utility/adjustContainerPosition.js";
import flashMessage from "../../../../utility/flashMessage.js";
import { batchesContextMenu, wheelstackContextMenu } from "../../mainScript.js";


export default class BatchesExpandedContainer{
    constructor() {
        this.createdBatchRows = {};
        this.createdWheelstackRows = {};
    }

    // +++ WheelstacksContainer
    async createWheelstackRow(wheelstackId) {
        const wheelstackDataURL = `${BACK_URLS.GET_WHEELSTACK_DATA_BY_ID}/${wheelstackId}`;
        const wheelstackData = await getRequest(wheelstackDataURL)
        const topWheelObjectId = wheelstackData['wheels'][wheelstackData['wheels'].length - 1];
        const topWheelDataURL = `${BACK_URLS.GET_WHEEL_DATA_BY_OBJECT_ID}/${topWheelObjectId}`;
        const topWheelData = await getRequest(topWheelDataURL);
        const topWheelId = topWheelData['wheelId'];
        const wheelstackRow = document.createElement('div');
        wheelstackRow.classList.add('extra-element-expanded-row');
        wheelstackRow.id = wheelstackId;
        const rowParag = document.createElement('p');
        rowParag.innerHTML = `ВХ: ${topWheelId}`;
        wheelstackRow.appendChild(rowParag);
        wheelstackRow.addEventListener('click', event => {
            wheelstackContextMenu.showMenu(event, wheelstackId, wheelstackRow);
        })
        return wheelstackRow;
    }

    async updateWheelstackRows() {
        if (!this.wheelstacksContainerElement) {
            return;
        }
        const newWheelstacksData = this.newBatchesInStorageData['elements'][this.wheelstacksContainerBatchNumber];
        const newWheelstacksIds = Object.keys(newWheelstacksData);
        if (0 === newWheelstacksIds.length) {
            this.hideWheelstackContainer();
            flashMessage.show({
                message: 'Отсутствуют элементы',
                color: 'white',
                backgroundColor: 'black',
                position: 'top-center',
                duration: 2000,
            })
            return;
        }
        this.wheelstacksContainerElement.style.display = 'block';
        this.wheelstacksContainerElement.style.visibility = 'visible';
        newWheelstacksIds.forEach( async wheelstackId => {
            if (wheelstackId in this.createdWheelstackRows) {
                return;
            }
            const newWheelstackRow = await this.createWheelstackRow(wheelstackId);
            this.wheelstacksContainerElement.appendChild(newWheelstackRow);
            this.createdWheelstackRows[wheelstackId] = newWheelstackRow;
        })
        const currentWheelstackRows = Object.keys(this.createdWheelstackRows);
        currentWheelstackRows.forEach(async wheelstackId => {
            if (wheelstackId in newWheelstacksData) {
                return;
            }
            this.createdWheelstackRows[wheelstackId].remove();
            delete this.createdWheelstackRows[wheelstackId];
        })
    }

    async createWheelstackContainer() {
        // Closer
        this.wheelstacksContainerCloser = async (event) => {
            if (this.wheelstacksContainerElement && this.wheelstacksContainerElement.contains(event.target)) {
                return;
            }
            if (wheelstackContextMenu.menuContainer && wheelstackContextMenu.menuContainer.contains(event.target)) {
                return;
            }
            if (wheelstackContextMenu.extraMenuContainer && wheelstackContextMenu.extraMenuContainer.contains(event.target)) {
                return;
            }
            if (wheelstackContextMenu.wheelsMenu && wheelstackContextMenu.wheelsMenu.contains(event.target)) {
                return;
            }
            this.hideWheelstackContainer();
        }
        this.wheelstacksContainerElement = document.createElement('div');
        this.wheelstacksContainerElement.classList.add('extra-element-expanded-container');
        this.wheelstacksContainerElement.style.visibility = 'hidden';
        document.body.appendChild(this.wheelstacksContainerElement);
        setTimeout( async () => {
            document.body.addEventListener('click', this.wheelstacksContainerCloser);
        }, 2);
    }

    async showWheelstacksContainer(event, openerElement, batchNumber) {
        if (this.wheelstacksContainerElement) {
            this.hideWheelstackContainer();
            if (openerElement === this.wheelstacksContainerOpener) {
                return;
            }
        }
        this.wheelstacksContainerBatchNumber = batchNumber; 
        this.wheelstacksContainerOpener = openerElement;
        await this.createWheelstackContainer()
        updateMenuPosition(event, this.wheelstacksContainerElement);
        this.startUpdatingWheelstackRows();

    }

    async hideWheelstackContainer() {
        this.wheelstacksContainerElement.remove();
        this.wheelstacksContainerElement = null;
        document.body.removeEventListener('click', this.wheelstacksContainerCloser);
        this.wheelstackContainerCloser = null;
        this.createdWheelstackRows = {};
        this.wheelstacksContainerBatchNumber = null;
        this.stopUpdatingWheelstackRows();
    }

    async startUpdatingWheelstackRows() {
        if (this.wheelstackRowsUpdatingInterval) {
            return;
        }
        this.wheelstackRowsUpdatingInterval = setInterval( async () => {
            this.updateWheelstackRows();
        }, UPDATE_PERIODS.BATCHES_WHEELSTACK_ROWS)
    }

    async stopUpdatingWheelstackRows() {
        if (!this.wheelstackRowsUpdatingInterval) {
            return;
        }
        clearInterval(this.wheelstackRowsUpdatingInterval);
        this.wheelstackRowsUpdatingInterval = null;
    }

    // WheelstacksContainer ---

    // +++ BatchRowsCreation
    async createBatchRow(batchNumber) {
        const batchRow = document.createElement('div');
        batchRow.classList.add('extra-element-dropdown-row');
        batchRow.classList.add('batch-row');
        batchRow.id = batchNumber;
        const batchParag = document.createElement('p');
        batchParag.innerText = `П: ${batchNumber}`;
        batchRow.appendChild(batchParag);
        // Batch ContextMenu
        batchRow.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            batchesContextMenu.buildMenu(event, batchNumber);
        })
        // Wheelstacks Container
        batchRow.addEventListener('click', (event) => {
            this.showWheelstacksContainer(event, batchRow, batchNumber);
        })
        return batchRow;
    }
    // BatchRowsCreation ---

    // +++ Updating batchRows
    async updateBatchRows() {
        if (!this.batchesContainerElement) {
            return;
        }

        this.batchesInStorageDataURL = `${BACK_URLS.GET_STORAGE}/?include_data=true&storage_id=${this.storageId}`;
        this.newBatchesInStorageData = await getRequest(this.batchesInStorageDataURL);
        const newBatches = Object.keys(this.newBatchesInStorageData['elements']);
        // TODO: Delete empty records from DB. We need extra endpoint for this.
        if (0 === newBatches.length) {
            this.hideBatchesContainer();
            flashMessage.show({
                message: 'В хранилище отсутствуют элементы',
                color: 'white',
                backgroundColor: 'black',
                position: 'top-center',
                duration: 2000,
            })
            return;
        }
        this.batchesContainerElement.style.display = 'block';
        this.batchesContainerElement.style.visibility = 'visible';
        newBatches.forEach( async (batchNumber) => {
            if (0 === Object.keys(this.newBatchesInStorageData['elements'][batchNumber]).length) {
                const CLEAR_URL = `${BACK_URLS.PATCH_CLEAR_EMPTY_BATCHES_STORAGES}/?storage_id=${this.storageId}&batch_number=${batchNumber}`;
                await patchRequest(CLEAR_URL);
                return;
            }
            if (batchNumber in this.createdBatchRows) {
                return;
            }
            const newBatchRow = await this.createBatchRow(batchNumber);
            this.batchesContainerElement.appendChild(newBatchRow);
            this.createdBatchRows[batchNumber] = newBatchRow;
        })
        const currentBatchRows = Object.keys(this.createdBatchRows);
        currentBatchRows.forEach(async (batchNumber) => {
            if (batchNumber in this.newBatchesInStorageData['elements']) {
                if (0 === Object.keys(this.newBatchesInStorageData['elements'][batchNumber])) {
                    this.createdBatchRows[batchNumber].remove();
                    delete this.createdBatchRows[batchNumber];
                    const CLEAR_URL = `${BACK_URLS.PATCH_CLEAR_EMPTY_BATCHES_STORAGES}/?storage_id=${this.storageId}&batch_number=${batchNumber}`;
                    await patchRequest(CLEAR_URL);
                }
                return;
            }
            this.createdBatchRows[batchNumber].remove();
            delete this.createdBatchRows[batchNumber];
        })
    }
    // Updating batchRows ---

    // +++ Creation
    async createContainer(openerElement) {
        // Closer
        this.batchesContainerCloser = async (event) => {
            if (this.batchesContainerElement.contains(event.target)) {
                return;
            }
            if (batchesContextMenu && batchesContextMenu.element) {
                return;
            }
            if (this.wheelstacksContainerElement && this.wheelstacksContainerElement.contains(event.target)) {
                return;
            }
            if (wheelstackContextMenu.menuContainer && wheelstackContextMenu.menuContainer.contains(event.target)) {
                return;
            }
            if (wheelstackContextMenu.extraMenuContainer && wheelstackContextMenu.extraMenuContainer.contains(event.target)) {
                return;
            }
            if (wheelstackContextMenu.wheelsMenu && wheelstackContextMenu.wheelsMenu.contains(event.target)) {
                return;
            }
            this.hideBatchesContainer();
        }
        this.batchesContainerOpener = openerElement;
        this.batchesContainerElement = document.createElement('div');
        this.batchesContainerElement.classList.add('extra-element-expanded-container');
        this.batchesContainerElement.style.visibility = 'hidden';
        document.body.appendChild(this.batchesContainerElement);
        setTimeout( async () => {
            document.body.addEventListener('pointerdown', this.batchesContainerCloser);
        }, 2);
    }

    async showBatchesContainer(event, openerElement, storageId) {
        if (this.batchesContainerElement) {
            this.hideBatchesContainer();
            if (openerElement === this.batchesContainerOpener) {
                this.batchesContainerOpener = null;
                return;
            }
        }
        this.storageId = storageId;
        await this.createContainer(openerElement);
        updateMenuPosition(event, this.batchesContainerElement);
        this.startUpdatingBatchRows();
    }
    // Creation ---

    hideBatchesContainer() {
        if (this.batchesContainerElement) {
            this.batchesContainerElement.remove();
        }
        this.batchesContainerElement = null;
        document.body.removeEventListener('pointerdown', this.batchesContainerCloser);
        this.createdBatchRows = {};
        this.stopUpdatingBatchRows();
        this.storageId = null;
        if (this.wheelstacksContainerElement) {
            this.hideWheelstackContainer();
        }
    }

    async startUpdatingBatchRows() {
        if (this.batchRowsUpdatingInterval) {
            return;
        }
        this.batchRowsUpdatingInterval = setInterval( () => {
            this.updateBatchRows();
        }, UPDATE_PERIODS.STORAGE_BATCHES_ROWS
        )
    }

    async stopUpdatingBatchRows() {
        if (!this.batchRowsUpdatingInterval) {
            return;
        }
        clearInterval(this.batchRowsUpdatingInterval);
        this.batchRowsUpdatingInterval = null;
    }

}
