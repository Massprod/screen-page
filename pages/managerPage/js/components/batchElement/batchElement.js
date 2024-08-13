import { batchesContextMenu, cellsContextMenu, gridManager } from "../../mainScript.js";
import { BACK_URLS } from "../../constants.js";


export default class BatchElement{
    constructor(
        container,
        batchNumber,
        batchData,
    ) {
        this.container = container;
        this.batchNumber = batchNumber;
        this.batchData = batchData;
        this.#init()
    }

    async #init() {
        this.element = document.createElement('div');
        this.element.classList.add("extra-element-dropdown-row");
        const parag = document.createElement('p');
        parag.innerHTML = `${this.batchNumber}`;
        this.element.appendChild(parag);
        this.element.id = this.batchNumber;
        this.container.appendChild(this.element);
        this.element.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            batchesContextMenu.buildMenu(event, this.batchNumber);
        })
        this.element.addEventListener('click', async (event) => {
            event.preventDefault();
            if (gridManager.wheelstacksContainer && gridManager.wheelstacksContainer.id === this.batchNumber) {
                gridManager.wheelstacksContainer.remove()
                await this.stopUpdating();
                gridManager.wheelstacksContainer = null;
                return;
            }
            await this.showWheelstacks();
            await this.startUpdating();
        })
    }

    async createWheelstackRow(wheelstackData) {
        const allWheels = wheelstackData['wheels'];
        const lastWheelObjectId = allWheels[allWheels.length - 1]
        const wheelDataURL = `${BACK_URLS.GET_WHEEL_DATA_BY_OBJECT_ID}/${lastWheelObjectId}`;
        const lastWheelData = await cellsContextMenu.getWheelData(wheelDataURL);
        const wheelstackRow = document.createElement('div');
        wheelstackRow.classList.add('extra-element-expanded-row');
        const parag = document.createElement('p');
        parag.innerHTML = `В.К: ${lastWheelData['wheelId']}`;
        parag.id = lastWheelObjectId;
        wheelstackRow.appendChild(parag);
        wheelstackRow.id = wheelstackData['_id'];
        if (wheelstackData['blocked']) {
            wheelstackRow.classList.add('wheelstack-row-element-blocked');
            parag.id = wheelstackData['lastOrder'];
        }
        return wheelstackRow;
    }

    async showWheelstacks() {
        if (gridManager.wheelstacksContainer) {
            gridManager.wheelstacksContainer.remove();
        }
        gridManager.wheelstacksContainer = document.createElement('div');
        gridManager.wheelstacksContainer.classList.add('batch-element-expanded-container');
        gridManager.wheelstacksContainer.id = `${this.batchNumber}`;
        const coordinates = this.element.getBoundingClientRect();
        const leftTopCoordinate = coordinates.top;
        const rightTopCoordinate = coordinates.right + 5;
        gridManager.wheelstacksContainer.style.top = `${leftTopCoordinate}px`;
        gridManager.wheelstacksContainer.style.left = `${rightTopCoordinate}px`;
        gridManager.wheelstacksContainer.style.display = 'block';
        Object.values(this.batchData).forEach(async (element) => {
            let wheelstackRow = await this.createWheelstackRow(element.elementData);
            wheelstackRow.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                cellsContextMenu.buildMenu(event, element);
            })
            wheelstackRow.addEventListener('click', async (event) => {
                if (gridManager.markChosen) {
                    clearInterval(gridManager.markChosen);
                    gridManager.markChosen = null;
                    gridManager.markChosenElement.element.classList.remove('mark-chosen');
                    gridManager.markChosenElement.markChosen = false;
                    gridManager.markChosenWheelstackRow.classList.remove('mark-chosen');
                    if (gridManager.markChosenWheelstackRow === wheelstackRow) {
                        gridManager.markChosenWheelstackRow = null;
                        return;
                    }
                }
                gridManager.markChosenElement = element;
                gridManager.markChosenWheelstackRow = wheelstackRow;
                gridManager.markChosenElement.element.classList.add('mark-chosen');
                gridManager.markChosenElement.markChosen = true;
                gridManager.markChosenWheelstackRow.classList.add('mark-chosen');
                gridManager.markChosen = setTimeout( () => {
                    gridManager.markChosenElement.element.classList.remove('mark-chosen');
                    gridManager.markChosenElement.markChosen = false;
                    gridManager.markChosenWheelstackRow.classList.remove('mark-chosen');
                    gridManager.markChosen = null;
                    gridManager.markChosenWheelstackRow = null;
                }, 10000);
            })
            gridManager.wheelstacksContainer.appendChild(wheelstackRow);
        })
        document.body.appendChild(gridManager.wheelstacksContainer);
    }

    async updateWheelstack(wheelstackElement, wheelstackData) {
        if (wheelstackData['blocked']) {
            wheelstackElement.classList.add('wheelstack-row-element-blocked');
        } else {
            wheelstackElement.classList.remove('wheelstack-row-element-blocked');
        }
        wheelstackElement.id = wheelstackData['_id'];
    }

    async updateWheelstacks() {
        if (gridManager.wheelstacksContainer.id !== this.batchNumber) {
            this.stopUpdating();
            return;
        }
        Object.values(this.batchData).forEach( async (element) => {
            const wheelstackObjectId = element.elementData['_id'];
            const wheelstackElement = gridManager.wheelstacksContainer.querySelector(`#${CSS.escape(wheelstackObjectId)}`)
            if (wheelstackElement) {
                await this.updateWheelstack(wheelstackElement, element.elementData);
                return;
            }
            let wheelstackRow = await this.createWheelstackRow(element.elementData);
            wheelstackRow.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                cellsContextMenu.buildMenu(event, element);
            })
            gridManager.wheelstacksContainer.appendChild(wheelstackRow);
        })
        gridManager.wheelstacksContainer.childNodes.forEach( (element) => {
            if (!this.batchData[element.id]) {
                element.remove();
            }
        })
    }


    async startUpdating() {
        if (this.updatingInterval) {
            return;
        }
        this.updatingInterval = setInterval( async () => {
            await this.updateWheelstacks();
        }, 100
        )
    }

    async stopUpdating() {
        if (!this.updatingInterval) {
            return;
        }
        clearInterval(this.updatingInterval);
        this.updatingInterval = null;
    }

}