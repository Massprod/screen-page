// Import
import Tile from './classTile.js';
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
    // ---
    // Zone and stored zones from whom we can restore states.
    this.zoneMatrix = [];
    this.zoneStorage = {};
    // ---
    // Areas marked with the Tiles of the same colour.
    this.allTiles = {};
    this.currentAreaId = 0;
    this.currentArea = {};
    this.allAreas = {};
    // ---
    // Triggers for Area creation and coloring.
    this.creatingArea = false;
    this.defaultTileColor = defaultColor;
    this.usedColors = { defaultTileColor: true };
    this.currentColor = '';
    this.firstTileOfArea = true;
    // ---
  }

  /**
   * Check if an object is empty.
   * @param {Object} obj - The object to check.
   * @returns {boolean} True if the object is empty, false otherwise.
   */
  isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
  }

  /**
   * Convert an RGB color string to a hex color string.
   * @param {string} rgb - The RGB color string.
   * @returns {string} The hex color string.
   */
  getHex(rgb) {
    let rgbValues = rgb.match(/\d+/g);
    let hex = rgbValues.map((num) => {
      let hex = parseInt(num).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
    return `#${hex}`;
  }

  /**
   * Check if the given tile has neighbors with the same color.
   * @param {number} tileId - The ID of the tile.
   * @returns {boolean} True if there are neighboring tiles with the same color, false otherwise.
   */
  correctNeighbours(tileId) {
    let [tileY, tileX] = this.allTiles[tileId];
    let options = [
      [-1, 0], [-1, 1], [0, 1], [1, 1],
      [1, 0], [1, -1], [0, -1], [-1, -1]
    ];
    let maxY = this.zoneMatrix.length;
    let maxX = this.zoneMatrix[tileY].length;
    for (let [dy, dx] of options) {
      let [newY, newX] = [tileY + dy, tileX + dx];
      if (newY >= 0 && newY < maxY && newX >= 0 && newX < maxX) {
        let neighbour = this.zoneMatrix[newY][newX];
        let neighbourColor = window.getComputedStyle(neighbour).backgroundColor;
        if (this.getHex(neighbourColor) === this.currentColor) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Handle click event on a tile.
   * @param {MouseEvent} event - The click event.
   */
  clickOfTheTile(tile, event) {
    if (event.button === 0 && this.creatingArea) {
      if (this.firstTileOfArea || this.correctNeighbours(tile.id)) {
        tile.setColor(this.currentColor);
        let tileY = this.allTiles[tile.id]['row'];
        let tileX = this.allTiles[tile.id]['column'];
        this.currentArea[tile.id] = [tileY, tileX];
        this.firstTileOfArea = false;
      }
    } else if (event.button === 2 && this.creatingArea) {
        tile.setColor(this.defaultTileColor);
        delete this.currentArea[tile.id];
        this.firstTileOfArea = true;
    }
  }

  /**
   * Check if the current marked area forms a square.
   * @returns {boolean} True if the marked area is a square, false otherwise.
   */
  isCurrentAreaSquare() {
    if (Object.keys(this.currentArea).length === 0) {
      return false;
    }

    // Get all the x and y coordinates
    const xCoordinates = Object.values(this.currentArea).map(([y, x]) => x);
    const yCoordinates = Object.values(this.currentArea).map(([y, x]) => y);

    // Determine the bounds
    const minX = Math.min(...xCoordinates);
    const maxX = Math.max(...xCoordinates);
    const minY = Math.min(...yCoordinates);
    const maxY = Math.max(...yCoordinates);

    // Calculate width and height
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;

    // Check if width and height are equal
    if (width !== height) {
      return false;
    }

    // Verify all coordinates within the bounds are marked
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (!Object.values(this.currentArea).some(([coordY, coordX]) => coordY === y && coordX === x)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Show a flash message.
   * @param {string} message - The message to display.
   * @param {string} [color='red'] - The color of the message.
   */
    showFlashMessage(message, color = 'red') {
      const flashMessage = document.getElementById('flashMessage');
      flashMessage.textContent = message;
      flashMessage.style.backgroundColor = color;
      flashMessage.classList.remove('hidden');
      flashMessage.classList.add('show');
  
      // Hide the message after 2 seconds
      setTimeout(() => {
        flashMessage.classList.remove('show');
        flashMessage.classList.add('hidden');
      }, 2000);
    }
  
  /**
   * Create a new area with the current tiles.
   */
  createArea() {
    if (this.isCurrentAreaSquare()) {
      this.allAreas[this.currentAreaId] = {... this.currentArea};
      this.currentAreaId++;
      this.currentArea = {};
      this.usedColors[this.currentColor] = true;
      this.showFlashMessage('Area created successfully!', 'green');
      return true;
    } else {
      this.showFlashMessage('The current area is not a square. Please select a square area.');
      return false;
    }
  }

  /**
   * Save the current zone state.
   * @returns {Object} The saved zone data.
   */
  saveZone() {
    let zoneIdentifier = new Date().toISOString();
    return {
      zoneId: zoneIdentifier,
      zoneMatrix: this.zoneMatrix,
      zoneAreas: this.allAreas
    };
  }

  /**
   * Restore a zone from the saved state.
   * @param {string} zoneId - The ID of the zone to restore.
   */
  restoreZone(zoneId) {
    this.gridContainer.replaceChildren([]);
    let zoneMatrix = this.zoneStorage[zoneId].zoneMatrix;
    console.log(zoneMatrix);
    for (let row of zoneMatrix) {
      console.log(row);
      let rowDiv = document.createElement('div');
      rowDiv.className = 'row';
      this.gridContainer.appendChild(rowDiv);
      for (let cell of row) {
        rowDiv.appendChild(cell);
      }
    }
  }

  /**
   * Fill the grid with tiles.
   */
  fillTheGrid() {
    this.gridContainer.replaceChildren([]);
    this.zoneMatrix = [];
    let curId = 0;
    for (let row = 0; row < this.availableRows; row++) {
      let rowDiv = document.createElement('div');
      rowDiv.className = 'row';
      this.gridContainer.appendChild(rowDiv);
      let curRow = [];
      for (let column = 0; column < this.availableCols; column++) {
        // TileData
        let tileData = {
          curId: {
            'height': this.baseTileHeight,
            'width': this.baseTileWidth,
            'bgColor': this.defaultTileColor,
            'border': this.defaultBorder,
            'row': row,
            'column': column,
          }
        };
        // ---
        let newTile = new Tile(
          curId,
          row,
          column,
          {'className': 'tile'},
          tileData[curId][width],
          tileData[curId][height],
          tileData[curId][bgColor],
          tileData[curId][border],
          (tile, event) => this.clickOfTheTile(tile, event)
        );
        rowDiv.appendChild(newTile.element);
        curRow.push(tileData.curId);
        this.allTiles[tileData.curId] = tileData;
        curId++;
      }
      this.zoneMatrix.push(curRow);
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
  toggleCreatingArea() {
    if (this.creatingArea) {
      if (this.currentArea.length !== 0 && this.createArea()) {
        this.creatingArea = false;
        return 'Start new area';
      }
    } else {
      this.currentColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      while (this.currentColor in this.usedColors) {
        this.currentColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      }
      this.creatingArea = true;
      this.firstTileOfArea = true;
      return 'Create area';
    }
    return 'Create area';
  }
}
