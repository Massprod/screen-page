import getRequest from "../../../../utility/basicRequests.js";
import { BACK_URLS, UPDATE_PERIODS } from "../../constants.js";
import updateMenuPosition from "../../../../utility/adjustContainerPosition.js";
import flashMessage from "../../../../utility/flashMessage.js";
import { batchesContextMenu } from "../../mainScript.js";


export default class BatchesExpandedContainer{
    constructor() {
        this.createdBatchRows = {};
    }
    // +++ RowsCreation
    async createBatchRow(batchNumber) {
        const batchRow = document.createElement('div');
        batchRow.classList.add('extra-element-dropdown-row');
        batchRow.classList.add('batch-row');
        batchRow.id = batchNumber;
        const batchParag = document.createElement('p');
        batchParag.innerText = `П: ${batchNumber}`;
        batchRow.appendChild(batchParag);
        batchRow.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            batchesContextMenu.buildMenu(event, batchNumber);
        })
        return batchRow;
    }
    // RowsCreation ---

    // +++ Updating batchRows
    async updateBatchRows() {
        if (!this.containerElement) {
            return;
        }
        this.batchesInStorageDataURL = `${BACK_URLS.GET_ALL_STORAGES_DATA}/?include_data=true&storage_id=${this.storageId}`;
        this.newBatchesInStorageData = await getRequest(this.batchesInStorageDataURL);
        // console.log(this.newBatchesInStorageData);
        const newBatches = Object.keys(this.newBatchesInStorageData['elements']);
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
        this.containerElement.style.display = 'block';
        this.containerElement.style.visibility = 'visible';
        newBatches.forEach( async (batchNumber) => {
            if (batchNumber in this.createdBatchRows) {
                return;
            }
            const newBatchRow = await this.createBatchRow(batchNumber);
            this.containerElement.appendChild(newBatchRow);
            this.createdBatchRows[batchNumber] = newBatchRow;
        })
        const currentBatchRows = Object.keys(this.createdBatchRows);
        currentBatchRows.forEach(async (batchNumber) => {
            if (batchNumber in this.newBatchesInStorageData['elements']) {
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
            if (this.containerElement.contains(event.target)) {
                return;
            }
            if (batchesContextMenu && batchesContextMenu.element) {
                return;
            }
            this.hideBatchesContainer();
        }
        this.openerElement = openerElement;
        this.containerElement = document.createElement('div');
        this.containerElement.classList.add('extra-element-expanded-container');
        this.containerElement.style.visibility = 'hidden';
        document.body.appendChild(this.containerElement);
        setTimeout( async () => {
            document.body.addEventListener('click', this.batchesContainerCloser);
        }, 2);
    }

    async showElement(event, openerElement, storageId) {
        if (this.containerElement) {
            this.hideBatchesContainer();
            if (openerElement === this.openerElement) {
                this.openerElement = null;
                return;
            }
        }
        this.storageId = storageId;
        await this.createContainer(openerElement);
        updateMenuPosition(event, this.containerElement);
        this.startUpdatingBatchRows();
    }
    // Creation ---

    hideBatchesContainer() {
        this.containerElement.remove();
        this.containerElement = null;
        document.body.removeEventListener('click', this.batchesContainerCloser);
        this.createdBatchRows = {};
        this.stopUpdatingBatchRows();
        this.storageId = null;
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
