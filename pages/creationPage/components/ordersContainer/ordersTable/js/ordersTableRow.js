import { ORDER_MOVE_TYPES_TRANSLATION } from "../../../constants.js";
import { formatDate } from "../../../utils.js";
import { gridManager, platformManager } from "../../../../js/mainScript.js";
 

export default class OrdersTableRow{
    constructor(table) {
        this.table = table;
        this.tableHeaders = this.table.headers;
        this.rowData = {};
        this.element = document.createElement('tr');
        this.element.className = 'tr';
        this.orderStarted = false;
        this.element.addEventListener('click', event => this.markSelected(event));

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

    // clickMarking
    markSelected(event) {
        let targets = null;
        if (this.element.classList.contains('selected')) {
            this.table.markedRow = null;
            this.element.classList.remove('selected')
            this.unmarkTargets(this.getWheelstackTargets());
        } else {
            if (null !== this.table.markedRow ) {
                const markedRow = this.table.markedRow;
                markedRow.element.classList.remove('selected');
                this.unmarkTargets(markedRow.getWheelstackTargets());
            }
            this.table.markedRow = this;
            this.element.classList.add('selected');
            this.markTargets(this.getWheelstackTargets());
        }
    }

    getWheelstackTargets() {
        // SOURCE
        const sourceType = this.rowData['source']['type'];
        const [sourceRow, sourceCol ] = this.rowData['source']['identifier'].split(',');
        let sourceWheelstackElement = null;
        if ('grid' === sourceType) {
            sourceWheelstackElement = this.getWheelStackElement(gridManager, sourceRow, sourceCol)
        } else {
            sourceWheelstackElement = this.getWheelStackElement(platformManager, sourceRow, sourceCol)
        }
        // DESTINATION
        const destinationType = this.rowData['destination']['type'];
        const [ destinationRow, destinationCol ] = this.rowData['destination']['identifier'].split(',');
        let destinationWheelstackElement = null
        if ('grid' === sourceType) {
            destinationWheelstackElement = this.getWheelStackElement(gridManager, destinationRow, destinationCol)
        } else {
            destinationWheelstackElement = this.getWheelStackElement(platformManager, destinationRow, destinationCol)
        }
        return [sourceWheelstackElement, destinationWheelstackElement];
    }

    getWheelStackElement(manager, row, col) {
        return manager.allRows[row].allWheelstacks[col].element;
    }

    markTargets(targets) {
        targets.forEach(target => {
            target.classList.add('wheel-stack-marked');
        })
    }

    unmarkTargets(targets) {
        targets.forEach(target => {
            target.classList.remove('wheel-stack-marked')
        })
    }
    // ---
}