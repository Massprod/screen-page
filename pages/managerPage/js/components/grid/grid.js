import { BACK_URLS, UPDATE_PERIODS } from "../../constants.js";
import CellsRow from "../cellsRow/cellsRow.js";

// TODO: Merge GridManager AND BasePlatformManager
//  They're basically doing the same, I was expecting them to build differently, because extra elements.
//  But we can just exclude extra elements creation, and everything else is going to be the same.
//  We can just have one class for it. For now leaing it like this, because MAYBE they will differ.

export default class GridManager{
    constructor(
        container
    ) {
        this.container = container;
        this.getPresetURL = `${BACK_URLS.GET_PRESET_BY_NAME}`;
        this.getCellsDataURL = `${BACK_URLS.GET_GRID_CELLS_DATA_BY_NAME}`;
        this.getCellsLastChange = `${BACK_URLS.GET_GRID_LAST_CHANGE_BY_ID}`;
        this.#init();
        this.presetData = null;
        this.gridRows = {};
        this.extraElements = {};
        this.gridName = "";
        this.gridId = "";
        this.lastChange = null;
        this.updateIntervalId = null;
    }

    #init() {
        this.element = document.createElement('div');
        this.element.className = 'grid-container';
        this.container.appendChild(this.element);
    }
    
    async #getData(url) {
        try {
            const response = await(fetch(url));
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
            const rowElement = new CellsRow(this.element);
            this.gridRows[rowId] = rowElement;
            const rowData = this.presetData['rows'][rowId];
            rowElement.buildRow(rowData, true, rowId);
        }
    }



    async updateGridCells() {
        if (this.lastChange !== null) {
            const lastChangeUrl = `${this.getCellsLastChange}/${this.gridId}`;
            const lastChangeData = await this.#getData(lastChangeUrl);
            const newChangeTime = new Date(lastChangeData['lastChange']);
            if (this.lastChange >= newChangeTime) {
                return;
            }
        }
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
                if (cellData['wheelStack'] !== null) {
                    await cell.updateElementData();
                } else {
                    cell.elementData = null;
                }
                cell.updateCellState();
            }
        }
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