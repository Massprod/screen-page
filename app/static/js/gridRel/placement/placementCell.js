// import { createWheelstackMenu, createBlockedCellMenu } from "../wheelstackMenu/wheelstackMenu.js";


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
        // this.element.addEventListener('contextmenu', async event => {
        //     event.preventDefault();
        //     if (this.wheelstackMenu) {
        //         this.wheelstackMenu.remove();
        //         this.wheelstackMenu = null;
        //     }
        //     if (this.historyData) {
        //         this.wheelstackMenu = await createWheelstackMenu(event, this.element, this.historyData);
        //     } else if (this.elementData && this.elementData['blocked']) {
        //         this.wheelstackMenu = await createBlockedCellMenu(event, this.element, this.elementData);
        //     }
        // })
    }

    setElementData(elementData) {
        this.elementData = elementData;
    }

    clearElementData() {
        this.elementData = null;
    }

    setAsIdentifier(identifier) {
        this.clearElementData();
        this.clearAttributes();
        this.element.classList = [];
        this.#addBasicStyle();
        this.element.classList.add('identifier-cell');
        this.element.innerHTML = `${identifier}`;
    }

    setAsWhitespace() {
        this.clearElementData();
        this.clearAttributes();
        this.element.classList = [];
        this.#addBasicStyle();
        this.element.id = 'whitespace';
        this.element.innerHTML = '';
        this.element.classList.add('placement-cell-whitespace');   
    }

    setAsEmptyCell() {
        this.clearElementData();
        this.element.innerHTML = '';
        this.element.classList.remove('placement-cell-whitespace');
        this.element.classList.add('placement-cell-empty');
    }

    setAsElement() {
        this.clearElementData();
        this.element.innerHTML = '';
        this.element.classList.remove('placement-cell-empty');
        this.element.classList.remove('placement-cell-whitespace');
    }

    blockState(blockedBy = null) {
        this.element.classList.add('blocked');
        if (blockedBy) {
            if (this.element.getAttribute('data-blocking-order') !== blockedBy) {
                this.element.setAttribute('data-blocking-order', blockedBy);
            }
        }
    }

    unblockState() {
        this.element.classList.remove('blocked');
    }

    clearBatchStatus() {
        this.element.classList.remove('batch-not-tested', 'batch-passed', 'batch-not-passed')
    }

    clearAttributes(ignored = new Set()) {
        const dataAttributes = [
            'data-batch-number', 'data-wheels', 'data-blocking-order'
        ];
        dataAttributes.forEach( element => {
            if (ignored.has(element)) {
                return;
            }
            this.element.removeAttribute(element);
        });
    }
}
