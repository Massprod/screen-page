import updateMenuPosition from "../../../../utility/adjustContainerPosition.js";
import { getRequest } from "../../../../utility/basicRequests.js";
import flashMessage from "../../../../utility/flashMessage.js";
import { BACK_URLS, GRID_NAME, STORAGE_NAME, UPDATE_PERIODS, LABORATORY_NAME } from "../../constants.js";
import { batchesContextMenu, gridManager } from "../../mainScript.js";
import {
    createProRejOrderGrid,
    createProRejOrderStorage,
    createLaboratoryOrderStorage,
    createLaboratoryOrderGrid,
    createProRejOrderBulk,
    createOrderMoveWholestackStorage,
} from "../../../../utility/ordersCreation.js";


// Idea is to open elementContextMenu only by given ID of the element.
// ID <- to get correct data of the element from collection.
// All updates and maintain of the existence should be performed inside of this class.
// If we change placement of the element == Close.
// We shouldn't be able to see Menu after changing it's placement.
// But we should be able to see Menu if we only change its state in place.
// (Different menu for different elements, because they can differ)


export default class WheelstackContextMenu{
    constructor() {
        this.openedPlacementId = null;
        this.openedPlacementType = null;
        this.openedRowPlacement = null;
        this.openedColPlacement = null;
        this.openedLastChange = null;
        this.lastChange = null;
        this.elementId = null;
        this.elementData = null;
        // MENU HTML ELEMENTS
        this.wheelElements = [];
        this.cringeIndexes = [0, 1, 2, 3, 4, 5]
        this.gridCellsOrderExecuteListeners = new Map();
    }

    // +++ WHEEL MENU
    async buildWheelMenu(event1, wheelElement) {
        if (this.blockedWheel) {
            flashMessage.show({
                message: 'Стопка ожидает выполнения заказа',
            })
            return;
        }
        this.wheelsMenuCloser = (event, force = false) =>  {
            if (force) {
                this.wheelsMenu.remove();
                this.wheelsMenu = null;
            }
            if (this.wheelsMenu && !this.wheelsMenu.contains(event.target)) {
                this.wheelsMenu.remove();
                this.wheelsMenu = null;
                document.body.removeEventListener('pointerdown', this.wheelsMenuCloser);
            }
        }
        this.wheelsMenu = document.createElement("div");
        this.wheelsMenu.classList.add("wheelstack-extra-elements-menu-container");
        this.wheelsMenu.id = "wheelMenu";
        const labButton = document.createElement("button");
        labButton.classList.add("wheelstack-context-menu-button");
        labButton.classList.add("storage");
        labButton.id = "wheelLaboratory";
        labButton.innerHTML = "В лабораторию";
        labButton.addEventListener("click", async (eve1) => {
            if (GRID_NAME === this.elementData['placement']['type']) {
                await createLaboratoryOrderGrid(this.elementData, wheelElement.id, gridManager.gridId);
            } else if ( STORAGE_NAME === this.elementData['placement']['type']) {
                await createLaboratoryOrderStorage(this.elementData, wheelElement.id, gridManager.gridId);
            }
            this.wheelsMenuCloser(eve1, true);
        })
        this.wheelsMenu.appendChild(labButton);
        document.body.addEventListener('pointerdown', this.wheelsMenuCloser);
        document.body.appendChild(this.wheelsMenu);
        await updateMenuPosition(event1, this.wheelsMenu);
    }
    // WHEEL MENU ---

