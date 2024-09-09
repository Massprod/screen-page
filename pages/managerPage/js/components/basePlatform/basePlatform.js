import { BACK_URLS, UPDATE_PERIODS } from "../../constants.js"
import CellsRow from "../cellsRow/cellsRow.js";
import { getRequest } from "../../../../utility/basicRequests.js"; 


export default class BasePlatformManager{
    constructor(
        container
    ) {
        this.container = container;
        this.getPresetURL = `${BACK_URLS.GET_PRESET_BY_NAME}`;
        this.getCellsDataURL = `${BACK_URLS.GET_PLATFORM_CELLS_DATA_BY_NAME}`;
        this.getCellsLastChange = `${BACK_URLS.GET_PLATFORM_LAST_CHANGE_BY_ID}`;
        this.#init();
        this.presetData = null;
        this.platformRows = {};
        this.platformName = "";
        this.platformId = "";
        this.lastChange = null;
        this.updateIntervalId = null;
    }

    #init(){
        this.element = document.createElement('div');
        this.element.className = "base-platform";
        this.container.appendChild(this.element);
    }

    // async #getData(url) {
    //     try {
    //         const response = await(fetch(url));
    //         if (!response.ok) {
    //             throw new Error(`Error while getting platformData ${response.statusText}. URL = ${url}`);
    //         }
    //         const presetData = await response.json();
    //         return presetData;
    //     } catch (error) {
    //         console.error(
    //             `There was a problem with getting platformData: ${error}`
    //         );
    //         throw error
    //     }
    // }

    async updatePreset(presetName) {
        const url = `${this.getPresetURL}/${presetName}`;
        const response = await getRequest(url, true, true);
        this.presetData = await response.json();
        this.presetName = presetName;
    }

    async buildPlatform() {
        if (this.presetData === null) {
            return;
        }
        this.platformRows = {};
        this.element.innerHTML = "";
        const rowsOrder = this.presetData['rowsOrder'];
        // Start from 1, because we're skipping identifiers in platform,
        // And first row is always only identifiers.
        for (let index = 1; index < rowsOrder.length; index += 1) {
            let rowId = rowsOrder[index];
            const rowElement = new CellsRow(this.element);
            this.platformRows[rowId] = rowElement;
            const rowData = this.presetData['rows'][rowId];
            rowElement.buildRow(rowData, false, rowId);
        }
        this.element.addEventListener("context-menu", (event) => {
            event.preventDefault();
        })
    }

    async updatePlatformCells() {
        if (this.lastChange !== null) {
            const lastChangeUrl = `${this.getCellsLastChange}/${this.platformId}`;
            const lastChangeData = await getRequest(lastChangeUrl, true, true);
            const newChangeTime = new Date(lastChangeData['lastChange']);
            // console.log(`OLD_TIME: ${this.lastChange}`);
            // console.log(`NEW_TIME: ${newChangeTime}`);
            if (this.lastChange >= newChangeTime) {
                return;
            }
        }
        // console.log("UPDATING STARTED");
        // TODO: We need to add CHOOSE options for a PLATFORM_IDs.
        //  Because we need to be able to have more than 1 platform and we need to choose them.
        //  But it won't interfere with the main goal, so it's all later.
        const cellDataUrl = `${this.getCellsDataURL}/${this.platformName}`;
        const response = await getRequest(cellDataUrl, true, true);
        const platformData = await response.json();
        this.platformId = platformData['_id'];
        this.element.id = this.platformId;
        this.lastChange = new Date(platformData['lastChange']);
        if (this.presetData['_id'] !== platformData['preset']) {
            throw new Error(`Platform is using different preset = ${this.presetData['_id']}.
                             Trying to update with data for = ${platformData['preset']}`);
        }
        const rowsOrder = platformData['rowsOrder'];
        for (let rowIndex = 0; rowIndex < rowsOrder.length; rowIndex += 1) {
            const rowId = rowsOrder[rowIndex];
            const columns = this.platformRows[rowId].columns;
            const columnsOrder = platformData['rows'][rowId]['columnsOrder'];
            for (let colIndex = 0; colIndex < columnsOrder.length; colIndex += 1) {
                const colId = columnsOrder[colIndex]; 
                const cell = columns[colId];
                const cellData = platformData['rows'][rowId]['columns'][colId];
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
            this.updatePlatformCells();
        }, UPDATE_PERIODS.BASE_PLATFORM
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
