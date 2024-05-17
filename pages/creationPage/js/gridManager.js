import Tile from './tile.js';
import ColorManager from '../../utility/colorManager.js';
import FlashMessage from '../../utility/flashMessage.js';

export default class GridManager {
  /**
   * Create a GridManager.
   * @param {number} [baseTileHeight=10] - The height of each tile in pixels.
   * @param {number} [baseTileWidth=10] - The width of each tile in pixels.
   * @param {number} [basicRows=15] - The number of rows in the grid.
   * @param {number} [basicCols=15] - The number of columns in the grid.
   * @param {string} [defaultColor='#00ffdd'] - The default color for tiles.
   * @param {string} [defaultBorder = '0.1px solid #1c0080']
   * @param {string} [defaultTileClass = 'tile']
  */
  constructor({
    baseTileHeight = 10,
    baseTileWidth = 10,
    basicRows = 15,
    basicCols = 15,
    defaultColor = '#00ffdd',
    defaultBorder = '0.1px solid #1c0080',
    defaultTileClass = 'tile',
  } = {}) {
    // Base properties
    this.baseTileHeight = this.validateNumber(baseTileHeight);
    this.baseTileWidth = this.validateNumber(baseTileWidth);
    this.availableRows = this.validateNumber(basicRows);
    this.availableCols = this.validateNumber(basicCols);
    this.zoomAndDragInstance = false;
    this.baseHightLimit = 100;
    this.baseWidthLimit = 100;
    // Base styling
    this.defaultBorder = defaultBorder;
    this.defaultTileClass = defaultTileClass;
    this.defaultTileColor = defaultColor;
    // Grid data
    this.screenMatrix = [];  // all `tileId` by cells they're placed in
    this.allTiles = {};  // data of all the tiles with keys as `tileId`
    // Zones Data
    this.currentZoneId = 0;
    this.currentZone = {};
    this.allZones = {};
    this.creatingZone = false;
    this.firstTileOfZone = true;
    this.emptyZoneId = -1;
    // Grid coloring
    this.colorManager = new ColorManager(this.defaultTileColor, 75);
    this.currentColor = '';
    // Initialisation
    this.#addStyles();
    this.gridContainer = document.createElement('div');
    this.gridContainer.className = 'grid-container';
  }

  /**
   * Validate that a value is a positive number.
   * @param {number} value - The value to validate.
   * @returns {number} The validated number.
   * @throws {Error} If the value is not a valid number.
   */
  validateNumber(value) {
    if (typeof value !== 'number' || value <= 0) {
      throw new Error('Invalid value, `number` expected');
    }
    return value;
  }

