import WheelContextMenuManager from "./wheelContextMenuManager.js";


const wheelContextMenuManager = new WheelContextMenuManager();

export default class WheelElement {
    constructor(className) {
        this.emptyMark = 'Empty wheel spot';
        this.element = document.createElement('div');
        this.element.className = className;
        this.element.innerHTML = this.emptyMark;
        this.wheelId = null;

        // tempo menu
        this.wheelContextMenuManager = wheelContextMenuManager;
        this.element.addEventListener('click', (event) => {
            // console.log(this.wheelId);
            this.wheelContextMenuManager.showWheel(event, this);
        })
        // ---
    }

    setWheel(wheelId) {
        this.wheelId = wheelId;
        this.element.innerHTML = this.wheelId;
    }

    clearWheel() {
        this.wheelId = null;
        this.element.innerHTML = this.emptyMark;
    }

}

