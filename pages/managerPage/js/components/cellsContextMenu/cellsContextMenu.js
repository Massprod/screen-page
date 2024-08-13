import flashMessage from "../../../../utility/flashMessage.js";
import { gridManager, platformManager, ordersContextMenu, batchesContextMenu } from "../../mainScript.js";
import { BACK_URLS, FLASH_MESSAGES, LABORATORY_NAME } from "../../constants.js";



export default class CellsContextMenu{
    constructor(
        targetClass,
        createMoveWholeURL,
    ) {
        this.targetClass = targetClass;
        this.createMoveWholeURL = createMoveWholeURL;
        this.#init();
        this.gridCellsOrderExecuteListeners = new Map();
    }

    async #postOrder(url, orderBody) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderBody)
            });
            console.log(orderBody);
            console.log(response);
            if (!response.ok) {
                flashMessage.show({
                    message: `Ошибка при создании заказа: ${response.status}`,
                    color: FLASH_MESSAGES.FETCH_ERROR_FONT_COLOR,
                    backgroundColor: FLASH_MESSAGES.FETCH_ERROR_BG_COLOR,
                    position: 'top-center',
                    duration: 5000,
                });
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const orderData = await response.json();
            return orderData;
        } catch (error) {
            console.error('Error fetching creation of the order:', error);
            throw error;
        }
    }

    async #getOrderdata(url) {
        try {
            const response = await fetch(url);
            if (response.status === 404) {
                return null;
            }
            if (!response.ok) {
                flashMessage.show({
                    message: `Ошибка при получении данных заказа: ${response.status}`,
                    color: FLASH_MESSAGES.FETCH_ERROR_FONT_COLOR,
                    backgroundColor: FLASH_MESSAGES.FETCH_ERROR_BG_COLOR,
                    position: 'top-center',
                    duration: 5000,
                });
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const orderData = await response.json();
            return orderData;
        } catch (error) {
            console.error('Error getting data of the order:', error);
            throw error;
        }
    }

    async getWheelData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                flashMessage.show({
                    message: `Ошибка при получении данных о колесе: ${response.status}`,
                    color: FLASH_MESSAGES.FETCH_ERROR_FONT_COLOR,
                    backgroundColor: FLASH_MESSAGES.FETCH_ERROR_BG_COLOR,
                    position: 'top-center',
                    duration: 2000,
                });
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const orderData = await response.json();
            return orderData;
        } catch (error) {
            console.error('Error getting data of the wheel:', error);
            throw error;
        }
    }

    #init() {
        const allTargets = document.querySelectorAll(`.${this.targetClass}`);
        allTargets.forEach(async (target) => {
            target.addEventListener("contextmenu", (event) => {
                event.preventDefault();
                if (this.activeOrderMarking && !this.sourceData['targetElement'].contains(event.target)) {
                    return;
                }
                const [ cellRow, cellCol ] = target.id.split('|')
                // console.log(cellRow);
                // console.log(cellCol);
                let cell = null;
                if (target.classList.contains("cell-grid")) {
                    cell = gridManager.gridRows[cellRow].columns[cellCol]
                } else {
                    cell = platformManager.platformRows[cellRow].columns[cellCol];
                }
                this.buildMenu(event, cell)
            })
        })
    }


    // 
    // +++ WHEELS_MENU
    async buildWheelMenu(event1, wheelId) {
        if (this.blockedWheel) {
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
        this.wheelsMenu.classList.add("cell-extra-elements-menu-container");
        this.wheelsMenu.id = "wheelMenu";
        const labButton = document.createElement("button");
        labButton.classList.add("cell-context-menu-button");
        labButton.classList.add("reject");
        labButton.id = "wheelToLab";
        labButton.innerHTML = "Лаборатория";
        labButton.addEventListener("click", async (eve1) => {
            const moveToLabURL = `${BACK_URLS.CREATE_MOVE_TO_LAB_ORDER}`;
            const elementData = this.targetCell.elementData; 
            const moveToLabBody = {
                "orderName": "AutoGenerated-MoveToLaboratory",
                "orderDescription": "AutoGenerated-MoveToLaboratory",
                "source": {
                    "placementType": elementData['placement']['type'],
                    "placementId": elementData['placement']['placementId'],
                    "rowPlacement": elementData['rowPlacement'],
                    "columnPlacement": elementData['colPlacement'],
                },
                "destination": {
                    "placementType": elementData['placement']['type'],
                    "placementId": elementData['placement']["placementId"],
                    "elementName": LABORATORY_NAME,
                },
                "chosenWheel": wheelId,
            }
            await this.#postOrder(moveToLabURL, moveToLabBody);
            this.wheelsMenuCloser(eve1, true);
        })
        this.wheelsMenu.appendChild(labButton);
        document.body.addEventListener('pointerdown', this.wheelsMenuCloser);
        document.body.appendChild(this.wheelsMenu);
        await this.updateMenuPosition(event1, this.wheelsMenu);
    }

    // WHEELS_MENU ---
    // +++ EXTRA_ELEMENTS_MENU
    createProRejOrder(elementData, extraElement, processing) {
        let createOrderURL = `${BACK_URLS.CREATE_MOVE_TO_PROCESSING_ORDER}`;
        let orderName = "AutoGenerated-MoveToProcessing";
        let orderDesc = "AutoGenerated-MoveToProcessing";
        if (!processing) {
            createOrderURL = `${BACK_URLS.CREATE_MOVE_TO_REJECTED_ORDER}`;
            orderName = "AutoGenerated-MoveToRejected";
            orderDesc = "AutoGenerated-MoveToProcessing";
        }
        const createOrderBody = {
            "orderName": orderName,
            "orderDescription": orderDesc,
            "source": {
                "placementType": elementData['placement']['type'],
                "placementId": elementData['placement']['placementId'],
                "rowPlacement": elementData['rowPlacement'],
                "columnPlacement": elementData['colPlacement'],
            },
            "destination": {
                "placementType": elementData['placement']['type'],
                "placementId": elementData['placement']["placementId"],
                "elementName": extraElement,
            },
        }
        const resp = this.#postOrder(createOrderURL, createOrderBody);
        return resp;
    }

    async #buildExtraMenu(event, processing = true, lab = false) {
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

        this.createProcessingRejectOrders = async (event, processing = false, extraElement) => {
            this.extraMenuCloser(event, true);
            if (!this.chosenBatch) {
                const res = await this.createProRejOrder(this.targetCell.elementData, extraElement, processing);
            } else {
               // TODO: ADD full batch orders creation.
            }
        }

        document.body.addEventListener("pointerdown", this.extraMenuCloser);
        this.extraMenuContainer = document.createElement('div');
        this.extraMenuContainer.classList.add('cell-extra-elements-menu-container');
        this.extraMenuContainer.id = "cellExtraMenu";
        const gridExtraElements = gridManager.extraElements;
        for (let extraElement in gridExtraElements) {
            if (extraElement === LABORATORY_NAME) {
                continue;
            }
            const extraElementButton = document.createElement("button");
            extraElementButton.classList.add('cell-context-menu-button');
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
                console.log(processing);
                this.createProcessingRejectOrders(event, processing, extraElement);
            })
            this.extraMenuContainer.appendChild(extraElementButton);
            this.extraMenuContainer.appendChild(extraElementButton);
        }
        document.body.appendChild(this.extraMenuContainer);
        await this.updateMenuPosition(event, this.extraMenuContainer);
    }
    // EXTRA_ELEMENTS_MENU ---

    // +++ BUTTONS
    #clearButtonsRow() {
        if (this.buttonsRow) {
            this.buttonsRow.remove();
            this.buttonsRow = null
        }
        if (this.orderRow) {
            this.orderRow.remove();
            this.orderRow = null;
        }
    }

    async #buildBlockedRow() {
        if (!this.targetCell) {
            return;
        }
        this.#clearButtonsRow();
        const orderId = this.targetCell.data['blockedBy'];
        this.orderRow = document.createElement('div');
        this.orderRow.classList.add('cell-context-menu-row');
        this.orderRow.classList.add('blocked-by');
        this.orderRow.id = 'blockedBy';
        const parag = document.createElement('p');
        parag.innerHTML = `Ожидает: ${orderId}`;
        parag.id = orderId;
        this.orderRow.appendChild(parag);
        this.orderRow.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            ordersContextMenu.showMenu(orderId, event);
        })
        this.element.appendChild(this.orderRow); 
    }
    
    async #clearHandleOrderExecute() {
        this.activeOrderMarking = false;
        this.moveButton.classList.remove('order-marking');
        // console.log(this.sourceData);
        this.sourceData['targetElement'].classList.remove('mark-source');
        const markedCells = document.querySelectorAll(".cell-grid.mark-available");
        markedCells.forEach((element) => {
            element.classList.remove('mark-available');
            const handleOrderExecute = this.gridCellsOrderExecuteListeners.get(element);
            if (handleOrderExecute) {
                element.removeEventListener("contextmenu", handleOrderExecute);
                this.gridCellsOrderExecuteListeners.delete(element);
            }
        })
        document.removeEventListener("dblclick", this.cancelOrderCreation);
        this.sourceData = null;
        this.#buildButtonsRow();
        this.#buildWheels();
    }


    async moveElementOrder(event) {
        this.sourceData['targetElement'].classList.remove('mark-source');
        const sourceRow = this.sourceData['cellRow'];
        const sourceCol = this.sourceData['cellCol'];
        const sourcePlacementData = this.sourceData['placementData'];
        const [ destinationRow, destinationCol ] = event.target.id.split('|');
        const destinationType = "grid"  // Only GRID can be a Destination in our case.
        const destinationId = gridManager.gridId;
        let createOrderRequestBody = {
            "orderName": "AutoGenerated-MoveWholeElement",
            "orderDescription": "AutoGenerated-MoveWholeElement",
            "source": {
                "placementType": sourcePlacementData['type'],
                "placementId": sourcePlacementData['placementId'],
                "rowPlacement": sourceRow,
                "columnPlacement": sourceCol,
            },
            "destination": {
                "placementType": destinationType,
                "placementId": destinationId,
                "rowPlacement": destinationRow,
                "columnPlacement": destinationCol,
            },
            "orderType": "moveWholeStack",
        };
        const createOrderUrl = `${this.createMoveWholeURL}`
        await this.#postOrder(createOrderUrl, createOrderRequestBody);
        await this.#clearHandleOrderExecute();
    }


    async #buildButtonsRow() {
        if (!this.targetCell) {
            return;
        };
        this.#clearButtonsRow();
        this.buttonsRow = document.createElement('div');
        this.buttonsRow.classList.add("cell-context-menu-buttons-row");
        this.buttonsRow.id = "cellActions";
        this.moveButton = document.createElement('button');
        this.moveButton.classList.add("cell-context-menu-button");
        this.moveButton.classList.add("move");
        if (this.activeOrderMarking) {
            this.moveButton.classList.add("order-marking");
            this.moveButton.innerHTML = `<b>Отменить выбор</b>`;
        } else {
            this.moveButton.innerHTML = `<b>Перенести</b>`;
        }
        this.moveButton.id = "moveElement";
        this.buttonsRow.appendChild(this.moveButton);
        this.moveButton.addEventListener("click", async () => {
            this.sourceData = {
                "cellRow": this.targetCell.cellRowId,
                "cellCol": this.targetCell.cellColId,
                "placementData": this.targetCell.elementData['placement'],
                "targetElement": this.targetCell.element,
            }
            if (!this.activeOrderMarking) {
                // +++ MOVEWHOLE_FOR_EMPTY_CELLS
                this.activeOrderMarking = true;
                this.targetCell.element.classList.add('mark-source');
                const gridCells = document.querySelectorAll('.cell-grid.cell-empty');
                gridCells.forEach( (element) => {
                    element.classList.add('mark-available');
                    const handleOrderExecute = async (event) => await this.moveElementOrder(event);
                    element.addEventListener("contextmenu", handleOrderExecute);
                    this.gridCellsOrderExecuteListeners.set(element, handleOrderExecute);
                    this.moveButton.classList.add('order-marking');
                    this.moveButton.innerHTML = `<b>Отменить выбор</b>`;
                })
                this.cancelOrderCreation  = () => {
                    this.#clearHandleOrderExecute();
                }
                document.addEventListener("dblclick", this.cancelOrderCreation);
                if (this.processingButton) {
                    this.processingButton.remove();
                }
                if (this.rejectButton) {
                    this.rejectButton.remove();
                }
            } else {
                await this.#clearHandleOrderExecute();
            }
        })
        // MOVEWHOLE_FOR_EMPTY_CELLS ---
        const cellPlacementType = this.targetCell.elementData['placement']['type'];
        if (!this.activeOrderMarking && "grid" === cellPlacementType) {
            this.processingButton = document.createElement('button');
            this.processingButton.classList.add("cell-context-menu-button");
            this.processingButton.classList.add("processing");
            this.processingButton.id = "moveProcessing";
            this.processingButton.innerHTML = `✓`
            this.processingButton.addEventListener("click", (event) => {
                this.#buildExtraMenu(event, true);
            })
            this.buttonsRow.appendChild(this.processingButton);
            this.rejectButton = document.createElement('button');
            this.rejectButton.classList.add("cell-context-menu-button");
            this.rejectButton.classList.add("reject");
            this.rejectButton.id = "moveRejected";
            this.rejectButton.innerHTML = "✗";
            this.rejectButton.addEventListener("click", (event) => {
                this.#buildExtraMenu(event, false);
            })
            this.buttonsRow.appendChild(this.rejectButton);
        }
        this.element.appendChild(this.buttonsRow);
    }


    async #checkBlock() {
        if (!this.targetCell.data){
            return;
        }
        const cellData = this.targetCell.data;
        if (!this.orderRow && cellData['blocked']) {
            await this.#buildBlockedRow();
            await this.#buildWheels();
        } else if (!this.buttonsRow && !cellData['blocked']) {
            await this.#buildButtonsRow();
            await this.#buildWheels();
        }
    }
    // BUTTONS --- 

    // +++ WHEELS   
    async #createWheelRow(wheelId) {
        const wheelRow = document.createElement('div');
        wheelRow.id = wheelId;
        wheelRow.classList.add("cell-context-menu-row");
        if (this.blockedWheel === wheelId) {
            wheelRow.classList.add("wheel-blocked");
            wheelRow.id = this.wheelBlockingOrder;
        } else if (this.targetCell.elementData && this.targetCell.elementData['placement']['type'] === "grid") {
            wheelRow.addEventListener("click", (event) => {
                this.buildWheelMenu(event, wheelId)
            });
        }
        const wheelDataURL = `${BACK_URLS.GET_WHEEL_DATA_BY_OBJECT_ID}/${wheelId}`;
        const wheelData = await this.getWheelData(wheelDataURL);
        const parag = document.createElement('p');
        parag.innerHTML = `${wheelData['wheelId']}`;
        wheelRow.appendChild(parag);
        return wheelRow;
    }


    async #buildWheels() {
        if (!this.element || !this.targetCell) {
            return;
        }
        this.wheels = {};
        if (this.wheelsContainer) {
            this.wheelsContainer.remove();
            this.wheelsContainer = null;
            this.chosenBatch = null;
        }
        if (this.targetCell && !this.targetCell.elementData) {
            return;
        }
        this.wheelsContainer = document.createElement('div');
        this.wheelsContainer.classList.add('cell-context-menu-wheels-container');
        this.wheelsContainer.id = 'curWheels';
        this.element.appendChild(this.wheelsContainer);
        this.blockedWheel = null;
        this.wheelBlockingOrder = null;
        if (this.targetCell.elementData && this.targetCell.elementData['blocked']) {
            const getOrderDataUrl = `${BACK_URLS.GET_ORDER_DATA_BY_ID}/${this.targetCell.elementData['lastOrder']}?active_orders=true&completed_orders=false&canceled_orders=false`;
            const orderData = await this.#getOrderdata(getOrderDataUrl);
            if (orderData) {
                if ("moveToLaboratory" === orderData['orderType']) {
                    this.wheelBlockingOrder = this.targetCell.elementData['lastOrder'];
                    this.blockedWheel = orderData['affectedWheels']['source'][0];
                }
            }
        }
        const corWheelsOrder = this.targetCell.elementData['wheels'];
        for (let index = corWheelsOrder.length - 1; index >= 0; index -= 1) {
            let wheelId = corWheelsOrder[index];
            let newWheel = await this.#createWheelRow(wheelId);
            this.wheelsContainer.appendChild(newWheel);
            this.wheels[wheelId] = newWheel;
        }
        // BATCH row
        this.batchRow = document.createElement("div");
        this.batchRow.classList.add("cell-context-menu-row");
        this.batchRow.classList.add("batch-row");
        const batchNumber = this.targetCell.elementData['batchNumber'];
        this.batchRow.id = batchNumber;
        const batchParag = document.createElement("p");
        batchParag.innerHTML = `<b>Партия</b> ${batchNumber}`;
        this.batchRow.appendChild(batchParag);
        if (batchesContextMenu.markingBatch && batchNumber === batchesContextMenu.markingBatch) {
            this.batchRow.classList.add('batch-mark');
            this.chosenBatch = batchNumber;
        }
        this.batchRow.addEventListener("click", (event) => {
            if (!this.chosenBatch) {
                this.chosenBatch = batchNumber;
                this.batchRow.classList.add("batch-mark");
                batchesContextMenu.markBatch(batchNumber);
            } else {
                this.chosenBatch = null;
                this.batchRow.classList.remove("batch-mark");
                batchesContextMenu.unmarkBatch(batchNumber);
            }
        })
        this.batchRow.addEventListener("contextmenu", (event) => {
            if (this.batchRow.contains(event.target)) {
                batchesContextMenu.buildMenu(event, this.batchRow.id);
            }
        })

        this.wheelsContainer.appendChild(this.batchRow);
        // ---
    }
    // WHEELS ---

    async buildMenu(event, targetCell) {
        if (!targetCell.data['wheelStack'] && !targetCell.data['blockedBy']) {
            return;
        }
        this.targetCell = targetCell;
        if (!this.menuCloser) {
            this.menuCloser = (event) => {
                // console.log(event.target);
                // console.log(this.element.contains(event.target));
                // console.log(ordersContextMenu.element);
                if (!this.element) {
                    return;
                }
                if (!this.element.contains(event.target)) {
                    if (ordersContextMenu.element && ordersContextMenu.element.contains(event.target)) {
                        return
                    }
                    if (this.extraMenuContainer && this.extraMenuContainer.contains(event.target)) {
                        return;
                    }
                    if (this.wheelsMenu && this.wheelsMenu.contains(event.target)) {
                        return;
                    }
                    if (batchesContextMenu.element && batchesContextMenu.element.contains(event.target)) {
                        return;
                    }
                    this.hideMenu();
                }
            }
        }
        document.addEventListener('pointerdown', this.menuCloser)
        if (!this.element) {
            this.element = document.createElement('div');
            this.element.classList.add("cell-context-menu-container");
            document.body.appendChild(this.element);
            this.element.addEventListener('contextmenu', (event) => {
                event.preventDefault();
            })
        } else {
            this.element.innerHTML = '';
            this.wheels = {};
        }
        const elementData = this.targetCell.elementData;
        if (elementData) {
            if (this.targetCell.data['blockedBy']) {
                await this.#buildBlockedRow();
            } else {
                await this.#buildButtonsRow();
            }
            await this.#buildWheels();
        } else if (this.targetCell.data['blockedBy']) {
            await this.#buildBlockedRow();
        }
        await this.updateMenuPosition(event, this.element);
        this.startUpdating();
    }


    hideMenu() {
        document.removeEventListener('pointerdown', this.menuCloser);
        this.menuCloser = null;
        this.element.remove();
        this.element = null;
        this.targetCell = null;
        this.wheels = {};
        this.stopUpdating();
        ordersContextMenu.removeMenu();
        batchesContextMenu.removeMenu();
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
    
    

    #isEmpty() {
        if (!this.targetCell) {
            return;
        }
        if (!this.targetCell.data['blocked'] && !this.targetCell.elementData) {
            this.hideMenu();
        }
    }

    startUpdating() {
        if (this.menuUpdatingInterval) {
            return;
        }
        this.menuUpdatingInterval = setInterval( async () => {
            // this.#cullExpired();
            await this.#checkBlock();
            this.#isEmpty();
        }, 100);
    }
    
    stopUpdating() {
        if (!this.menuUpdatingInterval) {
            return;
        }
        clearInterval(this.menuUpdatingInterval);
        this.menuUpdatingInterval = null;
    }
}