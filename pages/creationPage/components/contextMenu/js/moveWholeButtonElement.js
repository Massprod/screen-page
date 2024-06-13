import { ORDER_BUTTONS_TEXT, TEMPO_CONSTS } from "../../constants.js";



export default class MoveWholeButton{
    constructor(container) {
        this.container = container;
        this.element = document.createElement('button');
        this.element.className = TEMPO_CONSTS.WHEEL_CONTEXT_MENU_MOVE_WHEELSTACK_BUTTON;
        this.element.innerText = ORDER_BUTTONS_TEXT.WHOLE_STACK_INACTIVE;
        this.container.appendChild(this.element);
    }

    setButtonText(buttonText) {
        this.element.innerText = buttonText;
    }

    hideButton() {
        this.element.style.display = 'none';
    }

    showButton() {
        this.element.style.display = 'flex';
    }

    deactivate() {
        this.element.disabled = true;
    }

    activate() {
        this.element.disabled = false;
    }
}