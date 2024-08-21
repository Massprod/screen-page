import { BACK_URLS, UPDATE_PERIODS } from "../../constants.js";
import getRequest from "../../../../utility/basicRequests.js";
import { batchesExpandedElements } from "../../mainScript.js";


export default class StoragesManager{
    constructor(
        container
    ) {
        this.container = container;
        this.#init();
        // {
        //    storageId: {
        //      element: link,
        //      elementData: { elementData },
        //    }
        //  }
        this.createdStorageRows = {};
    }

    #init() {
        // Container
        this.storagesContainer = document.createElement('div');
        this.storagesContainer.classList.add('storage-elements-container');
        this.storagesContainer.id = 'storageElements';
        // Header
        this.storagesHeader = document.createElement('div');
        this.storagesHeader.classList.add('extra-elements-header');
        this.storagesHeader.id = 'storageElementsHeader';
        this.storagesHeader.innerText = 'Хранилища';
        this.storagesContainer.appendChild(this.storagesHeader);
        // Content
        this.storagesContent = document.createElement('div');
        this.storagesContent.classList.add('extra-elements-content');
        this.storagesContent.id = 'storageElementsContent';
        this.storagesContainer.appendChild(this.storagesContent);
        // Open|Close Action
        this.storagesHeader.addEventListener('click', () => {
            if (this.contentOpened) {
                this.storagesContent.style.maxHeight = '0px';
                const storageExpanded = document.querySelector('storage-element-expanded-container');
                if (storageExpanded) {
                    storageExpanded.remove();
                }
                this.contentOpened = false;
                this.stopUpdatingStorages();
            } else {
                this.contentOpened = true;
                this.storagesContent.style.maxHeight = '250px';
                this.startUpdatingStorages();
            }
        });

        this.container.appendChild(this.storagesContainer);
    }

    // +++ STORAGE ROWS
    
    async createStorageRow(rowData) {
        const storageRow = document.createElement('div');
        storageRow.classList.add('extra-element-dropdown-row');
        storageRow.id = `${rowData['_id']}`;
        const storageRowParag = document.createElement('p');
        storageRowParag.innerHTML = `${rowData['name']}`;
        storageRow.appendChild(storageRowParag);
        storageRow.addEventListener('click', async (event) => {
            batchesExpandedElements.showElement(event, storageRow, rowData['_id']);
        })
        return storageRow;
    }

    async updateStorageRows() {
        this.getAllStoragesNoDataURL = `${BACK_URLS.GET_ALL_STORAGES_NO_DATA}/?include_data=False`;
        this.newStoragesNoData = await getRequest(this.getAllStoragesNoDataURL);
        // Create | Update already existing rows
        this.lastUpdateStorageIds = {};
        this.newStoragesNoData.forEach( async (storageData) => {
            const storageId = storageData['_id'];
            this.lastUpdateStorageIds[storageId] = true;
            if (storageId in this.createdStorageRows) {
                this.createdStorageRows[storageId]['elementData'] = storageData;
                return;
            }
            const newStorageRow = await this.createStorageRow(storageData);
            this.createdStorageRows[storageId] = {};
            this.createdStorageRows[storageId]['element'] = newStorageRow;
            this.createdStorageRows[storageId]['elementData'] = storageData;
            this.storagesContent.appendChild(newStorageRow);
        });
        // Delete outdated
        for (let storageId in this.createdStorageRows) {
            if (!(storageId in this.lastUpdateStorageIds)) {
                this.createdStorageRows[storageId]['element'].remove();
                delete this.createdStorageRows[storageId];
            }
        }
    }

    async startUpdatingStorages() {
        if (this.intervalUpdatingStorages) {
            return;
        }
        this.intervalUpdatingStorages = setInterval(() => {
            this.updateStorageRows();
        }, UPDATE_PERIODS.STORAGE_ROWS
    )
    }

    async stopUpdatingStorages() {
        if (!this.intervalUpdatingStorages) {
            return;
        }
        clearInterval(this.intervalUpdatingStorages);
        this.intervalUpdatingStorages = null;
    }
    // STORAGE ROWS ---
}