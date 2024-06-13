

export default class CancelMoveWholeButton{
    constructor(container) {
        this.container = container;
        this.element = document.createElement('button');
        this.element.className = 'context-menu-cancel-move-wheelstack-button';
        this.element.innerText = 'Cancel';
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
}
