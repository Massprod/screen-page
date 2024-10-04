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
        this.placementExtraRows = null;
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
        this.presetId = presetData['_id'];
        this.presetData = presetData;
        this.placementExtraRows = this.presetData['extra'];
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

    async updatePlacementHistory(historyData) {
        if (!this.presetId || !this.placementRows) {
            throw new Error('Placement doesnt have build preset. First create a preset to populate with data.')
        }
        const placementData = historyData['placementData'];
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
        // Bad and sad, but w.e
        // We either update orders inside of them or we just reassign which is even faster.
        this.placementExtraRows = placementData['extra'];
        placementData['rowsOrder'].forEach( rowId => {
            placementData['rows'][rowId]['columnsOrder'].forEach( colId => {
                const placementCell = this.placementRows[rowId]['columns'][colId];
                if (placementCell.element.classList.contains('identifier-cell')
                     || placementCell.element.classList.contains('placement-cell-whitespace')) {
                    return;
                }
                placementCell.clearBatchStatus();
                placementCell.clearAttributes();
                const cellData = placementData['rows'][rowId][['columns']][colId];
                cellData['blockedBy'] = historyData['placementOrders'][cellData['blockedBy']];
                placementCell.setElementData(cellData);
                if (cellData['blocked']) {
                    placementCell.blockState();
                } else {
                    placementCell.unblockState();
                }
                // TODO: We need to utilize it beter.
                if ('wheelStack' in cellData && cellData['wheelStack']) {
                    placementCell.setAsElement();
                } else {
                    placementCell.setAsEmptyCell();
                }
            }) 
        })
        // for (let rowId of placementData['rowsOrder']) {
        //     const columns = this.placementRows[rowId].columns;
        //     const columnOrder = placementData['rows'][rowId]['columnsOrder'];
        //     for (let colId of columnOrder) {
        //         const placementCell = columns[colId];
        //         if (placementCell.element.classList.contains('identifier-cell')
        //              || placementCell.element.classList.contains('placement-cell-whitespace')) {
        //             continue;
        //         }
        //         const cellData = placementData['rows'][rowId]['columns'][colId];
        //         placementCell.setElementData(cellData);
        //         if (cellData['blocked']) {
        //             placementCell.blockState();
        //         } else {
        //             placementCell.unblockState();
        //         }
        //         // TODO: We need to utilize it beter.
        //         if ('wheelStack' in cellData && cellData['wheelStack']) {
        //             placementCell.setAsElement();
        //         } else {
        //             placementCell.setAsEmptyCell();
        //         }
        //     }
        // }
        const wheelstacksData = historyData['wheelstacksData'];
        Object.values(wheelstacksData).forEach( element => {
            if (this.placementId !== element['placement']['placementId']) {
                return;
            }
            for (let index in element['wheels']) {
                const wheelObjectId = element['wheels'][index];
                element['wheels'][index] = historyData['wheelsData'][wheelObjectId];
            }
            const elementRow = element['rowPlacement'];
            if ('extra' === elementRow) {
                return;
            }
            const elementCol = element['colPlacement'];
            const numWheels = element['wheels'].length;
            const cellElement = this.placementRows[elementRow]['columns'][elementCol];
            cellElement.element.innerHTML = '';
            cellElement.element.innerHTML = `${numWheels}`
            // + BATCH IND +
            const batchNumber = element['batchNumber'];
            cellElement.element.setAttribute('data-batch-number', batchNumber);
            //  + BATCH DATA +
            const batchData = historyData['batchesData'][batchNumber];
            element['batchNumber'] = batchData
            const batchState = batchData['laboratoryPassed'];
            if (!batchData['laboratoryTestDate']) {
                cellElement.element.classList.add('batch-not-tested');
            } else if (batchState) {
                cellElement.element.classList.add('batch-passed');
            } else if (!batchState) {
                cellElement.element.classList.add('batch-not-passed');
            }
            //  - BATCH DATA -
            // - BATCH IND -
            // + WHEEL IND +
            let wheelIndString = ``;
            for (let wheelData of element['wheels']) {
                const wheelId = wheelData['wheelId'];
                wheelIndString = wheelIndString !== '' ? `${wheelIndString};${wheelId}` : `${wheelId}`;
            }
            cellElement.element.setAttribute('data-wheels', wheelIndString);
            // - WHEEL IND -
            // + BLOCKING ORDER +
            if (element['blocked']) {
                const blockingOrderObjectId = element['lastOrder'];
                if (historyData['placementOrders'][blockingOrderObjectId]) {
                    element['lastOrder'] = historyData['placementOrders'][blockingOrderObjectId];
                }
            } 
            // - BLOCKING ORDER -
            cellElement.historyData = element;
        })
    }
}