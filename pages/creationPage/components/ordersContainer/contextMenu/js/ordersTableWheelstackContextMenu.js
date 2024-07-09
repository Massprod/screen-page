import { BACK_GRID_TYPE_TRANSLATIONS } from "../../../constants.js";
import { gridManager, platformManager } from "../../../../js/mainScript.js";

export default class OrderTableWheelstackContextMenu{
    constructor(assignedRowMenu) {
        this.assignedRowMenu = assignedRowMenu;
        this.element = document.createElement('div');
        this.element.classList.add('order-context-menu');
        // SOURCE
        // sourceHeaderName
        const sourceHeaderName = document.createElement('div');
        sourceHeaderName.classList.add('order-context-menu-standard-row');
        const sourceRowText = document.createElement('p');
        sourceRowText.classList.add('order-context-menu-data-paragraph');
        sourceRowText.innerHTML = '<b>Изначальная позиция стопки</b>';
        sourceHeaderName.appendChild(sourceRowText);
        this.element.appendChild(sourceHeaderName);
        // ---
        // sourceHeader
        const sourceHeaderRow = document.createElement('div');
        sourceHeaderRow.classList.add('order-context-menu-standard-row-header');
        this.element.appendChild(sourceHeaderRow);
        // ---
        // sourceType
        const sourceType = document.createElement('div');
        sourceType.classList.add('order-context-menu-standard-row-column');
        sourceType.innerHTML = `${BACK_GRID_TYPE_TRANSLATIONS[this.assignedRowMenu.assignedRow.rowData['source']['type']]}`;
        sourceHeaderRow.appendChild(sourceType);
        // --
        const [ orderSourceRow, orderSourceCol ] = this.assignedRowMenu.assignedRow.rowData['source']['identifier'].split(',');
        // rowColContainer
        const sourceContainer = document.createElement('div');
        sourceContainer.classList.add('order-context-menu-row-col-container');
        sourceHeaderRow.appendChild(sourceContainer);
        // ---
        // sourceRowData
        const sourceRow = document.createElement('div');
        sourceRow.classList.add('order-context-menu-standard-row-column');
        sourceRow.innerHTML = `Ряд: ${orderSourceRow}`;
        sourceContainer.appendChild(sourceRow);
        // ----
        // sourceColData
        const sourceCol = document.createElement('div');
        sourceCol.classList.add('order-context-menu-standard-row-column');
        sourceCol.innerHTML = `Колонна ${orderSourceCol}`;
        sourceContainer.appendChild(sourceCol);
        // ---
        // ---
        // DESTINATION
        // destHeaderName
        const destHeaderName = document.createElement('div');
        destHeaderName.classList.add('order-context-menu-standard-row');
        const destRowText = document.createElement('p');
        destRowText.classList.add('order-context-menu-data-paragraph');
        destRowText.innerHTML = `<b>Конечная позиция стопки</b>`;
        destHeaderName.appendChild(destRowText);
        this.element.appendChild(destHeaderName);
        // ---
        const [ orderDestRow, orderDestCol ] = this.assignedRowMenu.assignedRow.rowData['destination']['identifier'].split(',');
        // destHeader
        const destHeaderRow = document.createElement('div');
        destHeaderRow.classList.add('order-context-menu-standard-row-header');
        this.element.appendChild(destHeaderRow);
        // ---
        // destinationType
        const destType = document.createElement('div');
        destType.classList.add('order-context-menu-standard-row-column');
        destType.innerHTML = `${BACK_GRID_TYPE_TRANSLATIONS[this.assignedRowMenu.assignedRow.rowData['destination']['type']]}`;
        destHeaderRow.appendChild(destType);
        // ---
        // rowColContainer
        const destContainer = document.createElement('div');
        destContainer.classList.add('order-context-menu-row-col-container');
        destHeaderRow.appendChild(destContainer);
        // ---
        // destRowData
        const destRow = document.createElement('div');
        destRow.classList.add('order-context-menu-standard-row-column');
        destRow.innerHTML = `Ряд: ${orderDestRow}`;
        destContainer.appendChild(destRow);
        // ---
        // destColdData
        const destCol = document.createElement('div');
        destCol.classList.add('order-context-menu-standard-row-column');
        destCol.innerHTML = `Колонна: ${orderDestCol}`;
        destContainer.appendChild(destCol);
        // ---
        // ---
        document.body.appendChild(this.element);
        // Wheels
        const wheelsRow = document.createElement('div');
        wheelsRow.classList.add('order-context-menu-standard-row');
        const wheels = document.createElement('p');
        wheels.classList.add('order-context-menu-data-paragraph');
        wheels.innerHTML= `<b>Колёса стопки</b>`;
        wheelsRow.appendChild(wheels);
        wheelsRow.addEventListener('contextmenu', event => {
            // console.log(this.assignedRowMenu.assignedRow.getWheelstackTargets());
            const targets = this.assignedRowMenu.assignedRow.getWheelstackTargets();
            targets[0].showContextMenu(event);
        })
        this.element.appendChild(wheelsRow);
        // ----
        this.#addEventListeners();
    }


    #addEventListeners() {
        // Close context menu on outside click
        document.addEventListener('click', this.#closeMenu.bind(this));
    }

    #closeMenu(event) {
        if (!this.element.contains(event.target) && !this.assignedRowMenu.element.contains(event.target)) {
            this.element.remove();
            this.assignedRowMenu.assignedWheelstackMenu = null;
            document.removeEventListener('click', this.#closeMenu.bind(this));
        }
    }

    forceCloseMenu() {
        this.element.remove();
    }

    showMenu(event) {
        this.element.style.display = 'block';
        this.element.classList.add('order-context-menu-show');
        this.updateContextMenuPosition(event);
    }

    updateContextMenuPosition(event) {
        if (this.element.style.display === 'block') {
          const { clientX: mouseX, clientY: mouseY } = event;
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const elementWidth = this.element.offsetWidth;
          const elementHeight = this.element.offsetHeight;
    
          let positionX = mouseX + 10; // Default position
          let positionY = mouseY + 10; // Default position
    
          // Adjust position if the context menu goes out of the viewport
          if (positionX + elementWidth > viewportWidth) {
            positionX = mouseX - elementWidth - 10;
          }
          if (positionY + elementHeight > viewportHeight) {
            positionY = mouseY - elementHeight - 10;
          }
    
          this.element.style.top = `${positionY}px`;
          this.element.style.left = `${positionX}px`;
        }
    }
}