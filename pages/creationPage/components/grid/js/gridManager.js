import WheelStackRowElement from "../../WheelStackRow/js/wheelStackRowElement.js";
import { BACK_URLS, CLASS_NAMES, SETTINGS } from "../../constants.js";



export default class GridManager {
    constructor(container) {
        this.container = container;
        this.element = document.createElement('div');
        this.element.className = CLASS_NAMES.GRID;
        this.allRows = {};
        this.getGridUrl = BACK_URLS.GET_GRID_URL;
        this.container.appendChild(this.element);
        this.init();
    }

    async init() {
        await this.#createGrid();
        await this.#testCreation();
        this.startUpdating();
    }
    //tempo
    async #testCreation() {
        // cringe, but it's too hard to rebuild on BACK, and it's w.e for now.
        var element = this.allRows['B'].allWheelstacks['0'];
        element.setAsWhiteSpace();
        element = this.allRows['A'].allWheelstacks['0'];
        element.setAsWhiteSpace();
        element = this.allRows['C'].allWheelstacks['0'];
        element.setAsWhiteSpace();
        for (let column = 1; column < 31; column += 1) {
            element = this.allRows['C'].allWheelstacks[column];
            element.setAsIdentifier(column);
        }
        element = this.allRows['C'].allWheelstacks[31];
        element.setAsIdentifier('31\\C');
        for (let column = 0; column < 32; column += 1) {
            element = this.allRows['tempo'].allWheelstacks[column];
            element.setAsWhiteSpace();
        }
        for (let column = 32; column < 59; column += 1) {
            element = this.allRows['tempo'].allWheelstacks[column];
            element.setAsIdentifier(column);
        }
        element = this.allRows['A'].allWheelstacks[31];
        element.setAsIdentifier('A');
        element = this.allRows['B'].allWheelstacks[31];
        element.setAsIdentifier('B');
    }
    // ---

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

    async #createRow(rowIdentifier, rowData, setRowIdentifier) {
        const newRow = new WheelStackRowElement(
            rowIdentifier,
            setRowIdentifier,
            rowData['columnsOrder'],
            rowData['columns'],
            this.element,
        )
        return newRow;
    }

    async #createGrid() {
        this.element.innerHTML = '';
        const data = await this.#fetchGrid(this.getGridUrl);
        //tempo
        const tempo = 'tempo';
        const tempoRowData = {tempo};
        const tempoColsOrder = [];
        for (let col = 1; col < 59; col += 1) {
            tempoColsOrder.push(String(col));
        }
        const tempoCols = {};
        for (const col of tempoColsOrder) {
            tempoCols[col] = {
                'wheelStack': null,
                'whiteSpace': false,
            }
        }
        tempoRowData[tempo] = {
            'columnsOrder': tempoColsOrder,
            'columns': tempoCols,
        }
        const tempoRow = await this.#createRow(tempo, tempoRowData[tempo], true);
        this.element.appendChild(tempoRow.element);
        this.allRows[tempo] = tempoRow;
        // ---
        for (const row of data['rowsOrder']) {
            const rowData = data['rows'][row];
            const newRow = await this.#createRow(row, rowData, true);
            this.element.appendChild(newRow.element);
            this.allRows[row] = newRow;
        }
    }


    async #updateRow(rowIdentifier, newRowData) {
        const wheelStackRowElement = this.allRows[rowIdentifier];
        wheelStackRowElement.updateRowData(newRowData);
    }


    async #updateGrid() {
        const data = await this.#fetchGrid(this.getGridUrl);
        // console.log(data);
        for (const row in data['rows']){
            const newRowData = data['rows'][row];
            await this.#updateRow(row, newRowData);
        }
    }

    async startUpdating() {
        setInterval(() => {
            this.#updateGrid();   
        }, SETTINGS.GRID_UPDATE_TIME)
    }

}