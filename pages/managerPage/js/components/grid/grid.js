import { BACK_URLS, UPDATE_PERIODS } from "../../constants.js";
import CellsRow from "../cellsRow/cellsRow.js";
import ExtraElement from "../extraElement/extraElement.js";
import BatchElement from "../batchElement/batchElement.js";
import flashMessage from "../../../../utility/flashMessage/flashMessage.js";
import { getRequest } from "../../../../utility/basicRequests.js";


// TODO: Merge GridManager AND BasePlatformManager
//  They're basically doing the same, I was expecting them to build differently, because extra elements.
//  But we can just exclude extra elements creation, and everything else is going to be the same.
//  We can just have one class for it. For now leaing it like this, because MAYBE they will differ.

export default class GridManager{
    constructor(
        container, extraElementsContainer,
    ) {
        this.container = container;
        this.extraElementsContainer = extraElementsContainer;
        this.batchElementsContainer = extraElementsContainer;
        this.getPresetURL = `${BACK_URLS.GET_PRESET_BY_NAME}`;
        this.getCellsDataURL = `${BACK_URLS.GET_GRID_CELLS_DATA_BY_NAME}`;
        this.getCellsLastChange = `${BACK_URLS.GET_GRID_LAST_CHANGE_BY_ID}`;
        this.#init();
        this.presetData = null;
        this.gridRows = {};
        this.extraElements = {};
        this.batchElements = {};
        this.gridName = "";
        this.gridId = "";
        this.lastChange = null;
        this.updateIntervalId = null;
        // Extra elements
        this.extraElementsOpened = false;
        this.extraContainer = null;
    }

