import { BACK_URLS } from "../../constants.js";


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
        this.elementData = {};
    }

    async #getElementData(url) {
        try {
            const response = await(fetch(url));
            if (!response.ok) {
                throw new Error(`Error while getting cellElementData ${response.statusText}. URL = ${url}`);
            }
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
            const response = await(fetch(url));
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
    }

    setAsWhitespace() {
        this.element.classList = [];
        this.element.classList.add("cell-whitespace");
        this.element.id = "whitespace";
    }
    
    setAsIdentifier(identifierString) {
        this.element.classList = [];
        this.element.classList.add("cell-identifier");
        const parag = document.createElement('p');
        parag.innerText = identifierString;
        this.element.innerHTML = "";
        this.element.appendChild(parag);
        this.element.id = "identifier";
    }

    setAsEmptyCell() {
        this.element.classList = [];
        this.element.classList.add("cell");
        this.element.classList.add("cell-empty");
        if (this.data['blockedBy'] !== null || this.data['blocked']) {
            this.element.classList.add("cell-empty-blocked")
        } else {
            this.element.classList.remove("cell-empty-blocked");
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
        const parag = document.createElement('p');
        parag.innerText = this.elementData['wheels'].length;
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
        if (!this.elementData['lastChange']) {
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
