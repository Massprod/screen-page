import WheelStackRowElement from "../../WheelStackRow/js/wheelStackRowElement.js";
import { CLASS_NAMES, SETTINGS } from "../../constants.js";
import { BACK_URLS } from "../../constants.js";


export default class BasePlatformManager {
    constructor(container) {
        // Container assignment + creation of the element.
        this.container = container;
        this.element = document.createElement('div');
        this.element.className = CLASS_NAMES.BASE_PLATFORM;
        // Rows data { rowIdentifier: WheelStackRowElement }
        this.allRows = {};
        // Requests URLS.
        this.getPlatformUrl = BACK_URLS.GET_BASE_PLATFORM_URL;
        this.#createPlatform();
        this.startUpdating();
        this.container.appendChild(this.element);
    }

    async #fetchPlatform(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            throw error; // Rethrow the error so it can be handled by the caller
        }
    }

    async #createRow(rowIdentifier, rowData) {
        const newRow = new WheelStackRowElement(
            rowIdentifier,
            rowData['columnsOrder'],
            rowData['columns'],
            this.element,
        )
        return newRow;
    }

    async #createPlatform() {
        this.element.innerHTML = '';
        const data = await this.#fetchPlatform(this.getPlatformUrl);
        for (const row in data['rows']){
            const rowData = data['rows'][row];
            const newRow = await this.#createRow(row, rowData);
            this.element.appendChild(newRow.element);
            this.allRows[row] = newRow;
        }
    }

    async #updateRow(rowIdentifier, newRowData) {
        const wheelStackRowElement = this.allRows[rowIdentifier]
        wheelStackRowElement.updateRowData(newRowData);
    }

    async #updatePlatform() {
        const data = await this.#fetchPlatform(this.getPlatformUrl);
        for (const row in data['rows']) {
            const newRowData = data['rows'][row] 
            await this.#updateRow(row, newRowData);
        }
    }

    startUpdating() {
        setInterval(() => {
            this.#updatePlatform();
        }, SETTINGS.BASE_PLATFORM_UPDATE_TIME)
    }
}