import { ORDER_MOVE_TYPES_TRANSLATION } from "../../../constants.js";
import { formatDate } from "../../../utils.js";


export default class OrdersTableRow{
    constructor(headers) {
        this.tableHeaders = headers;
        this.rowData = {};
        this.element = document.createElement('tr');
        this.element.className = 'tr';
        this.orderStarted = false;
    }

    

    #activeTableFilter(column, columnData) {
        if ('source' === column || 'destination' == column) {
            const identifier = columnData['identifier'];
            const rowCol = identifier.split(',');
            const corString = `Колонна: <b>${rowCol[0]}</b> <b>|</b> Ряд: <b>${rowCol[1]}</b>`;
            return corString;
        } else if ('createdAt' === column) {
            return formatDate(columnData);
        } else if ('orderType' === column) {
            return ORDER_MOVE_TYPES_TRANSLATION[columnData];
        } else {
            return columnData;
        }
        return 'N/A';
    }

    #completedTableFilter(column, columnData) {
        if ('source' === column || 'destination' === column) {
            const identifier = columnData['identifier'];
            const rowCol = identifier.split(',');
            const corString = `Колонна: <b>${rowCol[0]}</b> <b>|</b> Ряд: <b>${rowCol[1]}</b>`;
            return corString;
        } else if ('createdAt' === column) {
            return formatDate(columnData);
        } else if ('orderType' === column) {
            return ORDER_MOVE_TYPES_TRANSLATION[columnData];
        } else if ('completedAt' === column) {
            return formatDate(columnData);
        } else {
            return columnData;
        }
        return 'N/A'
    }

    #canceledTableFiler(column, columnData) {
        if ('source' === column || 'destination' === column) {
            const identifier = columnData['identifier'];
            const rowCol = identifier.split(',');
            const corString = `Колонна: <b>${rowCol[0]}</b> <b>|</b> Ряд: <b>${rowCol[1]}</b>`;
            return corString;
        } else if ('createdAt' === column) {
            return formatDate(columnData);
        } else if ('orderType' === column) {
            return ORDER_MOVE_TYPES_TRANSLATION[columnData];
        } else if ('completedAt' === column) {
            return formatDate(columnData);
        } else if ('canceledAt' === column) {
            return formatDate(columnData);
        } else {
            return columnData;
        }
        return 'N/A'
    }

    populateRow(rowData, tableName) {
        if ('inProgress' === rowData['status']) {
            this.element.classList.add('in-progress');
        } else {
            this.element.classList.remove('in-progress');
        }

        this.rowData = rowData;
        this.element.innerHTML = '';
        this.assignedTableName = tableName;
        for (const column of Object.keys(this.tableHeaders)) {
            const columnData = rowData[column];
            const cell = document.createElement('td');
            cell.className = this.tableHeaders[column]['cellStyle'];
            if ('active' === this.assignedTableName) {
                cell.innerHTML = this.#activeTableFilter(column, columnData);
            }
            if ('completed' === this.assignedTableName) {
                cell.innerHTML = this.#completedTableFilter(column, columnData);
            }
            if ('canceled' === this.assignedTableName) {
                cell.innerHTML = this.#canceledTableFiler(column, columnData);
            }
            this.element.appendChild(cell);
        }
        return this.element;
    }
}