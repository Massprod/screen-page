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

    async buildRow(rowData, useIdentifiers = false) {
        this.columns = {};
        this.element.innerHTML = "";
        for (let colId of rowData['columnsOrder']) {
            const cellData = rowData['columns'][colId];
            if (!useIdentifiers && cellData['identifier']) {
                continue;
            }
            const cell = new Cell(this.element);
            this.columns[colId] = cell;
            if (cellData['identifier']) {
                cell.setAsIdentifier(cellData['identifierString']);
            } else if (cellData['whitespace']) {
                cell.setAsWhitespace();
            }
        }
    }


}