/**
 * Class representing a wheel.
 * This class is used to store and manage data about individual wheels within a wheel stack.
 * Each wheel has an ID, size, batch, and information about its placement in the grid and its position within the wheel stack.
 * 
 * Usage:
 * - Initialize a wheel with its specific attributes.
 * - Update the placement of the wheel when it is moved within the grid.
 * - Retrieve the wheel's data for operations like displaying in the UI or sending to a backend.
 * 
 * Example:
 * const wheel = new Wheel({
 *   wheelId: 'W123',
 *   wheelSize: 'Large',
 *   wheelBatch: 'BatchA',
 *   placementRow: 'A',
 *   placementColumn: 1,
 *   stackPosition: 0
 * });
 * 
 * wheel.updatePlacement('B', 2, 1);
 * const wheelData = wheel.getWheelData();
 */
export default class Wheel {
  /**
   * Create a wheel.
   * @param {Object} [params] - The parameters for the wheel.
   * @param {string} [params.wheelId=null] - The ID of the wheel.
   * @param {string} [params.wheelSize=null] - The size of the wheel.
   * @param {string} [params.wheelBatch=null] - The batch of the wheel.
   * @param {string} [params.placementRow=null] - The row placement of the wheel.
   * @param {string} [params.placementColumn=null] - The column placement of the wheel.
   * @param {number} [params.stackPosition=null] - The position of the wheel in the stack.
   */
  constructor({
    wheelId = null,
    wheelSize = null,
    wheelBatch = null,
    placementRow = null,
    placementColumn = null,
    stackPosition = null,
  } = {}) {
    this.wheelId = wheelId;
    this.wheelSize = wheelSize;
    this.wheelBatch = wheelBatch;
    this.placementRow = placementRow;
    this.placementColumn = placementColumn;
    this.stackPosition = stackPosition;
  }

  /**
   * Update the placement of the wheel.
   * @param {string} newRow - The new row placement.
   * @param {string} newColumn - The new column placement.
   * @param {number} newPosition - The new position in the stack.
   */
  updatePlacement(newRow, newColumn, newPosition) {
    this.placementRow = newRow;
    this.placementColumn = newColumn;
    this.stackPosition = newPosition;
  }

  /**
   * Get the wheel's data as an object.
   * @returns {Object} The wheel's data.
   */
  getWheelData() {
    return {
      wheelId: this.wheelId,
      wheelSize: this.wheelSize,
      wheelBatch: this.wheelBatch,
      placementRow: this.placementRow,
      placementColumn: this.placementColumn,
      stackPosition: this.stackPosition,
    };
  }
}
