

export default class Cell{
    constructor(container) {
        this.container = container;
        this.#init();
        this.data = {};
        this.objectData = {};
    }

    #init() {
        this.element = document.createElement("div");
        this.element.className = "cell";
        this.container.appendChild(this.element);
    }

    setAsWhitespace() {
        this.element.classList = [];
        this.element.classList.add("cell-whitespace");
    }
    
    setAsIdentifier(identifierString) {
        this.element.classList = [];
        this.element.classList.add("cell-identifier");
        this.element.innerHTML = identifierString;
    }
}
