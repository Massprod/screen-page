import WheelStackRowElement from "../../WheelStackRow/js/wheelStackRowElement.js";
import { BACK_URLS, CLASS_NAMES } from "../../constants.js";



export default class GridManager {
    constructor(container) {
        this.container = container;
        this.element = document.createElement('div');
        this.element.className = CLASS_NAMES.GRID;
        this.allRows = {};
        this.getGridUrl = BACK_URLS.GET_GRID_URL;
        this.#createGrid();
        this.container.appendChild(this.element);
    }


    async #fetchGrid(url) {
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

    async #createGrid() {
        this.element.innerHTML = '';
        const data = await this.#fetchGrid(this.getGridUrl);
        for (const row of data['rowsOrder']) {
            const rowData = data['rows'][row];
            const newRow = await this.#createRow(row, rowData);
            this.element.appendChild(newRow.element);
            this.allRows[row] = newRow;
        }
    }

}