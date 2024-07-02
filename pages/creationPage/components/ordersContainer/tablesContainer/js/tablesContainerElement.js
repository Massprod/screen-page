

export default class TablesContainer{
    constructor(
        container,
        basePlatformManager,
        gridManager,
    ) {
        this.basePlatformManager = basePlatformManager;
        this.gridManager = gridManager;
        this.container = container;
        this.element = this.#createContainer();
        this.container.appendChild(this.element);
        this.switchButtonsContainer = this.#addSwitchButtonsContainer();
        this.element.appendChild(this.switchButtonsContainer);
        this.assignedTables = {};
    }

    #createContainer() {
        const tablesContainer = document.createElement('div');
        tablesContainer.className = 'tables-container';  
        return tablesContainer;
    }

    #addSwitchButtonsContainer() {
        const switchButtonsContainer = document.createElement('div');
        switchButtonsContainer.className = 'toggle-buttons-container';        
        return switchButtonsContainer;
    }
    

}
