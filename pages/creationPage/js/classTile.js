/**
 * Class representing a tile with custom styles and dimensions.
 */
export default class Tile {
  /**
   * Create a tile.
   * @param {number} id - The ID of the tile.
   * @param {number} row - The row position of the tile.
   * @param {number} column - The column position of the tile.
   * @param {Object} [stylesData={}] - An object containing custom styles for the tile.
   * @param {number} [width=10] - The width of the tile.
   * @param {number} [height=10] - The height of the tile.
   * @param {string} [bgColor='#00ffdd'] - The background color of the tile.
   * @param {Function} clickHandler - The click event handler for the tile.
   */
  constructor(
    id,
    row,
    column,
    stylesData = {},
    width = 10,
    height = 10,
    bgColor = '#00ffdd',
    border = '0.1px solid  #1c0080',
    clickHandler,
    zoneId = -1,
  ) {
    // Basic stats
    this.zoneId = zoneId;
    this.stylesData = stylesData;
    this.width = width;
    this.height = height;
    this.bgColor = bgColor;
    this.border = border;
    // Placement data
    this.id = id;
    this.row = row;
    this.column = column;

    // Create element
    this.element = document.createElement('div');
    this.applyStyles();
    this.element.id = `${this.id}`;
    this.element.addEventListener('click', (event) => clickHandler(this, event));
    this.element.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      clickHandler(this, event);
    })
  }

  /**
   * Apply styles to the tile element.
   */
  applyStyles() {
    for (const [key, value] of Object.entries(this.stylesData)) {
      this.element.style[key] = value;
    }
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.element.style.backgroundColor = this.bgColor;
    this.element.style.border = this.border;
  }

  /**
   * Set the background color of the tile.
   * @param {string} color - The new background color.
   */
  setColor(color) {
    this.element.style.backgroundColor = `${color}`;
  }

  setZoneId(zoneId) {
    this.zoneId = zoneId;
  }

  /**
   * Get the current background color of the tile.
   * @return {string} The background color of the tile.
   */
  getColor() {
    return window.getComputedStyle(this.element).backgroundColor;
  }
}