    #init() {
        this.element = document.createElement('div');
        this.element.className = 'grid-container';
        this.container.appendChild(this.element);
    }
    
    async #getData(url) {
        try {
            const response = await getRequest(url, false, true);
            if (!response.ok) {
                throw new Error(`Error while getting gridData ${response.statusText}. URL = ${url}`);
            }
            const presetData = await response.json();
            return presetData;
        } catch (error) {
            console.error(
                `There was a problem with getting gridData: ${error}`
            );
            throw error
        }
    }

    async updatePreset(presetName) {
        const url = `${this.getPresetURL}/${presetName}`;
        this.presetData = await this.#getData(url);
        this.presetName = presetName;
    }

    async buildGrid() {
        if (this.presetData === null) {
            return;
        }
        this.gridRows = {}
        this.element.innerHTML = "";
        const rowsOrder = this.presetData['rowsOrder'];
        for (let index = 0; index < rowsOrder.length; index += 1) {
            let rowId = rowsOrder[index];
            const rowElement = new CellsRow(this.element, true);
            this.gridRows[rowId] = rowElement;
            const rowData = this.presetData['rows'][rowId];
            rowElement.buildRow(rowData, true, rowId);
        }
        this.element.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        })
    }
    // +++ BATCH ELEMENTS
    async buildBatchesContainer() {
        // Container
        const batchElementsContainer = document.createElement('div');
        batchElementsContainer.classList.add('batch-elements-container');
        batchElementsContainer.id = 'batchElements';
        // Header
        const batchElementsHeader = document.createElement('div');
        batchElementsHeader.classList.add('extra-elements-header');
        batchElementsHeader.id = 'batchElementsHeader';
        batchElementsHeader.innerText = "Партии в приямке";
        batchElementsContainer.appendChild(batchElementsHeader);
        // Content
        const batchElementsContent = document.createElement('div');
        batchElementsContent.classList.add('extra-elements-content');
        batchElementsContent.id = 'batchElementsContent';
        batchElementsContainer.appendChild(batchElementsContent);
        // Open|Close action
        batchElementsHeader.addEventListener('click', () => {
            if (0 === Object.keys(this.batchesData).length) {
                flashMessage.show({
                    message: `В приямке не представлено ни одной партии`,
                    color: 'white',
                    backgroundColor: 'black',
                    position: 'top-center',
                    duration: 3000,
                })
            }
            if (this.batchElementsOpened) {
                batchElementsContent.style.maxHeight = '0px';
                const exist = document.querySelector('.batch-element-expanded-container');
                if (exist) {
                    exist.remove();
                }
                this.batchElementsOpened = false;
            } else {
                this.batchElementsOpened = true;
                batchElementsContent.style.maxHeight = '250px';
                
            }
        });
        this.batchElementsContainer.appendChild(batchElementsContainer);
        return batchElementsContent;
    }
    
    async buildBatchElements() {
        if (!this.batchesContainer) {
            this.batchesContainer = await this.buildBatchesContainer();
        }
        if (this.batchElements) {
            Object.values(this.batchElements).forEach((element) => {
                if (!this.batchesData[element.batchNumber]) {
                    element.element.remove();
                    delete this.batchElements[element.batchNumber];
                }
            })
        }
        for (let batchNumber in this.batchesData) {
            const batchData = this.batchesData[batchNumber];
            if (this.batchElements[batchNumber]) {
                this.batchElements[batchNumber].batchData = batchData;
                continue;
            }
            const batchElement = new BatchElement(this.batchesContainer, batchNumber, batchData)
            this.batchElements[batchNumber] = batchElement;
        }
    }
    // BATCH ELEMENTS ---

    // +++ EXTRA ELEMENTS
    async buildExtraContainer() {
        // Container
        const extraElementsContainer = document.createElement('div');
        extraElementsContainer.classList.add('extra-elements-container');
        extraElementsContainer.id = "extraElements";
        // Header
        const extraElementsHeader = document.createElement('div');
        extraElementsHeader.classList.add('extra-elements-header');
        extraElementsHeader.id = "extraElementsHeader";
        extraElementsHeader.innerText = "Дополнительные Краны";
        extraElementsContainer.appendChild(extraElementsHeader);
        // Content
        const extraElementsContent = document.createElement('div');
        extraElementsContent.classList.add('extra-elements-content');
        extraElementsContent.id = "extraElementsContent";
        extraElementsContainer.appendChild(extraElementsContent);
        // Open|Close Action
        extraElementsHeader.addEventListener('click', () => {
            if (this.extraElementsOpened) {
                extraElementsContent.style.maxHeight = '0px';
                const exist = document.querySelector('.extra-element-expanded-container');
                if (exist) {
                    exist.remove()
                }
                this.extraElementsOpened = false;
            } else {
                this.extraElementsOpened = true;
                extraElementsContent.style.maxHeight = '250px';
            }
        });
        this.extraElementsContainer.appendChild(extraElementsContainer);
        return extraElementsContent;
    }

    async buildExtraElements(extraElementsData) {
        // TODO: Check if EXTRA elements will ever change, then we need to remove them from `this.extraElements`.
        if (!this.extraContainer) {
            this.extraContainer = await this.buildExtraContainer();
        } 
        for (let elementName in extraElementsData) {
            const elementData = extraElementsData[elementName];
            if (this.extraElements[elementName]) {
                this.extraElements[elementName].elementData = elementData;
                continue;
            }
            const extraElement = new ExtraElement(this.extraContainer, elementName, elementData);
            this.extraElements[elementName] = extraElement;
        }
    }
    // EXTRA ELEMENTS ---

    async updateGridCells() {
        if (this.lastChange !== null) {
            const lastChangeUrl = `${this.getCellsLastChange}/${this.gridId}`;
            const lastChangeData = await this.#getData(lastChangeUrl);
            const newChangeTime = new Date(lastChangeData['lastChange']);
            if (this.lastChange >= newChangeTime) {
                return;
            }
        }
        this.batchesData = {}
        const cellDataUrl = `${this.getCellsDataURL}/${this.gridName}`;
        const gridData = await this.#getData(cellDataUrl);
        this.gridId = gridData['_id'];
        this.element.id = this.gridId;
        this.lastChange = new Date(gridData['lastChange']);
        if (this.presetData['_id'] !== gridData['preset']) {
            throw new Error(`Grid is using different preset = ${this.presetData['_id']}.
                             Trying to update with data for = ${platformData['preset']}`);
        }
        const rowsOrder = gridData['rowsOrder'];
        for (let rowIndex = 0; rowIndex < rowsOrder.length; rowIndex += 1) {
            const rowId = rowsOrder[rowIndex];
            const columns = this.gridRows[rowId].columns;
            const columnsOrder = gridData['rows'][rowId]['columnsOrder'];
            for (let colIndex = 0; colIndex < columnsOrder.length; colIndex += 1) {
                const colId = columnsOrder[colIndex];
                const cell = columns[colId];
                const cellData = gridData['rows'][rowId]['columns'][colId];
                cell.data = cellData;
                cell.gridCell = true;
                if (cellData['wheelStack'] !== null) {
                    await cell.updateElementData();
                    // BATCHES Collect
                    const curElementData = cell.elementData;
                    if (!this.batchesData[curElementData['batchNumber']]) {
                        this.batchesData[curElementData['batchNumber']] = {}
                    }
                    this.batchesData[curElementData['batchNumber']][curElementData['_id']] = cell;
                    // ---
                } else {
                    cell.elementData = null;
                }
                cell.updateCellState();
            }
        }
        const extraElements = Object.keys(gridData['extra']);
        if (0 === extraElements.length) {
            return;
        }
        this.buildExtraElements(gridData['extra']);
        this.buildBatchElements();
    }

    async startUpdating() {
        if (this.updateIntervalId !== null) {
            return;
        }
        this.updateIntervalId = setInterval(() => {
            this.updateGridCells();
        }, UPDATE_PERIODS.GRID
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