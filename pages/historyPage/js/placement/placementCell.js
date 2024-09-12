

export default class PlacementCell {
    constructor(
        rowId,
        colId,
        placementType,
    ) {
        this.rowId = rowId;
        this.colId = colId;
        this.placementType = placementType;
        this.elementData = null;
        this.elementHistoryData = null;
        this.#init();
    }

    #addBasicStyle() {
        this.element.classList.add('placement-cell');
        if ('grid' === this.placementType) {
            this.element.classList.add('grid-cell');
        } else if ('basePlatform' === this.placementType) {
            this.element.classList.add('baseplatform-cell');
        }
    }

    #init() {
        this.element = document.createElement('div');
        this.element.id = `${this.rowId}|${this.colId}`;
        this.element.classList.add('placement-cell');
        this.#addBasicStyle();
    }

    setElementData(elementData) {
        this.elementData = elementData;
    }

    setAsIdentifier(identifier) {
        this.element.classList = [];
        this.#addBasicStyle();
        this.element.classList.add('identifier-cell');
        const identifierParag = document.createElement('p');
        identifierParag.id = `${this.rowId}|${this.colId}`;
        identifierParag.innerText = `${identifier}`;
        this.element.appendChild(identifierParag);

    }

    setAsWhitespace() {
        this.element.classList = [];
        this.#addBasicStyle();
        this.element.id = 'whitespace';
        this.element.innerHTML = '';
        // this.element.classList.remove('placement-cell-empty');
        // this.element.classList.remove('placement-cell-element');
        this.element.classList.add('placement-cell-whitespace');   
    }

    setAsEmptyCell() {
        this.element.innerHTML = '';
        this.element.classList.remove('placement-cell-whitespace');
        // this.element.classList.remove('placement-cell-element');
        this.element.classList.add('placement-cell-empty');
    }

    setAsElement() {
        this.element.innerHTML = '';
        this.element.classList.remove('placement-cell-empty');
        this.element.classList.remove('placement-cell-whitespace');
        // this.element.classList.add('placement-cell-element');
    }

    blockState() {
        this.element.classList.add('blocked');
    }

    unblockState() {
        this.element.classList.remove('blocked');
    }
}
