import flashMessage from "../../../../utility/flashMessage.js";
import { BASE_PLATFORM_NAME, FLASH_MESSAGES, GRID_NAME, LABORATORY_NAME, PLACEMENT_TYPES } from "../../constants.js";
import convertISOToCustomFormat from "../../../../utility/convertToIso.js";
import { gridManager, platformManager } from "../../mainScript.js";
import { createProRejOrderBulk } from "../../../../utility/ordersCreation.js";


export default class BatchesContextMenu{
    constructor(
        targetClass,
        batchGetURL,
    ) {
        this.targetClass = targetClass;
        this.batchGetURL= batchGetURL; 
    }

    async getBatchdata(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                flashMessage.show({
                    message: `Ошибка при получении данных партии: ${response.status}`,
                    color: FLASH_MESSAGES.FETCH_ERROR_FONT_COLOR,
                    backgroundColor: FLASH_MESSAGES.FETCH_ERROR_BG_COLOR,
                    position: 'top-center',
                    duration: 5000,
                });
                throw new Error(`Network response was not ok ${response.statusText}`);
            }
            const batchData = await response.json();
            return batchData
        } catch (error) {
            console.error(`Error getting data of the batchNumber: ${error}`);
            throw error;
        }
    }


    async markBatch(batchNumber) {
        if (this.markingBatch) {
            this.unmarkBatch();
        }
        if (this.batchRow) {
            this.batchRow.classList.add('batch-mark');
        }
        for (let rowId in platformManager.platformRows) {
            const row = platformManager.platformRows[rowId];
            for (let colId in row.columns) {
                const cell = row.columns[colId];
                const cellData = cell.elementData;
                if (cellData && cellData['batchNumber'] === batchNumber) {
                    cell.element.classList.add('batch-mark');
                    cell.batchMarked = true;
                }
            }
        }
        for (let rowId in gridManager.gridRows) {
            const row = gridManager.gridRows[rowId];
            for (let colId in row.columns) {
                const cell = row.columns[colId];
                const cellData = cell.elementData;
                if (cellData && cellData['batchNumber'] === batchNumber) {
                    cell.element.classList.add('batch-mark');
                    cell.batchMarked = true;
                }
            }
        }
        const allBatchElements = document.querySelectorAll(`#${CSS.escape(batchNumber)}`);
        allBatchElements.forEach( (element) => {
            element.classList.add('batch-mark');
        })
        this.markingBatch = batchNumber;;
    }

    async unmarkBatch() {
        const allMarked = document.querySelectorAll('.batch-mark');
        allMarked.forEach((element) => {
            element.classList.remove('batch-mark')
        })
        if (this.markingTimeout) {    
            clearTimeout(this.markingTimeout);
            this.markingTimeout = null;
        }
        this.markingBatch = null;
    }


    async updateParags(newData) {
        let newDate = 'Не производились';
        if (newData['laboratoryTestDate']) {
            newDate = convertISOToCustomFormat(newData['laboratoryTestDate']);
        }
        this.lastTestDateParag.innerHTML = `<b>Дата последнего испытания</b> ${newDate}`;
        const resultStr = `<b>Результат последнего теста:</b>`;
        if (!this.batchData['laboratoryTestDate']) {
            this.lastTestResultParag.innerHTML = `${resultStr} Не производились`;
        } else if (this.batchData['laboratoryPassed']) {
            this.lastTestResultParag.innerHTML = `${resultStr} Пройден`; 
        } else {
            this.lastTestResultParag.innerHTML = `${resultStr} Не пройден`;
        }
    }

    async updateStyles() {
        this.element.classList.remove('not-tested');
        this.element.classList.remove('passed');
        this.element.classList.remove('not-passed');
        if (!this.batchData['laboratoryTestDate']) {
            this.element.classList.add('not-tested');
        } else if (this.batchData['laboratoryPassed']) {
            this.element.classList.add('passed');
        } else {
            this.element.classList.add('not-passed');
        }
    }

    async updateMenuData() {
        if (!this.batchData) {
            this.removeMenu();
        }
        const getDataURL = this.batchGetURL + `/${this.batchNumber}`;
        const newBatchData = await this.getBatchdata(getDataURL);
        for (let key in newBatchData) {
            if (this.batchData[key] !== newBatchData[key]) {
                await this.updateParags(newBatchData);
                this.batchData = newBatchData;
                await this.updateStyles();
                flashMessage.show({
                    message: `Данные открытого меню партии обновлены ${this.batchNumber}`,
                    position: 'top-center',
                    duration: 1500,
                });
                break;
            }
        }
    }

    async #buildExtraMenu(event, processing = true) {
        this.extraMenuCloser = (event, force = false) => {
            if (force) {
                this.extraMenuContainer.remove();
                this.extraMenuContainer = null;
                document.body.removeEventListener('pointerdown', this.extraMenuCloser);
            }
            if (this.extraMenuContainer && !this.extraMenuContainer.contains(event.target)) {
                this.extraMenuContainer.remove();
                this.extraMenuContainer = null;
                document.body.removeEventListener('pointerdown', this.extraMenuCloser);
            }
        }
        this.executeCreation = async (processing, extraElement) => {
            const elementData = {
                'placement': {
                    'placementId': gridManager.gridId,
                    'type': GRID_NAME,
                },
                'batchNumber': this.batchNumber,
            }
            createProRejOrderBulk(
                elementData, extraElement, processing, gridManager.gridId
            );
            this.extraMenuCloser(event, true);
        }
        this.extraMenuContainer = document.createElement('div');
        this.extraMenuContainer.classList.add('cell-extra-elements-menu-container');
        this.extraMenuContainer.id = "batchExtraMenu";
        const gridExtraElements = gridManager.extraElements;
        for (let extraElement in gridExtraElements) {
            if (extraElement === LABORATORY_NAME) {
                continue;
            }
            const extraElementButton = document.createElement("button");
            extraElementButton.classList.add("cell-context-menu-button");
            if (processing) {
                extraElementButton.classList.add('extra-confirm');
                extraElementButton.classList.add('processing');
            } else {
                extraElementButton.classList.add('extra-reject');
                extraElementButton.classList.add('reject');
            }
            extraElementButton.id = extraElement;
            extraElementButton.innerText = extraElement;
            extraElementButton.addEventListener("click", (event) => {
                event.preventDefault();
                this.executeCreation(processing, extraElement);
            })
            this.extraMenuContainer.appendChild(extraElementButton);
        }
        document.body.appendChild(this.extraMenuContainer);
        document.body.addEventListener('pointerdown', this.extraMenuCloser);
        this.updateMenuPosition(event, this.extraMenuContainer);
    }

    async fillMenu() {
        // BATCH_ROW
        this.batchRow = document.createElement('div');
        this.batchRow.classList.add("batch-context-menu-row");
        if (this.markingBatch && this.markingBatch === this.batchNumber) {
            this.batchRow.classList.add('batch-mark');
        }
        this.batchRow.id = this.batchNumber
        this.batchRow.addEventListener('click', (event) => {
            if (this.markingBatch && this.batchNumber !== this.markingBatch) {
                this.unmarkBatch(this.markingBatch);
                this.markBatch(this.batchNumber);
                return;
            }
            if (!this.markingBatch) {
                this.markBatch(this.batchNumber);
            } else {
                this.unmarkBatch(this.batchNumber);
            }
        })

        this.batchParag = document.createElement('p');
        this.batchParag.id = this.batchNumber;
        this.batchParag.innerHTML = `<b>Партия:</b> ${this.batchData['batchNumber']}`;
        this.batchRow.appendChild(this.batchParag);
        this.element.appendChild(this.batchRow);
        // LAST DATE ROW
        this.lastTestDateRow = document.createElement('div');
        this.lastTestDateRow.classList.add("batch-context-menu-row");
        this.lastTestDateRow.id = 'lastTestDate';

        this.lastTestDateParag = document.createElement('p');
        let lastTestDate = 'Не производились';
        if (this.batchData['laboratoryTestDate']) {
            lastTestDate = convertISOToCustomFormat(this.batchData['laboratoryTestDate']);
        }
        this.lastTestDateParag.innerHTML = `<b>Дата последнего испытания</b> ${lastTestDate}`;
        this.lastTestDateRow.appendChild(this.lastTestDateParag);
        this.element.appendChild(this.lastTestDateRow);
        // LAST RESULT ROW
        this.lastTestResult = document.createElement('div');
        this.lastTestResult.classList.add("batch-context-menu-row");
        this.lastTestResult.id = 'lastTestResult';

        this.lastTestResultParag = document.createElement('p');
        const resultStr = `<b>Результат последнего теста:</b>`;
        if (!this.batchData['laboratoryTestDate']) {
            this.lastTestResultParag.innerHTML = `${resultStr} Не производились`;
        } else if (this.batchData['laboratoryPassed']) {
            this.lastTestResultParag.innerHTML = `${resultStr} Пройден`; 
        } else {
            this.lastTestResultParag.innerHTML = `${resultStr} Не пройден`;
        }
        this.lastTestResult.appendChild(this.lastTestResultParag);
        this.element.appendChild(this.lastTestResult);
        // BUTTONS
        this.buttonsRow = document.createElement('div');
        this.buttonsRow.classList.add('cell-context-menu-buttons-row');
        // PROCESSING BUTTON
        this.processingButton = document.createElement('button');
        this.processingButton.classList.add('cell-context-menu-button');
        this.processingButton.classList.add('processing');
        this.processingButton.innerText = 'Обработка';
        this.processingButton.addEventListener('click', async (event) => {
            event.preventDefault();
            await this.#buildExtraMenu(event, true);
        })
        this.buttonsRow.appendChild(this.processingButton);
        this.rejectingButton = document.createElement('button');
        this.rejectingButton.classList.add('cell-context-menu-button');
        this.rejectingButton.classList.add('reject');
        this.rejectingButton.innerText = 'Выгрузка';
        this.rejectingButton.addEventListener('click', async (event) => {
            event.preventDefault();
            await this.#buildExtraMenu(event, false);
        })
        this.buttonsRow.appendChild(this.rejectingButton);
        
        this.element.appendChild(this.buttonsRow);
    }

    async buildMenu(event, batchNumber) {
        if (!this.menuCloser) {
            this.menuCloser = (event) => {
                if (this.extraMenuContainer && this.extraMenuContainer.contains(event.target)) {
                    return;
                }
                if (!this.element.contains(event.target)) {
                    this.removeMenu();
                }
            }
        }
        if (this.markingBatch === batchNumber && this.markingTimeout) {
            clearTimeout(this.markingTimeout);
            this.markingTimeout = null;
        }
        this.batchNumber = batchNumber;
        if (!this.element) {
            const getUrl = this.batchGetURL + `/${this.batchNumber}`;
            this.batchData = await this.getBatchdata(getUrl);
            this.element = document.createElement('div');
            this.element.classList.add("batch-context-menu-container");
            document.body.appendChild(this.element);
            document.addEventListener('pointerdown', this.menuCloser);
            this.fillMenu()
        } else {
            this.element.id = this.batchNumber;
        }
        this.updateStyles();
        this.updateMenuPosition(event, this.element);
        this.startUpdating();
    }

    removeMenu() {
        document.removeEventListener('pointerdown', this.menuCloser);
        this.menuCloser = null;
        if (this.element) {
            this.element.remove();
        }
        this.element = null;
        this.batchData = null;
        // this.unmarkBatch(this.batchNumber);
        this.batchNumber = null;
        if (this.markingBatch) {
            if (!this.markingTimeout) {
                this.markingTimeout = setTimeout(() => {
                    this.unmarkBatch();
                    flashMessage.show( {
                        message: 'Выделение партии закончено',
                        duration:  1500,
                    })
                }, 5000)
            }
        }
        this.stopUpdating();
    }

    startUpdating() {
        if (this.menuUpdateInterval) {
            return;
        }
        this.menuUpdateInterval = setInterval( () => {
            this.updateMenuData();
        }, 500);
    }

    stopUpdating() {
        if (!this.menuUpdateInterval) {
            return;
        }
        clearInterval(this.menuUpdateInterval);
        this.menuUpdateInterval = null;
    }

    async updateMenuPosition(event, menuElement) {
        if (!menuElement) {
            return;
        }
        const touch = event.targetTouches ? event.targetTouches[0] : event;
    
        const { clientX: mouseX, clientY: mouseY } = touch;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const elementWidth = menuElement.offsetWidth;
        const elementHeight = menuElement.offsetHeight;
    
        let positionX = mouseX + 10; // Default position
        let positionY = mouseY + 10; // Default position
    
        // Adjust position if the hover display goes out of the viewport horizontally
        if (positionX + elementWidth > viewportWidth) {
            positionX = mouseX - elementWidth - 10;
        }
        // Adjust position if the hover display goes out of the viewport vertically
        if (positionY + elementHeight > viewportHeight) {
            positionY = viewportHeight - elementHeight - 10; // Position it at the bottom edge
        }
        // Ensure the menu does not go above the viewport
        if (positionY < 0) {
            positionY = 10; // Provide a small offset from the top
        }
    
        // Final adjustment to ensure the menu stays within the viewport vertically
        if (positionY + elementHeight > viewportHeight) {
            positionY = viewportHeight - elementHeight - 500;
        }
    
        menuElement.style.top = `${positionY}px`;
        menuElement.style.left = `${positionX}px`;
    }

}
