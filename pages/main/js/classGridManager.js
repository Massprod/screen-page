// Import
import Tile from './classTile.js';
import FlashMessage from '../../classMessages.js';
// ---
/**
 * Class to manage the grid and tile functionalities.
 */
export default class GridManager {
  /**
   * Create a GridManager.
   * @param {HTMLElement} gridContainer - The container element for the grid.
   * @param {number} [baseTileHeight=10] - The height of each tile in pixels.
   * @param {number} [baseTileWidth=10] - The width of each tile in pixels.
   * @param {number} [basicRows=30] - The number of rows in the grid.
   * @param {number} [basicCols=30] - The number of columns in the grid.
   */
  constructor(
    gridContainer,
    baseTileHeight = 10,
    baseTileWidth = 10,
    basicRows = 30,
    basicCols = 30,
    defaultColor = '00ffdd',
  ) {
    this.gridContainer = gridContainer;
    // Basic sizes == 1 tile == 0.5m => 10 px == 0.5m.
    this.baseTileHeight = baseTileHeight;
    this.baseTileWidth = baseTileWidth;
    this.availableRows = basicRows;
    this.availableCols = basicCols;
    this.defaultBorder = '0.1px solid  #1c0080';
    this.defaultTileClass = 'tile';
    // ---
    // Zone and stored zones from whom we can restore states.
    this.screenMatrix = [];
    this.screensStorage = {};
    // ---
    // Areas marked with the Tiles of the same colour.
    this.allTiles = {};
    this.currentZoneId = 0;
    this.currentZone = {};
    this.allZones = {};
    // ---
    // Triggers for Area creation and coloring.
    this.creatingZone = false;
    this.defaultTileColor = defaultColor;
    this.usedColors = { defaultTileColor: true };
    this.currentColor = '';
    this.firstTileOfZone = true;
    // ---
  }

  /**
   * Check if the given tile has neighbors with the same color.
   * @param {number} tileId - The ID of the tile.
   * @returns {boolean} True if there are neighboring tiles with the same color, false otherwise.
   */
  correctNeighbours(tileId) {
    let tileY = this.allTiles[tileId]['row'];
    let tileX = this.allTiles[tileId]['column'];
    let options = [
      [-1, 0], [-1, 1], [0, 1], [1, 1],
      [1, 0], [1, -1], [0, -1], [-1, -1]
    ];
    let maxY = this.screenMatrix.length;
    let maxX = this.screenMatrix[tileY].length;
    for (let [dy, dx] of options) {
      let [newY, newX] = [tileY + dy, tileX + dx];
      if (newY >= 0 && newY < maxY && newX >= 0 && newX < maxX) {
        let neighbourId = this.screenMatrix[newY][newX];
        let neighbourColor = this.allTiles[neighbourId]['bgColor'];
        if (neighbourColor === this.currentColor) {
          return true;
        }
      }
    }
    return false;
  }

  clickSetTileColor(firstTile, tile, color, zoneId) {
    if (firstTile || this.correctNeighbours(tile.id)) {
      tile.setColor(color);
      tile.zoneId = zoneId;
      this.allTiles[tile.id]['bgColor'] = color;
      let tileY = this.allTiles[tile.id]['row'];
      let tileX = this.allTiles[tile.id]['column'];
      this.currentZone[tile.id] = { 'row': tileY, 'column': tileX };
    }
  }

  clickResetTileColor(tile, color) {
    tile.setColor(this.defaultTileColor);
    tile.zoneId = -1;
    delete this.currentZone[tile.id];
    this.firstTileOfZone = true;
    this.allTiles[tile.id]['bgColor'] = this.defaultTileColor;
  }

