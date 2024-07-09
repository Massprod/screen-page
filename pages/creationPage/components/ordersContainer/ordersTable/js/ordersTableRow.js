import { ORDER_MOVE_TYPES_TRANSLATION } from "../../../constants.js";
import { formatDate } from "../../../../../utility/utils.js";
import { gridManager, platformManager } from "../../../../js/mainScript.js";
import ordersTableContextMenu from "../../contextMenu/js/ordersTableContextMenu.js"; 


export default class OrdersTableRow{
    constructor(table) {
        this.table = table;
        this.tableHeaders = this.table.headers;
        this.rowData = {};
        this.element = document.createElement('tr');
        this.element.className = 'tr';
        this.orderStarted = false;
        this.element.addEventListener('click', event => this.markSelected(event));
        this.element.addEventListener('contextmenu', event => this.#showContextMenu(event));
        this.assignedContextMenu = null;
    }


    // tempo contextMenu
    #showContextMenu(event) {
        event.preventDefault();
        const alrOpened = document.querySelectorAll('.order-context-menu');
        alrOpened.forEach((element) => {
            element.remove();
        })
        const contextMenu = new ordersTableContextMenu(this);
        contextMenu.show(event);
        this.assignedContextMenu = contextMenu;
    }
    
    closeContextMenus() {
        this.assignedContextMenu.forceClose()
        // console.log(this.assignedContextMenu);
        // console.log(this.table.markedRow);
        if (this.assignedContextMenu.assignedRow === this.table.markedRow) {
            const markedRow = this.table.markedRow;
            markedRow.element.classList.remove('selected');
            this.unmarkTargets(markedRow.getWheelstackTargets());
        }
    }


    // ---

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
        if ('active' === this.table.tableName ) {
            let targets = this.getWheelstackTargets();
            if (null != targets[0] && null != targets[1]) {
                this.markWithClass(targets[0], 'wheel-stack-order-block');
                this.markWithClass(targets[1], 'wheel-stack-cell-order-block');
            }
        };
        return this.element;
    }


    markWithClass(wheelStack, markClass) {
        try {
            wheelStack.element.classList.add(markClass);
        } catch (error) {
            console.log('change everything if needed');
            console.log(wheelStackElement);
        }
        
    }


    unmarkBlocked() {
        let targets = this.getWheelstackTargets();
        if (null != targets[0] && null != targets[1]) {
            targets[0].element.classList.remove('wheel-stack-order-block');
            targets[1].element.classList.remove('wheel-stack-cell-order-block');
        }
    }


    // clickMarking
    markSelected(event) {
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
        let sourceWheelstack = null;
        if ('grid' === sourceType) {
            sourceWheelstack = this.getWheelStack(gridManager, sourceRow, sourceCol)
        } else {
            sourceWheelstack = this.getWheelStack(platformManager, sourceRow, sourceCol)
        }
        // DESTINATION
        const destinationType = this.rowData['destination']['type'];
        const [ destinationRow, destinationCol ] = this.rowData['destination']['identifier'].split(',');
        let destinationWheelstack = null
        if ('grid' === destinationType) {
            destinationWheelstack = this.getWheelStack(gridManager, destinationRow, destinationCol)
        } else {
            destinationWheelstack = this.getWheelStack(platformManager, destinationRow, destinationCol)
        }
        return [sourceWheelstack, destinationWheelstack];
    }

    getWheelStack(manager, row, col) {
        try {
            return manager.allRows[row].allWheelstacks[col];
        } catch (error) {
            return null;
        }    
    }

    markTargets(targets) {
        targets.forEach(target => {
            target.element.classList.add('wheel-stack-marked');
        })
    }

    unmarkTargets(targets) {
        targets.forEach(target => {
            target.element.classList.remove('wheel-stack-marked')
        })
    }
    // ---
}