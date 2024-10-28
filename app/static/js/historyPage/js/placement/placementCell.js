import { createWheelstackMenu, createBlockedCellMenu } from "../wheelstackMenu/wheelstackMenu.js";


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
        this.historyData = null;
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
        // TODO: We shouldn't be stacked with other elements attached to the class.
        //  But I don't see any other way of connecting menu to this.
        //  Otherwise we will need extra O(n) traverse of all created elements
        //   and attach menu from `main`.
        //  Which is essentially the same and we still need to import menu...
        this.element.addEventListener('click', async event => {
            event.preventDefault();
            if (this.wheelstackMenu) {
                this.wheelstackMenu.remove();
                this.wheelstackMenu = null;
            }
            if (this.historyData) {
                this.wheelstackMenu = await createWheelstackMenu(event, this.element, this.historyData);
            } else if (this.elementData && this.elementData['blocked']) {
                this.wheelstackMenu = await createBlockedCellMenu(event, this.element, this.elementData);
            }
        })
    }

    setElementData(elementData) {
        this.elementData = elementData;
    }

    setAsIdentifier(identifier) {
        this.element.classList = [];
        this.historyData = null;
        this.#addBasicStyle();
        this.element.classList.add('identifier-cell');
        this.element.innerHTML = `${identifier}`;
        // const identifierParag = document.createElement('p');
        // identifierParag. = `${this.rowId}|${this.colId}`;
        // identifierParag.innerText = `${identifier}`;
        // this.element.appendChild(identifierParag);

    }

    setAsWhitespace() {
        this.element.classList = [];
        this.historyData = null;
        this.#addBasicStyle();
        this.element.id = 'whitespace';
        this.element.innerHTML = '';
        // this.element.classList.remove('placement-cell-empty');
        // this.element.classList.remove('placement-cell-element');
        this.element.classList.add('placement-cell-whitespace');   
    }

    setAsEmptyCell() {
        this.element.innerHTML = '';
        this.historyData = null;
        this.element.classList.remove('placement-cell-whitespace');
        // this.element.classList.remove('placement-cell-element');
        this.element.classList.add('placement-cell-empty');
        this.element.removeAttribute('data-batch-number');
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

    clearBatchStatus() {
        this.element.classList.remove('batch-not-tested', 'batch-passed', 'batch-not-passed')
    }

    clearAttributes() {
        const dataAttributes = ['data-batch-number', 'data-wheels']
        for (let attName of dataAttributes) {
            this.element.removeAttribute(attName);
        }
    }
}