  /**
   * Handle click event on a tile.
   * @param {MouseEvent} event - The click event.
   */
  clickOfTheTile(tile, event) {
    if (event.button === 0 && this.creatingZone) {
      this.clickSetTileColor(this.firstTileOfZone, tile, this.currentColor, this.currentZoneId);
      this.firstTileOfZone = false;
    } else if (event.button === 2 && this.creatingZone) {
        
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
    // [row == y, col == x]
    let topLeft = [10 ** 9, 10 ** 9];
    let topRight = [10 ** 9, 0];
    let botLeft = [0, 10 ** 9];
    let curZoneColor = '';
    for (const tile in this.currentZone) {
      let tileY = this.currentZone[tile]['row'];
      let tileX = this.currentZone[tile]['column'];
      topLeft[0] = Math.min(topLeft[0], tileY);
      topLeft[1] = Math.min(topLeft[1], tileX);
      topRight[0] = Math.min(topRight[0],tileY);
      topRight[1] = Math.max(topRight[1], tileX);
      botLeft[0] = Math.max(botLeft[0], tileY);
      botLeft[1] = Math.min(botLeft[1], tileX);
      if ('' === curZoneColor) {
        curZoneColor = this.allTiles[this.screenMatrix[tileY][tileX]]['bgColor'];
      }
    }
    let height = Math.abs(topLeft[0] - botLeft[0]);
    let width = Math.abs(topLeft[1] - topRight[1]); 
    if (height !== width) {
      return false;
    }
    // Verify filling.
    for (let row = topLeft[0]; row <= botLeft[0]; row += 1) {
      for (let col = topLeft[1]; col <= topRight[1]; col += 1) {
        let curTileId = this.screenMatrix[row][col];
        let curTileColor = this.allTiles[curTileId]['bgColor'];
        if (curTileColor !== curZoneColor) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Create a new area with the current tiles.
   */
  createZone() {
    const message = new FlashMessage();
    let flashText = '';
    if (this.iscurrentZoneSquare()) {
      this.allZones[this.currentZoneId] = {... this.currentZone};
      this.currentZoneId++;
      this.currentZone = {};
      this.usedColors[this.currentColor] = true;
      flashText = 'Correct square area created.';
      message.show(
        { message: flashText}
      );
      return true;
    } else {
      flashText = 'The current area is not a square.\r\nPlease select a square area.';
      message.show(
        { message: flashText}
      );
      return false;
    }
  }

  /**
   * Save the current zone state.
   * @returns {Object} The saved zone data.
   */
  saveZone() {
    let screenIdentifier = new Date().toISOString();
    let screenData = {
      'screenId': screenIdentifier,
      'screenRows': this.screenMatrix.length,
      'screenColumns': this.screenMatrix[0].length,
      'screenTiles': JSON.parse(JSON.stringify(this.allTiles)),
      'screenZones': JSON.parse(JSON.stringify(this.allZones)),
    }
    this.screensStorage[screenIdentifier] = JSON.parse(JSON.stringify(screenData));
    return this.screensStorage[screenIdentifier];
  }

  /**
   * Restore a zone from the saved state.
   * @param {string} zoneId - The ID of the zone to restore.
   */
  restoreZone(screenId) {
    this.gridContainer.replaceChildren([]);
    let screenData = _.cloneDeep(this.screensStorage[screenId]);
    this.allTiles = screenData['screenTiles'];
    this.allZones = screenData['screenZones'];
    this.screenMatrix = [];
    let curTileId = 0;
    for (let row = 0; row < screenData['screenRows']; row += 1) {
      let newRow = [];
      let rowDiv = document.createElement('div');
      rowDiv.className = 'row';
      this.gridContainer.appendChild(rowDiv);
      for (let col = 0; col < screenData['screenColumns']; col += 1) {
        newRow.push(curTileId);
        let tileData = screenData['screenTiles'][curTileId];
        if (tileData['bgColor'] !== this.defaultTileColor) {
        }
        let newTile = new Tile(
          curTileId,
          tileData['row'],
          tileData['column'],
          { 'className': tileData['className'] },
          tileData['width'],
          tileData['height'],
          tileData['bgColor'],
          tileData['border'],
          (tile, event) => this.clickOfTheTile(tile, event),
          tileData['zoneId'],
        );
        curTileId += 1;
        rowDiv.appendChild(newTile.element);
      }
      this.screenMatrix.push(newRow);
    }
  }

  /**
   * Fill the grid with tiles.
   */
  fillTheGrid() {
    this.gridContainer.replaceChildren([]);
    this.screenMatrix = [];
    let curId = 0;
    for (let row = 0; row < this.availableRows; row++) {
      let rowDiv = document.createElement('div');
      rowDiv.className = 'row';
      this.gridContainer.appendChild(rowDiv);
      let curRow = [];
      for (let column = 0; column < this.availableCols; column++) {
        // TileData
        let tileData = {
          'height': this.baseTileHeight,
          'width': this.baseTileWidth,
          'bgColor': this.defaultTileColor,
          'border': this.defaultBorder,
          'row': row,
          'column': column,
          'zoneId': -1,
          'className': this.defaultTileClass,
        };
        // ---
        let newTile = new Tile(
          curId,
          row,
          column,
          { 'className': tileData['className'] },
          tileData['width'],
          tileData['height'],
          tileData['bgColor'],
          tileData['border'],
          (tile, event) => this.clickOfTheTile(tile, event)
        );
        rowDiv.appendChild(newTile.element);
        curRow.push(curId);
        this.allTiles[curId] = tileData;
        curId++;
      }
      this.screenMatrix.push(curRow);
    }
  }

  /**
   * Set the number of rows in the grid.
   * @param {number} height - The new height in rows.
   */
  setHeight(height) {
    this.availableRows = Math.floor(height) * 2;
  }

  /**
   * Set the number of columns in the grid.
   * @param {number} width - The new width in columns.
   */
  setWidth(width) {
    this.availableCols = Math.floor(width) * 2;
  }

  /**
   * Toggle the area creation mode.
   * @returns {string} The new button text.
   */
  togglecreatingZone() {
    if (this.creatingZone) {
      if (this.currentZone.length !== 0 && this.createZone()) {
        this.creatingZone = false;
        return 'Start new zone';
      }
    } else {
      this.currentColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      while (this.currentColor in this.usedColors) {
        this.currentColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      }
      this.creatingZone = true;
      this.firstTileOfZone = true;
      return 'Create zone';
    }
    return 'Create zone';
  }
}
