import Fuse from "../../fuse/fuse.js";
import { BASIC_ATTRIBUTES, BASIC_INFO_MESSAGE_WARNING } from "../../uniConstants.js";
import flashMessage from "../flashMessage/flashMessage.js";


export default class BasicSearcher{
    constructor(
        searchForm,
        searchField,
        searchFieldClearButton = null,
        resultsElement,
        resultCallback,
        clearCallback = null,
        menuCallback = null,
        usedKey = null,
        ignoredRecords = null,
        // storeActualData = false,
    ) {
        this.searchForm = searchForm;
        this.searchField = searchField;
        this.resultsElement = resultsElement;
        this.resultCallback = resultCallback;
        this.clearCallback = clearCallback;
        this.searchFieldClearButton = searchFieldClearButton;
        this.menuCallback = menuCallback;
        this.openedMenu = null;
        this.fuse = null;
        this.fuseOptions = null;
        this.ignoredRecords = ignoredRecords;
        // this.storeActualData = storeActualData;
        this.usedKey = usedKey;
        this.searchData = [];
        this.activeIndex = -1;
        this.#init();
    }

    #init() {
        this.searchField.addEventListener('focus', (event) => {this.handleSearchFocus()});
        this.searchField.addEventListener('input', (event) => {this.handleSearchInput()});
        this.searchField.addEventListener('keydown', (event) => {this.handleSearchKeydown(event)});
        this.searchField.addEventListener('click', (event) => {
            if ('' !== this.resultsElement.innerHTML.trim()) {
                this.resultsElement.classList.add('show');
            }
        })

