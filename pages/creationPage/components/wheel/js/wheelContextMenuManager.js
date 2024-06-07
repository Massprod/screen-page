import { TEMPO_CONSTS } from "../../constants.js";
import { BACK_URLS } from "../../constants.js";
import convertISOToCustomFormat from "../../.././../utility/convertToIso.js"


export default class WheelContextMenuManager{
    constructor(
        elementClass = TEMPO_CONSTS.WHEEL_CONTEXT_MENU_CLASS, 
    ) {
        this.getWheelUrl = BACK_URLS.GET_WHEEL_DATA_URL;
        this.element = document.createElement('div');
        this.element.className = elementClass;
        document.body.appendChild(this.element);
        const row = document.createElement('div');
        this.element.appendChild(row);

        this.firstCallId = null;
        this.assignedWheelElement = null;
        this.intervalId = null;

        document.body.addEventListener('click', (event) => {
            if (!this.element.contains(event.target))
                this.hideWheel();
        })
    }


    // tempo update

    #checkWheelChange() {
        // console.log('FirstCall', this.firstCallId);
        // console.log('ElementId', this.assignedWheelElement.wheelId);
        if (this.firstCallId !== this.assignedWheelElement.wheelId) {
            this.stopUpdating();
            this.hideWheel();
        }
    }

    startUpdating() {
        if (this.intervalId !== null) {
            return;
        }
        this.intervalId = setInterval(() => {
            this.#checkWheelChange();
        }, 100)
    }

    stopUpdating() {
        if (this.intervalId === null) {
            return;
        }
        clearInterval(this.intervalId);
        this.intervalId = null;
    }
    // ----

    async #fetchWheel(url, wheelId) {
        try {
            const response = await fetch(`${url}${wheelId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            throw error; // Rethrow the error so it can be handled by the caller
        }
    }
    

    addRow(_rowName, _rowContent, isFirst = false) {
        const row = document.createElement('div');
        if (isFirst) {
            row.className = 'wheel-details-row-header'
            row.textContent = _rowContent;
            this.element.appendChild(row);
            return;
        }
        row.className = 'wheel-details-row'
        const rowName = document.createElement('div');
        rowName.className = 'wheel-details-row-name';
        rowName.textContent = _rowName;
        row.appendChild(rowName);
        const rowData = document.createElement('div');
        rowData.className = 'wheel-details-row-data';
        rowData.textContent = _rowContent;
        row.appendChild(rowData);
        this.element.appendChild(row);
    }



    async populateRows(rowsData) {
        const wheelId = rowsData['wheelId'];
        this.addRow('', wheelId, true); 
        const batchNumber = rowsData['batchNumber'];
        this.addRow('Партия', batchNumber);
        const diameter = rowsData['wheelDiameter'] + 'mm';
        this.addRow('Диаметр', diameter);
        const receiptDate = Date(rowsData['receiptDate']);
        this.addRow('Получено', convertISOToCustomFormat(receiptDate));
        const status = rowsData['status'];
        this.addRow('Статус', status);
    }

    async clearRows() {
        this.element.innerHTML = '';
    }

    async showWheel(event, wheelElement) {
        if (wheelElement.wheelId === null) {
            return;
        }
        this.assignedWheelElement = wheelElement;
        this.firstCallId = this.assignedWheelElement.wheelId;
        await this.clearRows();
        const testResp = await this.#fetchWheel(this.getWheelUrl, this.firstCallId);
        const data = testResp['data'];
        await this.populateRows(data);
        this.element.style.display = 'block';
        this.updateMenuPosition(event);
        this.startUpdating();
    }

    async hideWheel() {
        await this.clearRows()
        this.element.style.display = 'none';
        this.stopUpdating();
        
    }



    updateMenuPosition(event) {
        if (this.element.style.display === 'block') {
          const { clientX: mouseX, clientY: mouseY } = event;
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const menuWidth = this.element.offsetWidth;
          const menuHeight = this.element.offsetHeight;
    
          let positionX = mouseX + 10; // Default position
          let positionY = mouseY + 10; // Default position
    
          // Adjust position if the context menu goes out of the viewport
          if (positionX + menuWidth > viewportWidth) {
            positionX = mouseX - menuWidth - 10;
          }
          if (positionY + menuHeight > viewportHeight) {
            positionY = mouseY - menuHeight - 10;
          }
    
          this.element.style.top = `${positionY}px`;
          this.element.style.left = `${positionX}px`;
        }
      }
}