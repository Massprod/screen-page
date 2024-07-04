import SwitchButton from "../js/switchButtonElement.js";


export default class SwitchButtonManager{
    constructor(
        container,
        buttonName,
        assignedTable,
        tablesContainer,
    ) {
        this.container = container;
        this.buttonName = buttonName;
        this.assignedTable = assignedTable;
        this.assignedTablesContainer = tablesContainer;
        this.assignedButton = new SwitchButton(this.buttonName);
        this.container.appendChild(this.assignedButton.element);
        this.assignedButton.element.addEventListener('click', () => this.showAssignedTable());
    }

    showAssignedTable() {
        this.#activateAssignedTable();
        this.#activateAssignedButton();
    }

    #activateAssignedTable() {
        const allTables = this.assignedTablesContainer.childNodes;
        allTables.forEach(tableElement => {
            tableElement.classList.remove('table-visible');
            tableElement.classList.add('table-hidden');
        })
        this.assignedTable.showTable();
        this.assignedTable.updateTable();
    }

    #activateAssignedButton() {
        const allButtons = this.container.childNodes;
        allButtons.forEach(buttonElement => {
            buttonElement.classList.remove('active');
        })
        this.assignedButton.element.classList.add('active');
    }

}
