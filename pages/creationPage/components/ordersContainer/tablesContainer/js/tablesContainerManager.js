import OrdersTableManager from "../../ordersTable/js/ordersTableManager.js";
import SwitchButtonManager from "../../switchButtons/js/switchButtonManager.js";


export default class TablesContainerManager{
    constructor(
        container,
        basePlatformManager,
        gridManager,
    ) {
        this.basePlatformManager = basePlatformManager;
        this.gridManager = gridManager;
        this.container = container;
        // Change this preset and other elements to `element` classes.
        // So we could change their styles and assign to the manager.
        this.element = this.#createContainer();
        this.container.appendChild(this.element);
        this.switchButtonsContainer = this.#addSwitchButtonsContainer();
        this.switchButtonsContainer.className = 'switch-buttons-container';
        this.element.appendChild(this.switchButtonsContainer);
        this.tablesContainer = this.#addTablesContainer();
        this.element.appendChild(this.tablesContainer);
        // ---
        // {tableName: tableManager}
        this.assignedTables = {};
        // {tableName: buttonAssigned}
        this.assignedButtons = {};
        
    }

    #createContainer() {
        const tablesContainer = document.createElement('div');
        tablesContainer.className = 'all-tables-container';  
        return tablesContainer;
    }

    #addSwitchButtonsContainer() {
        const switchButtonsContainer = document.createElement('div');
        switchButtonsContainer.className = 'toggle-buttons-container';        
        return switchButtonsContainer;
    }

    #addTablesContainer() {
        const tablesContainer = document.createElement('div');
        tablesContainer.className = 'table-container';
        return tablesContainer
    }   
    
    
    addNewtable(tableName, headers) {
        const newTable = new OrdersTableManager(this.element, headers, tableName);
        this.tablesContainer.appendChild(newTable.element);
        this.assignedTables[tableName] = newTable;
    }

    deleteTable(tableName) {
        if (this.assignedTables[tableName]) {
            this.assignedTables[tableName].deleteTableData();
            return delete this.assignedTables[tableName];
        }
        return false;
    }

    addNewSwitchButton(tableName, buttonName) {
        if (!this.assignedTables[tableName]) {
            return null;
        }
        const newButton = new SwitchButtonManager(
            this.switchButtonsContainer,
            buttonName,
            this.assignedTables[tableName],
            this.tablesContainer,
        )
        this.assignedButtons[`${tableName}`] = newButton;
        return newButton;
    }

    async setTableUpdating(tableName, frequency, dataUrl ) {
        if (!this.assignedTables[tableName]) {
            return false;
        }
        const table = this.assignedTables[tableName];
        await table.setUpdating(frequency, dataUrl);
    }
}