    // +++ EXTRA MENU
    async openExtraMenu(event, processing) {
        this.extraMenuCloser = (event, force = false) => {
            if (force) {
                if (this.extraMenuContainer) {
                    this.extraMenuContainer.remove();
                    this.extraMenuContainer = null;
                }
                document.body.removeEventListener('pointerdown', this.extraMenuCloser);
            }
            if (this.extraMenuContainer && !this.extraMenuContainer.contains(event.target)) {
                this.extraMenuContainer.remove();
                this.extraMenuContainer = null;
                document.body.removeEventListener('pointerdown', this.extraMenuCloser);
            }
        }
        if (this.extraMenuContainer) {
            this.extraMenuCloser(event, true);
            return;
        }
        // ORDER CREATION

        // ---

        document.body.addEventListener("pointerdown", this.extraMenuCloser);
        this.extraMenuContainer = document.createElement('div');
        this.extraMenuContainer.classList.add('wheelstack-extra-elements-menu-container');
        this.extraMenuContainer.id = "wheelstackExtraMenu";
        const gridExtraElements = gridManager.extraElements;
        for (let extraElement in gridExtraElements) {
            if (extraElement === LABORATORY_NAME) {
                continue;
            }
            const extraElementButton = document.createElement("button");
            extraElementButton.classList.add('wheelstack-context-menu-button');
            if (processing) {
                extraElementButton.classList.add('extra-confirm');
                extraElementButton.classList.add('processing');
            } else {
                extraElementButton.classList.add('extra-reject');
                extraElementButton.classList.add('reject');
            }
            extraElementButton.id = extraElement;
            extraElementButton.innerText = extraElement;
            extraElementButton.addEventListener("click", async (event) => {
                if (this.chosenBatch) {
                    await createProRejOrderBulk(this.elementData, extraElement, processing, gridManager.gridId);
                } else if (GRID_NAME === this.elementData['placement']['type']) {
                    await createProRejOrderGrid(this.elementData, extraElement, processing, gridManager.gridId);
                } else if ( STORAGE_NAME === this.elementData['placement']['type']) {
                    await createProRejOrderStorage(this.elementData, extraElement, processing, gridManager.gridId);
                }
                setTimeout( () => {
                    this.extraMenuCloser(event, true);
                }, 10);
            })
            this.extraMenuContainer.appendChild(extraElementButton);
        }
        document.body.appendChild(this.extraMenuContainer);
        updateMenuPosition(event, this.extraMenuContainer);
    }
    // EXTRA MENU ---
    // UPDATE ELEMENT
    async updateElementData() {
        const getElementDataURL = `${BACK_URLS.GET_WHEELSTACK_DATA_BY_ID}/${this.elementId}`;
        this.elementData = await getRequest(getElementDataURL);
    }

    async updateElement() {
        if (!this.menuContainer) {
            return;
        }
        await this.updateElementData();
        if (this.lastChange === this.elementData['lastChange'] && !this.activeOrderMarking) {
            return;
        }
        this.lastChange = this.elementData['lastChange'];
        // originalData check <- hide if placement changed.
        if (this.elementData['lastChange'] !== this.openedLastChange) {
            let close = false;
            if (this.elementData['placement']['placementId'] !== this.openedPlacementId) {
                close = true;
            } else if (
                this.elementData['rowPlacement'] !== this.openedRowPlacement
            ) {
                close = true;
            } else if (
                this.elementData['colPlacement'] !== this.openedColPlacement
            ) {
                close = true;
            }
            if (close) {
                this.hideMenu();
                return;
            }
        }
        // update Wheels
        this.cringeIndexes.forEach( async ind => {
            const wheelObjectId = this.elementData['wheels'][ind];
            const wheelElement = this.wheelElements[ind];
            if (!wheelElement) {
                return;
            }
            const parag = wheelElement.childNodes[0];
            if (!wheelObjectId) {
                wheelElement.style.visibility = 'hidden';
                parag.innerText = 'T';
                parag.style.visibility = 'hidden';
                return;
            }
            wheelElement.id = wheelObjectId;
            wheelElement.style.visibility = 'visible';
            const getWheelDataURL = `${BACK_URLS.GET_WHEEL_DATA_BY_OBJECT_ID}/${wheelObjectId}`;
            const wheelData = await getRequest(getWheelDataURL);
            parag.innerText = wheelData['wheelId'];
            parag.style.visibility = 'visible';
        })
        // ---
        // Batch
        const batchParag = this.batchRow.childNodes[0];
        batchParag.id = this.elementData['batchNumber'];
        batchParag.innerHTML = `<b>Номер партии:</b><br>${this.elementData['batchNumber']}`;
        // ---
        // ButtonsRow
        if (this.activeOrderMarking) {
            this.moveButton.classList.add('order-marking');
            this.moveButton.innerText = 'Отменить выбор';
            this.buttonsContainer.childNodes.forEach(async element => {
                if (element !== this.moveButton) {
                    element.style.display = 'none';
                }
            })
            return;
        }
        if (this.elementData['blocked']) {
            this.buttonsContainer.childNodes.forEach(async element => {
                if (this.blockedByRow !== element) {
                    element.style.display = 'none';
                }
            })
            this.blockedByRow.style.display = 'block';
            const blockedParag = this.blockedByRow.childNodes[0];
            blockedParag.id = this.elementData['lastOrder'];
            blockedParag.innerHTML = `<b>Ожидает выполнения:</b><br>${this.elementData['lastOrder']}`;
            const getOrderDataURL = `${BACK_URLS.GET_ORDER_DATA_BY_ID}/${this.elementData['lastOrder']}`;
            const currentOrderData = await getRequest(getOrderDataURL);
            this.blockedWheel = currentOrderData['affectedWheels']['source'][0];
            const blockedWheelElement = this.wheelsContainer.querySelector(`#${CSS.escape(this.blockedWheel)}`);
            blockedWheelElement.classList.add('blocked-by');
        } else {
            this.blockedWheel = null;
            this.buttonsContainer.childNodes.forEach(async element => {
                if (this.blockedByRow === element) {
                    element.style.display = 'none';
                } else {
                    element.style.display = 'block';
                }
            })
            this.wheelElements.forEach(async element => {
                element.classList.remove('blocked-by');
            })
        }
        // ---
    }


