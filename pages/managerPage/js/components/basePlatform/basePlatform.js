import { CLASS_NAMES } from "../../constants.js"
import { BACK_URLS } from "../../constants.js";
import CellsRow from "../cellsRow/cellsRow.js";

export default class BasePlatformManager{
    constructor(
        container
    ) {
        this.presetName = "";
        this.container = container;
        this.getPresetURL = `${BACK_URLS.GET_PRESET_BY_NAME}`;
        this.getCellsDataURL = `${BACK_URLS.GET_PLATFORM_CELLS_DATA_BY_NAME}`;
        this.#init();
        this.presetData = null;
        this.platformRows = {};
        this.extraElements = {};
        this.platformName = "";
        this.lastChange = null;
    }

    #init(){
        this.element = document.createElement('div');
        this.element.className = CLASS_NAMES.BASE_PLATFORM;
        this.container.appendChild(this.element);
    }

    async #getData(url) {
        try {
            const response = await(fetch(url));
            if (!response.ok) {
                throw new Error(`Error while getting platformData ${response.statusText}. URL = ${url}`);
            }
            const presetData = await response.json();
            return presetData;
        } catch (error) {
            console.error(
                `There was a problem with getting platformData: ${error}`
            );
            throw error
        }
    }

    async updatePreset(presetName){
        const url = `${this.getPresetURL}/${presetName}`
        this.presetData = await this.#getData(url);
        this.presetName = presetName;
    }

    async buildPlatform(){
        if (this.presetData === null) {
            return false
        }
        this.platformRows = {};
        this.extraElements = {};
        this.element.innerHTML = "";
        const rowsOrder = this.presetData['rowsOrder'];
        // Start from 1, because we're skipping identifiers in platform,
        // And first row is always only identifiers.
        for (let index = 1; index < rowsOrder.length; index += 1) {
            var rowId = rowsOrder[index];
            const rowElement = new CellsRow(this.element);
            this.platformRows[rowId] = rowElement;
            const rowData = this.presetData['rows'][rowId];
            rowElement.buildRow(rowData);
        }
    }

    async updatePlatformCells(){
        // TODO: We need to add CHOOSE options for a PLATFORM_IDs.
        //  Because we need to be able to have more than 1 platform and we need to choose them.
        //  But it won't interfere with the main goal, so it's all later.
        const url = `${this.getCellsDataURL}/${this.platformName}`
        const platformData = await this.#getData(url);
        if (this.presetData['_id'] !== platformData['preset'])
            throw new Error(`Platform is using different preset = ${this.presetData['_id']}.
                             Trying to update with data for = ${platformData['preset']}`);
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
            }
        }
    }



}
