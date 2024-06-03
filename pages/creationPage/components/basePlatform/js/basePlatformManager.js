import WheelStackRowElement from "../../WheelStackRow/js/wheelStackRowElement.js";
import { CLASS_NAMES } from "../../constants.js";


export default class BasePlatformManager {
    constructor(container) {
        this.container = container;
        this.element = document.createElement('div');
        this.element.className = CLASS_NAMES.BASE_PLATFORM;
        this.container.appendChild(this.element);
        this.req_url = 'http://127.0.0.1:8000/platform/';
        // this.startUpdating();
        this.#update_platform();
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
        this.element.appendChild(newRow.element);
    }

    async #update_platform() {
        // Better to update, than recreate. Temporary.
        this.element.innerHTML = '';
        const data = await this.#fetchPlatform(this.req_url);
        for (const row in data['rows']) {
            const rowData = data['rows'][row] 
            await this.#createRow(row, rowData);
        }
    }

    startUpdating() {
        setInterval(() => {
            this.#update_platform();
        }, 500)  // 0.5s
    }
}