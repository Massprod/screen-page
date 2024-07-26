import Cell from "../cell/cell.js";


export default class CellsRow{
    constructor(
        container
    ) {
        this.container = container;
        this.#init();
        this.columns = {};
    }

    #init(){
        this.element = document.createElement("div");
        this.element.className = "cells-row";
        this.container.appendChild(this.element);
    }

    async buildRow(rowData, useIdentifiers = false, rowId) {
        this.columns = {};
        this.element.innerHTML = "";
        this.element.id = rowId;
        for (let colId of rowData['columnsOrder']) {
            const cellData = rowData['columns'][colId];
            if (!useIdentifiers && cellData['identifier']) {
                continue;
            }
            const cell = new Cell(this.element, rowId, colId);
            this.columns[colId] = cell;
            if (cellData['identifier']) {
                cell.setAsIdentifier(cellData['identifierString']);
            } else if (cellData['whitespace']) {
                cell.setAsWhitespace();
            }
        }
    }


}