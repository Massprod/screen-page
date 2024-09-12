import { usersPage } from "../../../uniConstants.js";
import PlacementRow from "./placementRow.js";


export default class Placement{
    constructor(
        placementType
    ) {
        this.placementId = null;
        this.placementType = placementType;
        this.presetId = null;
        this.placementRows = null;
        this.presetData = null;
        this.#init();
    }

    async #init() {
        this.element = document.createElement('div');
        this.element.id = 'emptyPreset';
        if ('grid' === this.placementType) {
            this.element.className = 'placement-grid-container';
        } else if ('basePlatform' === this.placementType) {
            this.element.className = 'placement-base-platform-container';
        }
        this.element.addEventListener('context-menu', event => {
            event.preventDefault();
        })
    }

    async buildPreset(presetData, useIdentifiers = true) {
        if (this.presetData && this.presetData['_id'] === presetData['_id']) {
            return;
        }
        this.presetData = presetData;
        this.placementRows = {};
        this.element.innerHTML = "";
        const rowsOrder = presetData['rowsOrder'];
        const firstIdentifierRow = useIdentifiers ? 0 : 1;
        for (let index = firstIdentifierRow; index < rowsOrder.length; index += 1) {
            let rowId = rowsOrder[index];
            const placementRow = new PlacementRow(this.placementType);
            const rowData = this.presetData['rows'][rowId];
            placementRow.buildRow(rowData, useIdentifiers, rowId)
            this.placementRows[rowId] = placementRow;
            this.element.appendChild(placementRow.element);
        }
    }

    async updatePlacement(placementData) {
        if (!this.presetId || !this.placementRows) {
            throw new Error('Placement doesnt have build preset. First create a preset to populate with data.')
        }
        const presetId = placementData['preset'];
        if (this.presetId && this.presetId !== presetId) {
            throw new Error(`Incorrect placementData for used in this Placement preset.
                 Currently used presetId == ${this.presetId}.
                 Rebuild Placement according to a new presetId or use correct placement Data`);
        }
        if (this.placementId !== placementData['_id']) {
            this.placementId = placementData['_id'];
            this.element.id = this.placementId;
        }

    }
}