    // +++ BUILD 
    async buildTemplate() {
        // MainContainer
        this.menuContainer = document.createElement('div');
        this.menuContainer.classList.add('wheelstack-context-menu-container');
        this.menuContainer.id = this.elementId;
        // WheelsContainer
        this.wheelsContainer= document.createElement('div');
        this.wheelsContainer.classList.add('wheelstack-context-menu-wheels-container');
        // Wheels
        for (let ind = 0; ind < 6; ind += 1) {
            const wheelElement = document.createElement('div');
            wheelElement.classList.add('wheelstack-context-menu-row');
            wheelElement.style.visibility = 'hidden';
            const parag = document.createElement('p');
            parag.innerText = 'T';
            parag.style.visibility = 'hidden';
            wheelElement.appendChild(parag);
            this.wheelsContainer.appendChild(wheelElement);
            this.wheelElements.push(wheelElement);
            wheelElement.addEventListener('click', async event => {
                this.buildWheelMenu(event, wheelElement);
            });
        }
        this.menuContainer.appendChild(this.wheelsContainer)
        // Batch
        this.batchRow = document.createElement('div');
        this.batchRow.classList.add('wheelstack-context-menu-row');
        const batchParag = document.createElement('p');
        batchParag.innerText = '';
        this.batchRow.appendChild(batchParag);
        this.batchRow.addEventListener('click', async event => {
            if (!this.chosenBatch) {
                this.chosenBatch = true;
                batchesContextMenu.markBatch(this.elementData['batchNumber']);
                this.openerElement.parentElement.childNodes.forEach( element => {
                    element.classList.add('batch-mark');
                })
            } else {
                this.chosenBatch = false;
                batchesContextMenu.unmarkBatch();
            }
        })

        this.menuContainer.appendChild(this.batchRow);
        // Buttons
        this.buttonsContainer = document.createElement('div');
        this.buttonsContainer.classList.add('wheelstack-context-menu-buttons-row');
        this.buttonsContainer.id = 'wheelstackButtons';
        this.menuContainer.appendChild(this.buttonsContainer);

        this.moveButton = document.createElement('button');
        this.moveButton.classList.add('wheelstack-context-menu-button');
        this.moveButton.classList.add('move')
        this.moveButton.id = 'moveButton';
        this.moveButton.innerText = 'Переместить';
        this.moveButton.addEventListener('click', async (event) => {
            if (this.activeOrderMarking) {
                await this.clearHandleMoveExecute();
                return;
            }
            this.activeOrderMarking = true;
            this.openerElement.classList.add('mark-source');
            const gridEmptyCells = document.querySelectorAll('.cell-grid.cell-empty');
            gridEmptyCells.forEach( (element) => {
                element.classList.add('mark-available');
                const handleOrderCreation = async (event) => {
                    const [destinationRow, destinationCol ] = event.target.id.split('|');
                    const destinationData = {
                        'destinationId': gridManager.gridId,
                        'destinationType': GRID_NAME,
                        'destinationRow': destinationRow,
                        'destinationCol': destinationCol,
                    }
                    await createOrderMoveWholestackStorage(this.elementData, destinationData);
                    await this.clearHandleMoveExecute();
                }
                element.addEventListener('contextmenu', handleOrderCreation);
                this.gridCellsOrderExecuteListeners.set(element, handleOrderCreation);
            })
            this.moveButton.classList.add('order-marking');
            this.moveButton.innerText = `Отменить выбор`;
            this.buttonsContainer.childNodes.forEach(async element => {
                if (element !== this.moveButton) {
                    element.style.display = 'none';
                }
            })
            this.cancelOrderCreation = async () => {
                await this.clearHandleMoveExecute();
            }
            document.addEventListener('dblclick', this.cancelOrderCreation);
        })

        this.buttonsContainer.appendChild(this.moveButton);


        this.moveStorageButton = document.createElement('button');
        this.moveStorageButton.classList.add('wheelstack-context-menu-button');
        this.moveStorageButton.classList.add('storage');
        this.moveStorageButton.id = 'moveStorageButton';
        this.moveStorageButton.innerText = 'Хранилище';
        this.buttonsContainer.appendChild(this.moveStorageButton);

        this.moveProcessingButton = document.createElement('button');
        this.moveProcessingButton.classList.add('wheelstack-context-menu-button');
        this.moveProcessingButton.classList.add('processing');
        this.moveProcessingButton.id = 'moveProcessingButton';
        this.moveProcessingButton.innerText = 'Обработка';
        this.moveProcessingButton.addEventListener('click', event => {
            this.openExtraMenu(event, true);

        })
        this.buttonsContainer.appendChild(this.moveProcessingButton);
        
        this.moveRejectedButton = document.createElement('button');
        this.moveRejectedButton.classList.add('wheelstack-context-menu-button');
        this.moveRejectedButton.classList.add('reject');
        this.moveRejectedButton.id = 'moveRejectedButton';
        this.moveRejectedButton.innerText = 'Отказ';
        this.moveRejectedButton.addEventListener('click', event => {
            this.openExtraMenu(event, false);
        })
        this.buttonsContainer.appendChild(this.moveRejectedButton);
        
        

        this.blockedByRow = document.createElement('div');
        this.blockedByRow.classList.add('wheelstack-context-menu-row');
        this.blockedByRow.classList.add('blocked-by');
        const blockedByParag = document.createElement('p');
        this.blockedByRow.appendChild(blockedByParag);
        this.blockedByRow.style.display = 'none';
        this.buttonsContainer.appendChild(this.blockedByRow);
        return this.menuContainer;
    }