  /**
   * Add styles to the document head for grid and tile elements.
   * @private
   */
  #addStyles() {
    const style = document.createElement('style');
    style.textContent = this.getGridStyle();
    document.head.appendChild(style);
  }

  /**
   * Get the CSS styles for the grid and tile elements.
   * @returns {string} The CSS styles.
   */
  getGridStyle() {
    return `
      .grid-container {
        position: absolute;
        transform-origin: top left;
        background-color: whitesmoke;
        will-change: transform;
      }
      .row {
        height: max-content;
        width: max-content;
        display: flex;
      }
      .tile {
        width: ${this.baseTileWidth}px;
        height: ${this.baseTileHeight}px;
        border: ${this.defaultBorder};
        overflow: hidden;
      }
    `;
  }

  /**
   * Fill the grid with tiles.
   * @returns {HTMLElement} The grid container element with tiles.
   */
  createBasicGrid() {
    this.gridContainer.replaceChildren([]);
    this.screenMatrix = [];
    let curId = 0;

    for (let row = 0; row < this.availableRows; row++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'row';
      this.gridContainer.appendChild(rowDiv);
      const curRow = [];

      for (let column = 0; column < this.availableCols; column++) {
        const tileData = {
          'height': this.baseTileHeight,
          'width': this.baseTileWidth,
          'bgColor': this.defaultTileColor,
          'border': this.defaultBorder,
          'row': row,
          'column': column,
          'zoneId': this.emptyZoneId,
          'className': this.defaultTileClass,
        };
        const newTile = new Tile(
          curId,
          row,
          column,
          { 'className': tileData.className },
          tileData.width,
          tileData.height,
          tileData.bgColor,
          tileData.border,
          (tile, event) => this.clickOfTheTile(tile, event)
        );
        rowDiv.appendChild(newTile.element);
        curRow.push(curId);
        this.allTiles[curId] = tileData;
        curId++;
      }
      this.screenMatrix.push(curRow);
    }
    return this.gridContainer;
  }

  /**
   * Check if the given tile has neighbors with the same color.
   * @param {number} tileId - The ID of the tile.
   * @returns {boolean} True if there are neighboring tiles with the same color, false otherwise.
   */
  correctNeighbours(tileId) {
    const tileY = this.allTiles[tileId].row;
    const tileX = this.allTiles[tileId].column;
    const options = [
      [-1, 0], [-1, 1], [0, 1], [1, 1],
      [1, 0], [1, -1], [0, -1], [-1, -1]
    ];
    const maxY = this.screenMatrix.length;
    const maxX = this.screenMatrix[tileY].length;

    for (const [dy, dx] of options) {
      const [newY, newX] = [tileY + dy, tileX + dx];
      if (newY >= 0 && newY < maxY && newX >= 0 && newX < maxX) {
        const neighbourId = this.screenMatrix[newY][newX];
        const neighbourZoneId = this.allTiles[neighbourId].zoneId;
        if (neighbourZoneId === this.currentZoneId) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Set the color of a tile when clicked.
   * @param {boolean} firstTile - Whether this is the first tile in the zone.
   * @param {Tile} tile - The tile object.
   * @param {string} color - The color to set.
   * @param {number} zoneId - The ID of the current zone.
   */
  clickSetTileColor(firstTile, tile, color, zoneId) {
    if (tile.zoneId !== this.emptyZoneId) {
      return false;
    }
    if (firstTile || this.correctNeighbours(tile.id)) {
      tile.setColor(color);
      tile.setZoneId(zoneId);
      this.allTiles[tile.id].bgColor = tile.bgColor;
      this.allTiles[tile.id].zoneId = tile.zoneId;
      const tileY = this.allTiles[tile.id].row;
      const tileX = this.allTiles[tile.id].column;
      this.currentZone[tile.id] = { 'row': tileY, 'column': tileX };
      return true;
    }
    return false;
  }

  /**
   * Reset the color of a tile when clicked with the right mouse button.
   * @param {Tile} tile - The tile object.
   */
  clickResetTileColor(tile) {
    if (tile.zoneId === this.currentZoneId) {
      tile.setColor(this.defaultTileColor);
      tile.setZoneId(this.emptyZoneId);
      this.allTiles[tile.id].bgColor = this.defaultTileColor;
      this.allTiles[tile.id].zoneId = this.emptyZoneId;
      delete this.currentZone[tile.id];
      if (Object.keys(this.currentZone).length === 0) {
        this.firstTileOfZone = true;
      }
    }
  }

  /**
   * Handle click event on a tile.
   * @param {Tile} tile - The tile object.
   * @param {MouseEvent} event - The click event.
   */
  clickOfTheTile(tile, event) {
    if (this.zoomAndDragInstance && this.zoomAndDragInstance.recentlyDragged) {
      return;
    }
    if (event.button === 0 && this.creatingZone) {
      if (this.clickSetTileColor(this.firstTileOfZone, tile, this.currentColor, this.currentZoneId)) {
        this.firstTileOfZone = false;
      };
    } else if (event.button === 2 && this.creatingZone) {
      this.clickResetTileColor(tile);
    }
  }

  /**
   * Check if the current marked area forms a square.
   * @returns {boolean} True if the marked area is a square, false otherwise.
   */
  iscurrentZoneSquare() {
    if (Object.keys(this.currentZone).length === 0) {
      return false;
    }

    let topLeft = [10 ** 9, 10 ** 9];
    let topRight = [10 ** 9, 0];
    let botLeft = [0, 10 ** 9];

    for (const tile in this.currentZone) {
      const tileY = this.currentZone[tile].row;
      const tileX = this.currentZone[tile].column;
      topLeft[0] = Math.min(topLeft[0], tileY);
      topLeft[1] = Math.min(topLeft[1], tileX);
      topRight[0] = Math.min(topRight[0], tileY);
      topRight[1] = Math.max(topRight[1], tileX);
      botLeft[0] = Math.max(botLeft[0], tileY);
      botLeft[1] = Math.min(botLeft[1], tileX);
    }

    const height = Math.abs(topLeft[0] - botLeft[0]);
    const width = Math.abs(topLeft[1] - topRight[1]);

    if (height !== width) {
      return false;
    }

    for (let row = topLeft[0]; row <= botLeft[0]; row += 1) {
      for (let col = topLeft[1]; col <= topRight[1]; col += 1) {
        const curTileId = this.screenMatrix[row][col];
        const curTileZoneId = this.allTiles[curTileId].zoneId;
        if (curTileZoneId !== this.currentZoneId) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Create a new area with the current tiles.
   * @returns {boolean} True if the area is successfully created, false otherwise.
   */
  createZone() {
    const message = new FlashMessage();
    let flashText = '';

    if (this.iscurrentZoneSquare()) {
      this.allZones[this.currentZoneId] = { ...this.currentZone };
      this.currentZoneId++;
      this.currentZone = {};
      flashText = 'Correct square area created.';
      message.show({ 'message': flashText });
      this.firstTileOfZone = true;
      return true;
    } else {
      flashText = 'The current area is not a square.\r\nPlease select a square area.';
      message.show({ 'message': flashText });
      return false;
    }
  }

  /**
   * Save the current zone state.
   * @returns {Object} The saved zone data.
   */
  saveScreen(screenName = '') {
    const screenIdentifier = screenName || new Date().toISOString();
    const screenData = {
      'screenId': screenIdentifier,
      'screenRows': this.screenMatrix.length,
      'screenColumns': this.screenMatrix[0].length,
      'screenTiles': JSON.parse(JSON.stringify(this.allTiles)),
      'screenZones': JSON.parse(JSON.stringify(this.allZones)),
    };
    return JSON.parse(JSON.stringify(screenData));
  }

  /**
   * Restore a zone from the saved state.
   * @param {Object} screenData - The saved screen data.
   * @returns {HTMLElement} The restored grid container element.
   */
  restoreScreen(screenData = {}) {
    if (!screenData || Object.keys(screenData).length === 0) {
      return false;
    }
    this.gridContainer.replaceChildren([]);
    this.allTiles = screenData.screenTiles;
    this.allZones = screenData.screenZones;
    this.screenMatrix = [];

    let curTileId = 0;
    for (let row = 0; row < screenData.screenRows; row += 1) {
      const newRow = [];
      const rowDiv = document.createElement('div');
      rowDiv.className = 'row';
      this.gridContainer.appendChild(rowDiv);

      for (let col = 0; col < screenData.screenColumns; col += 1) {
        newRow.push(curTileId);
        const tileData = screenData.screenTiles[curTileId];
        const newTile = new Tile(
          curTileId,
          tileData.row,
          tileData.column,
          { 'className': tileData.className },
          tileData.width,
          tileData.height,
          tileData.bgColor,
          tileData.border,
          (tile, event) => this.clickOfTheTile(tile, event),
          tileData.zoneId
        );
        curTileId += 1;
        rowDiv.appendChild(newTile.element);
      }
      this.screenMatrix.push(newRow);
    }
    return this.gridContainer;
  }

  /**
   * Toggle the area creation mode.
   * @returns {boolean} The new state of area creation mode.
   */
  toggleCreatingZone() {
    if (this.creatingZone) {
      if (Object.keys(this.currentZone).length === 0) {
        this.creatingZone = false;
        return true;
      } else if (this.createZone()) {
        this.creatingZone = false;
        return true;
      }
    } else {
      this.currentColor = this.colorManager.generateDistinctRandomColor();
      this.creatingZone = true;
      this.firstTileOfZone = true;
      return false;
    }
    return false;
  }

  /**
   * Set the number of rows in the grid.
   * @param {number} height - The new height in rows.
   * @returns {boolean} True if the height is valid, false otherwise.
   */
  setHeight(height) {
    if (typeof height === 'number' && height > 0 && height <= this.baseHightLimit ) {
      this.availableRows = Math.floor(height) * 2;
      return true;
    } else {
      return false;
    }
  }

  /**
   * Set the number of columns in the grid.
   * @param {number} width - The new width in columns.
   * @returns {boolean} True if the width is valid, false otherwise.
  */
  setWidth(width) {
    if (typeof width === 'number' && width > 0 && width <= this.baseWidthLimit) {
      this.availableCols = Math.floor(width) * 2;
      return true;
    } else {
      return false;
    }
  }

  setZoomAndDragInstance(zoomAndDragInstance) {
    this.zoomAndDragInstance = zoomAndDragInstance;
  }
}



