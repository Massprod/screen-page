import updateMenuPosition from "../../../../utility/adjustContainerPosition.js";
import { getRequest } from "../../../../utility/basicRequests.js";
import flashMessage from "../../../../utility/flashMessage/flashMessage.js";
import {
    BACK_URLS,
    GRID_NAME,
    STORAGE_NAME,
    UPDATE_PERIODS,
    LABORATORY_NAME,
    BASE_PLATFORM_NAME,
    SHIPPED,
    OPERATOR_ROLE_NAME,
    ORDER_MOVE_TO_LABORATORY,
} from "../../constants.js";
import { batchesContextMenu, gridManager, ordersContextMenu } from "../../mainScript.js";
import {
    createProRejOrderGrid,
    createProRejOrderStorage,
    createLaboratoryOrderStorage,
    createLaboratoryOrderGrid,
    createProRejOrderBulk,
    createOrderMoveWholestackFromStorage,
    createOrderMoveWholestackFromBaseGrid,
    createOrderMoveWholestackToStorage,
    createOrderMoveWholestackToStorageFromStorage,
} from "../../../../utility/ordersCreation.js";
import { getCookie } from "../../../../utility/roleCookies.js";


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
    async openExtraMenu(event, processing, storage) {
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

        document.body.addEventListener("pointerdown", this.extraMenuCloser);
        this.extraMenuContainer = document.createElement('div');
        this.extraMenuContainer.classList.add('wheelstack-extra-elements-menu-container');
        this.extraMenuContainer.id = "wheelstackExtraMenu";
        if (!storage) {
            const gridExtraElements = gridManager.extraElements;
            for (let extraElement in gridExtraElements) {
                if (extraElement === LABORATORY_NAME) {
                    continue;
                }
                const extraElementButton = document.createElement("button");
                extraElementButton.classList.add('wheelstack-context-menu-button');
                if (processing) {
                    extraElementButton.classList.add('extra-confirm');
                } else {
                    extraElementButton.classList.add('extra-reject');
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
        } else {
            const getAllStoragesNoDataURL = `${BACK_URLS.GET_ALL_STORAGES}/?include_data=false`; 
            const allStorages = await getRequest(getAllStoragesNoDataURL);
            if (0 === allStorages.length) {
                flashMessage.show({
                    message: 'Нет созданных хранилищ',
                })
                return;
            }
            allStorages.forEach( async element => {
                if (this.elementData['placement']['placementId'] === element['_id']) {
                    return;
                }
                const storageElementButton = document.createElement('button');
                storageElementButton.classList.add('wheelstack-context-menu-button', 'extra-storage');
                storageElementButton.id = element['_id'];
                storageElementButton.innerText = element['name'];
                storageElementButton.addEventListener('click', async event => {
                    if (STORAGE_NAME === this.elementData['placement']['type']) {
                        await createOrderMoveWholestackToStorageFromStorage(this.elementData, element['_id']);
                    } else {
                        await createOrderMoveWholestackToStorage(this.elementData, element['_id']);
                    }
                    setTimeout( () => {
                        this.extraMenuCloser(event, true);
                    }, 10);
                })
                this.extraMenuContainer.appendChild(storageElementButton);
            })
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
            } else if (SHIPPED === this.elementData['status']) {
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
        this.batchRow.style.visibility = 'visible';
        this.buttonsContainer.style.visibility = 'visible';
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
            this.blockedByRow.addEventListener('contextmenu', event => {
                event.preventDefault();
                ordersContextMenu.showMenu(this.elementData['lastOrder'], event);
            })
            this.blockedByRow.style.display = 'block';
            const blockedParag = this.blockedByRow.childNodes[0];
            blockedParag.id = this.elementData['lastOrder'];
            blockedParag.innerHTML = `<b>Ожидает выполнения:</b><br>${this.elementData['lastOrder']}`;
            const getOrderDataURL = `${BACK_URLS.GET_ORDER_DATA_BY_ID}/${this.elementData['lastOrder']}`;
            const currentOrderData = await getRequest(getOrderDataURL);
            if (ORDER_MOVE_TO_LABORATORY === currentOrderData['orderType']) {
                this.blockedWheel = currentOrderData['affectedWheels']['source'][0];
                const blockedWheelElement = this.wheelsContainer.querySelector(`#${CSS.escape(this.blockedWheel)}`);
                blockedWheelElement.classList.add('blocked-by');
            }
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


    // +++ MARKING
    async sourceMarking(storageId, batchNumber, wheelstackId) {
        const elements = document.body.querySelectorAll(
            `.storage-element-dropdown-row#${CSS.escape(storageId)},
             .storage-element-dropdown-row#${CSS.escape(batchNumber)},
             .storage-element-expanded-row#${CSS.escape(wheelstackId)}`
        );
        elements.forEach(element => {
            element.classList.add('mark-source');
        });
    }

    async startMarking(storageId, batchNumber, wheelstackId) {
        if (this.markingUpdateInterval) {
            return;
        }
        this.markingUpdateInterval = setInterval( () => {
            this.sourceMarking(storageId, batchNumber, wheelstackId);
        }, UPDATE_PERIODS.SOURCE_MARKING);
    }
    
    async stopMarking() {
        if (!this.markingUpdateInterval) {
            return;
        }
        clearInterval(this.markingUpdateInterval);
        const allMarked = document.body.querySelectorAll('.mark-source');
        allMarked.forEach( element => {
            element.classList.remove('mark-source');
        })
        this.markingUpdateInterval = null;
    }
    // MARKING ---


    // +++ BUILD 
    async buildTemplate() {
        const role = await getCookie('role');
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
            if (OPERATOR_ROLE_NAME !== role) {
                wheelElement.addEventListener('click', async event => {
                    if (this.activeOrderMarking) {
                        flashMessage.show({
                            message: "Закончите | Отмените перемещение"
                        })
                        return;
                    }
                    if (BASE_PLATFORM_NAME === this.elementData['placement']['type']) {
                        flashMessage.show({
                            message: 'Сначало перенеместите стопу с платформы',
                        })
                        return;
                    }
                    this.buildWheelMenu(event, wheelElement);
                });
            }
        }
        this.menuContainer.appendChild(this.wheelsContainer)
        // Batch
        this.batchRow = document.createElement('div');
        this.batchRow.classList.add('wheelstack-context-menu-row');
        this.batchRow.style.visibility = 'hidden';
        const batchParag = document.createElement('p');
        batchParag.innerText = '';
        this.batchRow.appendChild(batchParag);
        this.batchRow.addEventListener('click', async event => {
            if (!this.chosenBatch) {
                this.chosenBatch = true;
                batchesContextMenu.markBatch(this.elementData['batchNumber']);
                if (STORAGE_NAME === this.elementData['placement']['type']) {
                    this.openerElement.parentElement.childNodes.forEach( element => {
                        element.classList.add('batch-mark');
                    })
                }
            } else {
                this.chosenBatch = false;
                batchesContextMenu.unmarkBatch();
            }
        })
        if (OPERATOR_ROLE_NAME !== role) {
            this.batchRow.addEventListener('contextmenu', async event => {
                event.preventDefault();
                batchesContextMenu.buildMenu(event, this.elementData['batchNumber']);
            });
        }
        this.menuContainer.appendChild(this.batchRow);

        // Buttons
        this.buttonsContainer = document.createElement('div');
        this.buttonsContainer.classList.add('wheelstack-context-menu-buttons-row');
        this.buttonsContainer.id = 'wheelstackButtons';
        this.buttonsContainer.style.visibility = 'hidden';
        this.menuContainer.appendChild(this.buttonsContainer);

        this.blockedByRow = document.createElement('div');
        this.blockedByRow.classList.add('wheelstack-context-menu-row');
        this.blockedByRow.classList.add('blocked-by');
        const blockedByParag = document.createElement('p');
        this.blockedByRow.appendChild(blockedByParag);
        this.blockedByRow.style.display = 'none';
        this.buttonsContainer.appendChild(this.blockedByRow);
        
        if (OPERATOR_ROLE_NAME === role) {
            return this.menuContainer;
        }

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
            const storageId = this.elementData['placement']['placementId'];
            const batchNumber = this.elementData['batchNumber'];
            const wheelstackId = this.elementData['_id'];
            this.startMarking(storageId, batchNumber, wheelstackId);
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
                    if (STORAGE_NAME === this.elementData['placement']['type']) {
                        await createOrderMoveWholestackFromStorage(this.elementData, destinationData);
                    } else {
                        await createOrderMoveWholestackFromBaseGrid(this.elementData, destinationData);
                    } 
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
        this.moveStorageButton.addEventListener('click', (event) => {
            this.openExtraMenu(event, false, true);
        })
        this.buttonsContainer.appendChild(this.moveStorageButton);

        if (BASE_PLATFORM_NAME !== this.elementData['placement']['type']) {
            this.moveProcessingButton = document.createElement('button');
            this.moveProcessingButton.classList.add('wheelstack-context-menu-button');
            this.moveProcessingButton.classList.add('processing');
            this.moveProcessingButton.id = 'moveProcessingButton';
            this.moveProcessingButton.innerText = 'Обработка';
            this.moveProcessingButton.addEventListener('click', event => {
                this.openExtraMenu(event, true, false);

            })
            this.buttonsContainer.appendChild(this.moveProcessingButton);
            
            this.moveRejectedButton = document.createElement('button');
            this.moveRejectedButton.classList.add('wheelstack-context-menu-button');
            this.moveRejectedButton.classList.add('reject');
            this.moveRejectedButton.id = 'moveRejectedButton';
            this.moveRejectedButton.innerText = 'Отказ';
            this.moveRejectedButton.addEventListener('click', event => {
                this.openExtraMenu(event, false, false);
            })
            this.buttonsContainer.appendChild(this.moveRejectedButton);
        }

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
        this.stopMarking();
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
            // if (this.openerElement === event.target || this.openerElement.contains(event.target)) {
            //     return;
            // }
            if (this.extraMenuContainer && this.extraMenuContainer.contains(event.target)) {
                return;
            }
            if (this.wheelsMenu && this.wheelsMenu.contains(event.target)) {
                return;
            }
            if (ordersContextMenu.element && ordersContextMenu.element.contains(event.target)) {
                return;
            }
            if (batchesContextMenu.element && batchesContextMenu.element.contains(event.target)) {
                return;
            }
            if (batchesContextMenu.element && batchesContextMenu.extraMenuContainer && batchesContextMenu.extraMenuContainer.contains(event.target)) {
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
            this.menuContainer.remove();
        }
        if (!this.activeOrderMarking) {
            this.elementData = {}
        }
        this.lastChange = null;
        this.wheelElements = [];
        this.menuContainer = null;
        this.openedLastChange = null;
        this.openedPlacementId = null;
        this.openedPlacementType = null;
        this.openedRowPlacement = null;
        this.openedColPlacement = null;
        document.body.removeEventListener('pointerdown', this.menuCloser);
        this.stopUpdatingMenuData();
        this.chosenBatch = null;
        batchesContextMenu.removeMenu();
        if (this.extraMenuContainer) {
            this.extraMenuCloser(null, true);
        }
        if (this.wheelsMenu) {
            this.wheelsMenuCloser(null, true);
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