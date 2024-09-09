import { getRequest } from "../../../../utility/basicRequests.js";
import { BACK_URLS } from "../../constants.js";
import { 
    batchesContextMenu,
    ordersContextMenu,
    wheelstackContextMenu,
} from "../../mainScript.js";


export default class Cell{
    constructor(
        container,
        cellRowId,
        cellColId,
    ) {
        this.elementDataURL = BACK_URLS.GET_CELL_ELEMENT_DATA_BY_ID;
        this.elementLastChangeURL = BACK_URLS.GET_CELL_ELEMENT_LAST_CHANGE_BY_ID;
        this.container = container;
        this.cellRowId = cellRowId;
        this.cellColId = cellColId;
        this.#init();
        this.data = {};
        this.elementData = null;
        this.gridCell = false;
    }

    async #getElementData(url) {
        try {
            const response = await getRequest(url, true, true);
            const presetData = await response.json();
            return presetData;
        } catch (error) {
            console.error(
                `There was a problem with getting cellElementData: ${error}`
            );
            throw error
        }
    }

    async #getLastChange(url) {
        try {
            const response = await getRequest(url, false, true);
            if (!response.ok) {
                throw new Error(`Error while getting lastChange ${response.statusText}. URL = ${url}`);
            }
            const presetData = await response.json();
            return presetData;
        } catch (error) {
            console.error(
                `There was a problem with getting lastChange: ${error}`
            );
            throw error
        }
    }


    #init() {
        this.element = document.createElement("div");
        this.element.className = "cell";
        this.element.id = `${this.cellRowId}|${this.cellColId}`;
        this.container.appendChild(this.element);
        this.element.addEventListener('contextmenu', async event => {
            event.preventDefault();
            if (!this.elementData && this.data['blocked']) {
                ordersContextMenu.showMenu(this.data['blockedBy'], event);
                return;
            }
            if (!this.elementData) {
                return;
            }
            wheelstackContextMenu.showMenu(
                event, this.elementData['_id'], this.element
            );
        }
        )
    }

    setAsWhitespace() {
        this.element.classList = [];
        this.element.classList.add("cell-whitespace");
        this.element.classList.add("cell-grid");
        this.element.id = "whitespace";
    }
    
    setAsIdentifier(identifierString) {
        this.element.classList = [];
        this.element.classList.add("cell-identifier");
        this.element.classList.add("cell-grid");
        const parag = document.createElement('p');
        parag.innerText = identifierString;
        this.element.innerHTML = "";
        this.element.appendChild(parag);
        this.element.id = "identifier";
    }

    setAsEmptyCell() {
        this.element.classList = [];
        this.element.innerHTML = ""
        this.element.classList.add("cell");
        this.element.classList.add("cell-empty");
        if (this.gridCell) {
            this.element.classList.add('cell-grid');
        }
        if (this.data['blockedBy'] !== null || this.data['blocked']) {
            this.element.classList.add("cell-empty-blocked")
            this.element.classList.remove('cell-empty');
        } else {
            this.element.classList.remove("cell-empty-blocked");
        }
        if (this.orderMarked) {
            this.element.classList.add('highlight');
        }
    }

    setAsContainsElement() {
        this.element.classList = [];
        this.element.classList.add("cell");
        if (this.data['blockedBy'] !== null || this.data['blocked']) {
            this.element.classList.add("cell-blocked");
        } else {
            this.element.classList.remove("cell-blocked");
        }
        if (this.gridCell) {
            this.element.classList.add('cell-grid');
        }
        if (this.orderMarked) {
            this.element.classList.add('highlight');
        }
        if (batchesContextMenu.markingBatch && batchesContextMenu.markingBatch === this.elementData['batchNumber']) {
            this.element.classList.add('batch-mark');
        }
        if (this.markedChosen) {
            this.element.classList.add('mark-chosen');
        }
        const parag = document.createElement('p');
        parag.innerText = this.elementData['wheels'].length;
        parag.id = `${this.cellRowId}|${this.cellColId}`
        this.element.innerHTML = "";
        this.element.appendChild(parag);
    }

    updateCellState(){
        if (this.elementData === null) {
            this.setAsEmptyCell();
            return
        }
        this.setAsContainsElement();
    }

    async updateElementData() {
        const elementId = this.data['wheelStack'];
        const dataUrl = `${this.elementDataURL}/${elementId}`;
        let newData = null;
        if (this.elementData === null) {
            newData = await this.#getElementData(dataUrl);
        } else {
            const prevUpdateTime = this.elementData['lastChange'];
            const lastChangeUrl = `${this.elementLastChangeURL}/${elementId}`;
            const updateTimeData = await this.#getLastChange(lastChangeUrl);
            const newUpdateTime = new Date(updateTimeData['lastChange']);
            if (prevUpdateTime < newUpdateTime) {
                newData = await this.#getElementData(dataUrl);
            }
        }
        if (newData === null) {
            return;
        }
        newData['lastChange'] = new Date(newData['lastChange']);
        newData['createdAt'] = new Date(newData['createdAt']);
        this.elementData = newData;
    }
}
