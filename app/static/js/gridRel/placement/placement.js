import PlacementRow from "./placementRow.js";
import { BASIC_ATTRIBUTES } from "../../uniConstants.js";


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
      this.placementData = null;
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

  async updatePlacement(placementData) {
    if (!this.presetId || !this.placementRows) {
      throw new Error('Placement doesnt have build preset. First create a preset to populate with data.')
    }
    const newPlacementData = placementData;
    // if (this.placementId !== newPlacementData['_id']) {
    //   return;
    // }
    const newPresetId = newPlacementData['preset'];
    if (this.presetId && this.presetId !== newPresetId) {
      throw new Error(`Incorrect placementData for used in this Placement preset.
                        Currently used presetId == ${this.presetId}.
                        Rebuild Placement according to a new presetId or use correct placement Data`);
    }
    if (this.placementData
        && this.placementId === newPlacementData['_id']
         && this.placementData['lastChange'] >= newPlacementData['lastChange']) {
        return;
    }
    if (this.placementId !== newPlacementData['_id']) {
      this.placementId = newPlacementData['_id'];
      this.element.id = this.placementId;
    }
    const ignoredEmptyAtt = new Set([BASIC_ATTRIBUTES.BLOCKING_ORDER]);
    this.placementData = newPlacementData;
    this.placementExtraRows = newPlacementData['extra'];
    this.placementData['rowsOrder'].forEach( rowId => {
      this.placementData['rows'][rowId]['columnsOrder'].forEach( colId => {
        const placementCell = this.placementRows[rowId]['columns'][colId];
        if (placementCell.element.classList.contains('identifier-cell')
             || placementCell.element.classList.contains('placement-cell-whitespace')) {
            return;
        }
        const cellData = this.placementData['rows'][rowId]['columns'][colId];
        if (cellData['wheelStack']) {
          if (cellData['blocked']) {
            placementCell.blockState(cellData['blockedBy']);
          } else {
            placementCell.unblockState();
          }
          placementCell.setAsElement();
          // TODO: REPLACE LATER
          const wheelstackData = this.placementData['wheelstacksData'][cellData['wheelStack']];
          placementCell.setElementData(wheelstackData);
          let numWheels = `${wheelstackData['wheels'].length}`;
          if (placementCell.element.innerHTML !== numWheels) {
            placementCell.element.innerHTML = `${numWheels}`;
          }
          // + BATCH  IND +
          const batchNumber = wheelstackData['batchNumber'];
          placementCell.element.setAttribute(BASIC_ATTRIBUTES.BATCH_NUMBER, batchNumber);
          // - BATCH IND -
          // + WHEEL IND +
          let wheelIndString = '';
          for (let wheelId of wheelstackData['wheels']) {
            wheelIndString = wheelIndString !== '' ? `${wheelIndString};${wheelId}` : `${wheelId}`;
          }
          placementCell.element.setAttribute(BASIC_ATTRIBUTES.WHEELS, wheelIndString);
          // - WHEEL IND -
          // ---
        } else {
          placementCell.clearBatchStatus();
          placementCell.setAsEmptyCell();
          if (cellData['blocked']) {
            placementCell.clearAttributes(ignoredEmptyAtt);
            placementCell.blockState(cellData['blockedBy']);
          } else {
            placementCell.unblockState();
            placementCell.clearAttributes();
          }
        }
      })
    })

  }

}