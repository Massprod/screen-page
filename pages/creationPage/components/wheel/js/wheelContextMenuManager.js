import { TEMPO_CONSTS } from "../../constants.js";
import { BACK_URLS } from "../../constants.js";


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

        document.body.addEventListener('click', (event) => {
            if (!this.element.contains(event.target))
                this.hideWheel();
        })
    }


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
    

    addRow(rowName, rowContent, isFirst = false) {
        const row = document.createElement('div');
        row.className = 'wheel-details-row';
        if (isFirst) {
            row.textContent = rowContent;
            this.element.appendChild(row);
            return;
        }
        const textSpan = document.createElement('span');
        textSpan.textContent = rowName;
        const dataSpan = document.createElement('span');
        dataSpan.className = 'data'
        dataSpan.textContent = rowContent;
        row.appendChild(textSpan);
        row.appendChild(dataSpan);
        this.element.appendChild(row);
    }



    async populateRows(rowsData) {
        for (let row in rowsData) {
            this.addRow(row, rowsData[row]);
            // const newRow = document.createElement('div');
            // newRow.className = 'wheel-details-row';
            // newRow.innerHTML = rowsData[row];
            // this.element.appendChild(newRow);
        }
    }

    async clearRows() {
        this.element.innerHTML = '';
    }

    async showWheel(event, wheelId) {
        await this.clearRows();
        const testResp = await this.#fetchWheel(this.getWheelUrl, wheelId);
        const data = testResp['data'];
        await this.populateRows(data);
        this.element.style.display = 'block';
        this.updateMenuPosition(event);
    }

    async hideWheel() {
        this.element.style.display = 'none';
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