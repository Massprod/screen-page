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
    };
    this.element.classList.add('no-select');
    this.element.addEventListener('contextmenu', event => {
      event.preventDefault();
    });
  };

  async buildPreset(presetData, useIdentifiers = true) {
    if (this.presetData && this.presetData['_id'] === presetData['_id']) {
      return;
    };
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
    };
  };

  async updatePlacement(placementData) {
    if (!this.presetId || !this.placementRows) {
      throw new Error('Placement doesnt have build preset. First create a preset to populate with data.')
    };
    const newPlacementData = placementData;
    // if (this.placementId !== newPlacementData['_id']) {
    //   return;
    // }
    const newPresetId = newPlacementData['preset'];
    if (this.presetId && this.presetId !== newPresetId) {
      throw new Error(`Incorrect placementData for used in this Placement preset.
                        Currently used presetId == ${this.presetId}.
                        Rebuild Placement according to a new presetId or use correct placement Data`);
    };
    // console.log('NEW_UPDATE_DATA', newPlacementData);
    if (this.placementData
        && this.placementId === newPlacementData['_id']
         && this.placementData['lastChange'] >= newPlacementData['lastChange']) {
        // console.log('NOT CHANGED PLACEMENT');
        return;
    };
    // console.log('UPDATING PLACEMENT');
    if (this.placementId !== newPlacementData['_id']) {
      this.placementId = newPlacementData['_id'];
      this.element.id = this.placementId;
    };
    const ignoredEmptyAtt = new Set([BASIC_ATTRIBUTES.BLOCKING_ORDER]);
    // Not using it anywhere, so w.e.
    // Just goin to override it without care.
    this.placementData = newPlacementData;
    this.placementExtraRows = newPlacementData['extra'];
    // #region cellUpdate
    const tasks = this.placementData['rowsOrder'].flatMap((rowId) =>
      this.placementData['rows'][rowId]['columnsOrder'].map((colId) => {
        return async () => {
          const placementCell = this.placementRows[rowId]['columns'][colId];
          if (
            placementCell.element.classList.contains('identifier-cell') ||
            placementCell.element.classList.contains('placement-cell-whitespace')
          ) {
            return;
          };
          const cellData = this.placementData['rows'][rowId]['columns'][colId];
          if (cellData['wheelStack']) {
            if (cellData['blocked']) {
              placementCell.blockState(cellData['blockedBy']);
            } else {
              placementCell.unblockState();
            }
            placementCell.setAsElement();
            const wheelstackData = this.placementData['wheelstacksData'][cellData['wheelStack']];
            placementCell.setElementData(wheelstackData);
            const numWheels = `${wheelstackData['wheels'].length}`;
            if (placementCell.element.innerHTML !== numWheels) {
              placementCell.element.innerHTML = `${numWheels}`;
            }
            placementCell.element.setAttribute(BASIC_ATTRIBUTES.BATCH_NUMBER, wheelstackData['batchNumber']);
            placementCell.element.setAttribute(
              BASIC_ATTRIBUTES.WHEELS,
              wheelstackData['wheels']
                .map((wheelObjectId) => this.placementData['wheelsData'][wheelObjectId]['wheelId'])
                .join(';')
            );
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
          };
        };
      })
    );
    // #endregion cellUpdate
    // Not using results, but we can have them with this approach.
    await Promise.all(tasks.map((task) => task()));
  };

  async updateCell(newData) {
    const cellRow = newData['row'];
    const cellCol = newData['column'];
    const cellData = newData['data'];
    const targetCell = this.placementRows[cellRow]['columns'][cellCol];
    if (cellData['wheelStack']) {
      if (cellData['blocked']) {
        targetCell.blockState(cellData['blockedBy']);
      } else {
        targetCell.unblockState();
      }
      targetCell.setAsElement();
      const wheelstackData = newData['wheelstackData'];
      targetCell.setElementData(wheelstackData);
      const numWheels = `${wheelstackData['wheels'].length}`;
      if (targetCell.element.innerHTML !== numWheels) {
        targetCell.element.innerHTML = `${numWheels}`;
      }
      targetCell.element.setAttribute(BASIC_ATTRIBUTES.BATCH_NUMBER, wheelstackData['batchNumber']);
      targetCell.element.setAttribute(
        BASIC_ATTRIBUTES.WHEELS,
        wheelstackData['wheels']
          .map((wheelObjectId) => this.placementData['wheelsData'][wheelObjectId]['wheelId'])
          .join(';')
      );
    } else {
      targetCell.clearBatchStatus();
      targetCell.setAsEmptyCell();
      if (cellData['blocked']) {
        targetCell.clearAttributes(ignoredEmptyAtt);
        targetCell.blockState(cellData['blockedBy']);
      } else {
        targetCell.unblockState();
        targetCell.clearAttributes();
      }
    };  
  };
};