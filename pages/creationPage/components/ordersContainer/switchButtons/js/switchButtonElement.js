


export default class SwitchButton{
    constructor(
        buttonName
    ) {
        this.buttonName = buttonName;
        this.element = this.#init();
    }

    #init() {
        const element = document.createElement('button');
        element.className = 'switch-button';
        element.textContent = this.buttonName;
        return element;
    }

    makeActive() {
        if (this.element.classList.contains('active')) {
            return false;
        }
        this.element.classList.add('active');
        return true;
    }

    makeIdle() {
        if (!this.element.classList.contains('active')) {
            return false;
        }
        this.element.classList.remove('active');
        return true;
    }
}
