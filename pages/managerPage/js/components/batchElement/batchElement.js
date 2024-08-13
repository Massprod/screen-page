import { batchesContextMenu, cellsContextMenu } from "../../mainScript.js";
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
        parag.innerHTML = `<b>Партия</b> ${this.batchNumber}`;
        this.element.appendChild(parag);
        this.element.id = this.batchNumber;
        this.container.appendChild(this.element);
        this.element.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            batchesContextMenu.buildMenu(event, this.batchNumber);
        })
        this.element.addEventListener('click', (event) => {
            event.preventDefault();
            const exist = document.getElementById(`${this.batchNumber}WheelstacksContainer`);
            if (exist) {
                exist.remove();
                return;
            }
            this.showWheelstacks();
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
        wheelstackRow.id = lastWheelObjectId;
        if (wheelstackData['blocked']) {
            wheelstackRow.classList.add('wheelstack-row-element-blocked');
            wheelstackRow.id = wheelstackData['lastOrder'];
        }
        return wheelstackRow;
    }

    async showWheelstacks() {
        const exist = document.querySelector('.batch-element-expanded-container');
        if (exist) {
            exist.remove();
        }
        const wheelstacksContainer = document.createElement('div');
        wheelstacksContainer.classList.add('batch-element-expanded-container');
        wheelstacksContainer.id = `${this.batchNumber}WheelstacksContainer`;
        const coordinates = this.element.getBoundingClientRect();
        const leftTopCoordinate = coordinates.top;
        const rightTopCoordinate = coordinates.right + 3;
        wheelstacksContainer.style.top = `${leftTopCoordinate}px`;
        wheelstacksContainer.style.left = `${rightTopCoordinate}px`;
        wheelstacksContainer.style.display = 'block';
        Object.values(this.batchData).forEach(async (element) => {
            let wheelstackRow = await this.createWheelstackRow(element.elementData);
            wheelstackRow.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                cellsContextMenu.buildMenu(event, element);
            })
            wheelstacksContainer.appendChild(wheelstackRow);
        })
        document.body.appendChild(wheelstacksContainer);
    }

}