        this.searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            this.triggerSubmitAction(this.searchField.value);
        });
        this.menuClickCheck = (event) => {
            if (this.openedMenu && this.openedMenu.contains(event.target)) {
                return;
            }
            if (!(this.resultsElement.contains(event.target)) && event.target !== this.searchField) {
                this.resultsElement.contains(event.target)
                this.resultsElement.innerHTML = '';
                this.clearDependencies();
            }
        }
        document.addEventListener('click', this.menuClickCheck)
        if (this.searchFieldClearButton && this.clearCallback) {
            this.searchFieldClearButton.addEventListener('click', event => {
                event.preventDefault();
                this.clearCallback();
                this.searchField.value = '';
            })
        }
    }

    clearListeners() {
        document.removeEventListener('click', this.menuClickCheck);
    }

    clearDependencies() {
        this.resultsElement.classList.remove('show');
        this.openedMenu = null;
    }

    triggerSubmitAction(
        selectedValue,
        // assignAttributes = {},
    ) {
        this.resultsElement.innerHTML = '';
        this.searchField.value = selectedValue;
        // for (let attribute of Object.keys(assignAttributes)) {
        //     this.searchField.setAttribute(attribute, JSON.stringify(assignAttributes[attribute]));
        // }
        this.resultCallback(selectedValue);
        this.openedMenu = null;
        this.clearDependencies();
    }

    updateActiveItem(items) {
        items.forEach(item => {
            item.classList.remove('active');
            if (0 <= this.activeIndex) {
                items[this.activeIndex].classList.add('active');
                items[this.activeIndex].scrollIntoView({ block: 'nearest' });
            }
        })
    }

    showAllOptions() {
        this.resultsElement.innerHTML = '';
        this.activeIndex = -1;
        if (this.searchData.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.textContent = 'Нет данных для отображения';
            emptyItem.classList.add('text-muted', 'p-2');
            this.resultsElement.appendChild(emptyItem);
        } else {
            this.searchData.forEach(item => {
                const itemData = this.usedKey ? item[this.usedKey] : item;
                if (this.ignoredRecords && this.searchField.value !== itemData && itemData in this.ignoredRecords) {
                    return;
                };
                const li = document.createElement('li');
                li.classList.add('dropdown-item')
                li.textContent = itemData;
                // let newAttributes = {}
                // if (this.storeActualData) {
                //     newAttributes[BASIC_ATTRIBUTES.WHEELSTACK_DATA] = item;
                // }
                li.addEventListener('click', () => {
                    this.triggerSubmitAction(
                        itemData,
                        // newAttributes,
                    );
                    this.clearDependencies();
                })
                // + BATCH MENU +
                if (this.menuCallback) {
                    li.addEventListener('contextmenu', async (event) => {
                        event.preventDefault();
                        this.openedMenu = await this.menuCallback(event, li, itemData);
                    })
                }
                // - BATCH MENU -
                this.resultsElement.appendChild(li);
            })    
        }

        if (0 === this.resultsElement.childNodes.length) {
            const emptyItem = document.createElement('li');
            emptyItem.textContent = 'Нет совпадений';
            emptyItem.classList.add('dropdown-item', 'text-muted', 'p-2');
            this.resultsElement.appendChild(emptyItem);
        }

        this.resultsElement.classList.add('show');
    }

    handleSearchFocus() {
        const curValue = this.searchField.value.trim();
        if (!curValue) {
            this.showAllOptions();
        } else {
            this.handleSearchInput();
        }
    }

    handleSearchInput(currentValue = null) {
        if (!this.fuse) {
            console.warn('Fuse instance is not initialized. Set data and options first.');
            return;
        }
        const curQuery = this.searchField.value.trim();
        if (!this.searchData || 0 === this.searchData.length || '' === curQuery) {
            this.showAllOptions();
        } else {
            const curResults = this.fuse.search(curQuery);
            this.resultsElement.innerHTML = '';
            this.activeIndex = -1;
            if (0 === curResults.length) {
                const emptyItem = document.createElement('li');
                emptyItem.textContent = 'Нет совпадений';
                emptyItem.classList.add('dropdown-item', 'text-muted', 'p-2');
                this.resultsElement.appendChild(emptyItem);
            } else {
                curResults.forEach((result, index) => {
                    const searchRes = result.item;
                    const resultData = this.usedKey ? searchRes[this.usedKey] : searchRes;
                    if (this.ignoredRecords && this.searchField.value !== resultData && resultData in this.ignoredRecords) {
                        return;
                    }
                    const resultItem = document.createElement('li');
                    resultItem.classList.add('dropdown-item');
                    // let newAttributes = {};
                    // if (this.storeActualData) {
                    //     newAttributes[BASIC_ATTRIBUTES.WHEELSTACK_DATA] = searchRes;
                    // }
                    resultItem.textContent = resultData;
                    resultItem.addEventListener('click', () => {
                        this.triggerSubmitAction(
                            resultData,
                            //  newAttributes,
                        );
                    });
                    // + BATCH MENU +
                    if (this.menuCallback) {
                        resultItem.addEventListener('contextmenu', async (event) => {
                            event.preventDefault();
                            this.openedMenu = await this.menuCallback(event, resultItem, resultData);
                        })
                    }
                    // - BATCH MENU -
                    this.resultsElement.appendChild(resultItem);
                });
            }
        }

        if (0 === this.resultsElement.childNodes.length) {
            const emptyItem = document.createElement('li');
            emptyItem.textContent = 'Нет совпадений';
            emptyItem.classList.add('dropdown-item', 'text-muted', 'p-2');
            this.resultsElement.appendChild(emptyItem);
        }

        if (curQuery) {
            this.resultsElement.classList.add('show');
        } else {
            this.clearDependencies();
        }
    }

    handleSearchKeydown(event) {
        const items = this.resultsElement.querySelectorAll('.dropdown-item');
        if ('ArrowDown' === event.key) {
            if (this.activeIndex < items.length - 1) {
                this.activeIndex += 1;
                this.updateActiveItem(items);
            }
        } else if ('ArrowUp' === event.key) {
            if (this.activeIndex > 0) {
                this.activeIndex -= 1;
                this.updateActiveItem(items);
            }
        } else if ('Enter' === event.key) {
            event.preventDefault();
            if (0 !== items.length && 0 <= this.activeIndex) {
                items[this.activeIndex].click();
            } else {
                this.triggerSubmitAction(this.searchField.value);
            }
        }
    }

    setOptions(options) {
        if (!options) {
            throw new Error(`Empty options: ${options}`);
        }
        this.fuseOptions = options;
        this.fuse = new Fuse(this.searchData, options);
    }

    setData(newData) {
        if (!newData || !(Array.isArray(newData))) {
            throw new Error(`Invalid data provided. Data should be a non-empty array`);
        }
        this.searchData = newData;
        if (this.fuse) {
            this.fuse.setCollection(this.searchData);
        } else if (this.fuseOptions) {
            this.fuse = new Fuse(this.searchData, this.fuseOptions);
        } else {
            throw new Error('Fuse options must be set before setting a new data');
        }
    }
}
