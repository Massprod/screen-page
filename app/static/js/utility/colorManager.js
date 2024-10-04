// colorManager.js
/**
 * @param {string} [defaultColor] - first used color
 * @param {number} [distance] - distance from the defaultColor
 */
export default class ColorManager {
  constructor(defaultColor, distance) {
    this.defaultColor = defaultColor;
    this.usedColors = new Set();
    this.distance = distance;
  }

  /**
   * Generate a random color and ensure it is distinct from the default color.
   * @returns {string} The generated color in hex format.
   */
  generateDistinctRandomColor() {
    let color;
    do {
      color = this.getRandomColor();
    } while (this.usedColors.has(color) || this.isSimilarToDefault(color));
    this.usedColors.add(color);
    return color;
  }

  /**
   * Generate a random color in hex format.
   * @returns {string} The random color in hex format.
   */
  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  /**
   * Check if the generated color is similar to the default color.
   * @param {string} color - The generated color in hex format.
   * @returns {boolean} True if the color is similar to the default color, false otherwise.
   */
  isSimilarToDefault(color) {
    const threshold = this.distance; // Threshold for color difference
    return this.colorDifference(this.defaultColor, color) < threshold;
  }

  /**
   * Calculate the color difference between two hex colors.
   * @param {string} hex1 - The first hex color.
   * @param {string} hex2 - The second hex color.
   * @returns {number} The color difference.
   */
  colorDifference(hex1, hex2) {
    const r1 = parseInt(hex1.slice(1, 3), 16);
    const g1 = parseInt(hex1.slice(3, 5), 16);
    const b1 = parseInt(hex1.slice(5, 7), 16);
    const r2 = parseInt(hex2.slice(1, 3), 16);
    const g2 = parseInt(hex2.slice(3, 5), 16);
    const b2 = parseInt(hex2.slice(5, 7), 16);

    return Math.sqrt(
      (r1 - r2) ** 2 +
      (g1 - g2) ** 2 +
      (b1 - b2) ** 2
    );
  }
}
