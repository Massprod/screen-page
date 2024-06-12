import { BACK_GRID_NAMES, BACK_URLS, CLASS_NAMES } from "../../constants.js";
import { ORDER_MOVE_TYPES } from "../../constants.js";
import { ORDER_BUTTONS_TEXT } from "../../constants.js";
import flashMessage from "../../../../utility/flashMessage.js";


export default class OrderManager {
    constructor() {
        this.createWholeMoveUrl = BACK_URLS.POST_ORDER_WHOLE_STACK_URL;

        this.creatingOrder = false;
        
        this.chosenSource = null;
        this.sourceRow = null;
        this.sourceColumn = null;

        this.chosenDestination = null;
        this.destinationRow = null;
        this.destinationColumn = null;

        this.assignedButtonElement = null;
    }

    async #fetchCreateOrder(url, data) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            // console.log(response);
            if (!response.ok) {
                if (409 === response.status) {
                    return response
                }
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const wheelStackData = await response.json();
            return wheelStackData;
        } catch (error) {
            console.error('Error fetching creation of the order:', error);
            throw error;
        }
    }

    async createOrder(moveType) {
        const orderRequestData = {}
        orderRequestData['source'] = {
            'identifier': `${this.sourceRow},${this.sourceColumn}`,
            'type': this.chosenSource,
        }
        orderRequestData['destination'] = {
            'identifier': `${this.destinationRow},${this.destinationColumn}`,
            'type': this.chosenDestination,
        }
        orderRequestData['orderDescription'] = 'Moving whole stack';
        orderRequestData['orderName'] = 'We need to remove it, no reasons for name + desc';
        orderRequestData['orderType'] = moveType;
        if (moveType === ORDER_MOVE_TYPES.WHOLE_STACK) {
            const response = await this.#fetchCreateOrder(this.createWholeMoveUrl, orderRequestData);
            // Change them to constants later.
            // All httpErrors in constant to made check more readable.
            // Add all flashMessages as constants, so we could change them easily.
            // Also make flashMessages styling as constants, so we can reuse and change them in 1 place.
            if (409 === response.status) {
                flashMessage.show({
                    message: 'Выбранная стопка уже отмечена к перемещению другим заказом.'
                              + '\nЛибо выбранная позиция уже ожидает помещения Стопки.',
                    color: 'white',
                    backgroundColor: 'black',
                    position: 'top-center',
                    duration: 3000,
                  });
            }
        }
        this.cancelCreation();
    }

    setSource(targetWheelstack) {
        const targetWheelstackPlacement = targetWheelstack.container.parentNode.className;
        // console.log(targetWheelstackPlacement);
        const targetRowPlacement = targetWheelstack.rowPlacement;
        const targetColPlacement = targetWheelstack.colPlacement;
        if (CLASS_NAMES.BASE_PLATFORM === targetWheelstackPlacement) {
            this.chosenSource = BACK_GRID_NAMES.BASE_PLATFORM;
        } else if (CLASS_NAMES.GRID === targetWheelstackPlacement) {
            this.chosenSource = BACK_GRID_NAMES.GRID;
        }
        this.sourceRow = targetRowPlacement;
        this.sourceColumn = targetColPlacement
    }

    setDestination(targetWheelstack) {
        const targetWheelstackPlacement = targetWheelstack.container.parentNode.className;
        // console.log(targetWheelstackPlacement);
        const targetRowPlacement = targetWheelstack.rowPlacement;
        const targetColPlacement = targetWheelstack.colPlacement;
        if (CLASS_NAMES.BASE_PLATFORM === targetWheelstackPlacement) {
            this.chosenDestination = BACK_GRID_NAMES.BASE_PLATFORM;
        } else if (CLASS_NAMES.GRID === targetWheelstackPlacement) {
            this.chosenDestination = BACK_GRID_NAMES.GRID;
        }
        this.destinationRow = targetRowPlacement;
        this.destinationColumn = targetColPlacement
    }

    toggleCreation() {
        this.creatingOrder = true;
        this.assignedButtonElement.innerText = ORDER_BUTTONS_TEXT.WHOLE_STACK_ACTIVE;
    }

    cancelCreation() {
        this.creatingOrder = false;
        this.assignedButtonElement.innerText = ORDER_BUTTONS_TEXT.WHOLE_STACK_INACTIVE;
    }

    assignWholeOrderButton(buttonElement) {
        this.assignedButtonElement = buttonElement;
    }
}


