import WheelStackElement from "../../WheelStack/js/WheelStackElement.js";
import { CLASS_NAMES } from "../../constants.js";
import WheelStackRowData from "./wheelStackRowData.js";


export default class WheelStackRowElement {
    constructor(
        rowIdentifier,
        columnsOrder,
        allColumns,
        container,
    ) {
        this.wheelStacksUrl = 'http://127.0.0.1:8000/wheelstacks/';
        // Element creation
        this.container = container;
        this.element = document.createElement('div');
        this.element.className = CLASS_NAMES.WHEEL_STACK_ROW;
        this.container.appendChild(this.element);
        // Populating
        this.wheelStackRowData = new WheelStackRowData(
            rowIdentifier,
            columnsOrder,
            allColumns,
        );
        this.#populate();
    }

    async #fetchWheelStackData(wheelStackId, url) {
        const wheelStackUrl = `${url}${wheelStackId}`; // Example URL, change as needed
        try {
            const response = await fetch(wheelStackUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const wheelStackData = await response.json();
            return wheelStackData;
        } catch (error) {
            console.error('Error fetching wheel stack data:', error);
            throw error;
        }
    }

    async #populate() {
        for (const column of this.wheelStackRowData.columnsOrder) {
            const wheelStack = this.wheelStackRowData.allColumns[column];
            if (wheelStack['whiteSpace'] === true) {
                continue;
            }
            if (wheelStack['wheelStack'] === null) {
                const emptyWheelStack = new WheelStackElement(
                    {'container': this.element});
                this.element.appendChild(emptyWheelStack.element);
                continue;
            }
            const wheelStackId = wheelStack['wheelStack'];
            const wheelStackReq = await this.#fetchWheelStackData(
                wheelStackId,
                this.wheelStacksUrl
            );
            const wheelStackData = wheelStackReq['data'];
            console.log(wheelStackData);
            const wheelStackElement = new WheelStackElement({
                'stackId': wheelStackData['_id'],
                'maxSize': wheelStackData['maxSize'],
                'placementRow': wheelStackData['rowPlacement'],
                'placementColumn': wheelStackData['colPlacement'],
                'wheels': wheelStackData['wheels'],
                'container': this.element,
            });
            this.element.appendChild(wheelStackElement.element);
        }
    }
}
