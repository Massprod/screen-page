import PlacementCell from "./placementCell.js";


export default class PlacementRow {
    constructor(
        placementType,
    ) {
        this.placementType = placementType;
        this.columns = null;
        this.#init();
    }

    #init() {
        this.element = document.createElement('div');
        this.element.classList.add('placement-cells-row');
        if ('grid' === this.placementType) {
            this.element.classList.add('grid-row');
        } else if ('basePlatform' === this.placementType) {
            this.element.classList.add('baseplatform-row');
        }
    }

    async buildRow(rowData, useIdentifiers = false, rowId) {
        this.columns = {};
        this.element.innerHTML = '';
        this.element.id = rowId;
        for (let colId of rowData['columnsOrder']) {
            const cellData = rowData['columns'][colId];
            if (!useIdentifiers && cellData['identifier']) {
                continue;
            }
            const cell = new PlacementCell(
                rowId, colId, this.placementType
            );
            this.element.appendChild(cell.element);
            this.columns[colId] = cell;
            if (cellData['identifier']) {
                cell.setAsIdentifier(cellData['identifierString']);
            } else if (cellData['whitespace']) {
                cell.setAsWhitespace();
            }
        }
    }
}