    // BUILD ---

    // MOVE EXECUTE
    async clearHandleMoveExecute() {
        this.activeOrderMarking = false;
        this.moveButton.classList.remove('order-marking');
        this.moveButton.innerText = 'Переместить';
        this.buttonsContainer.childNodes.forEach( (element) => {
            if (this.blockedByRow !== element) {
                element.style.display = 'block';
            }
        }
        )
        this.openerElement.classList.remove('mark-source');
        const markedCells = document.querySelectorAll('.cell-grid.mark-available');
        markedCells.forEach((element) => {
            element.classList.remove('mark-available');
            const handleOrderExecute = this.gridCellsOrderExecuteListeners.get(element);
            if (handleOrderExecute) {
                element.removeEventListener('contextmenu', handleOrderExecute);
                this.gridCellsOrderExecuteListeners.delete(element);
            }
        })
        document.removeEventListener('dblclick', this.cancelOrderCreation);
    }

    // +++ SHOW|HIDE
    async showMenu(event, elementId, openerElement) {
        if (this.menuContainer) {
            // updateMenuPosition(event, this.menuContainer);
            this.hideMenu();
            return;
        }
        if (this.activeOrderMarking && this.elementId !== elementId) {
            flashMessage.show({
                message: "Закончите | Отмените перемещение"
            })
            return;
        }
        this.menuCloser = async (event) => {
            if (this.menuContainer && this.menuContainer.contains(event.target)) {
                return;
            }
            if (this.openerElement === event.target || this.openerElement.contains(event.target)) {
                return;
            }
            if (this.extraMenuContainer && this.extraMenuContainer.contains(event.target)) {
                return;
            }
            if (this.wheelsMenu && this.wheelsMenu.contains(event.target)) {
                return;
            }
            this.hideMenu();
        }
        this.openerElement = openerElement;
        this.elementId = elementId;
        await this.updateElementData();
        this.openedLastChange = this.elementData['lastChange'];
        this.openedPlacementId = this.elementData['placement']['placementId'];
        this.openedPlacementType = this.elementData['placement']['type'];
        this.openedRowPlacement = this.elementData['rowPlacement'];
        this.openedColPlacement = this.elementData['colPlacement'];
        document.body.appendChild(await this.buildTemplate());
        document.body.addEventListener('pointerdown', this.menuCloser);
        updateMenuPosition(event, this.menuContainer);
        this.startUpdatingMenuData();
    }

    async hideMenu() {
        if (this.menuContainer) {
            if (!this.activeOrderMarking) {
                this.elementData = {}
            }
            this.wheelElements = [];
            this.menuContainer.remove();
            this.menuContainer = null;
            this.openedLastChange = null;
            this.openedPlacementId = null;
            this.openedPlacementType = null;
            this.openedRowPlacement = null;
            this.openedColPlacement = null;
            this.lastChange = null;
            document.body.removeEventListener('pointerdown', this.menuCloser);
            this.stopUpdatingMenuData();
            this.chosenBatch = null
            batchesContextMenu.removeMenu();
            if (this.extraMenuContainer) {
                this.extraMenuCloser(null, true);
            }
            if (this.wheelsMenu) {
                this.wheelsMenuCloser(null, true);
            }
        }
    }

    // SHOW|HIDE ---

    // UPDATE MENU DATA
    async startUpdatingMenuData() {
        if (this.menuDataUpdatingInterval) {
            return;
        }
        this.menuDataUpdatingInterval = setInterval( () => {
            this.updateElement();
        }, UPDATE_PERIODS.ELEMENT_MENU)
    }

    async stopUpdatingMenuData() {
        if (!this.menuDataUpdatingInterval) {
            return;
        }
        clearInterval(this.menuDataUpdatingInterval);
        this.menuDataUpdatingInterval = null;
    }

}