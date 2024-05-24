import Wheel from './Wheel.js';

/**
 * Class representing a wheel stack.
 * This class manages the data and operations for a stack of wheels, including adding, removing, and transferring wheels.
 */
export default class WheelStackData {
  /**
   * Create a wheel stack.
   * @param {Object} [params] - The parameters for the wheel stack.
   * @param {string} [params.stackId=null] - The unique identifier for the wheel stack.
   * @param {number} [params.maxSize=6] - The maximum number of wheels the stack can hold.
   * @param {string} [params.placementRow=null] - The row placement of the wheel stack.
   * @param {number} [params.placementColumn=null] - The column placement of the wheel stack.
   */
  constructor({
    stackId = null,
    maxSize = 6,
    placementRow = null,
    placementColumn = null,
  } = {}) {
    this.stackId = stackId;
    this.wheels = [];
    this.wheelMap = {}; // Object to map wheel IDs to Wheel objects
    this.maxSize = maxSize;
    this.placementRow = placementRow;
    this.placementColumn = placementColumn;
  }

  /**
   * Finalize and archive the wheel stack.
   * Marks the stack as completed, stores its final state in the backend, and removes it from the grid.
   * @example
   * const stack = new WheelStackData({ stackId: 'stack123', placementRow: 'A', placementColumn: 1 });
   * stack.finalizeAndArchive(); // Finalizes and archives the wheel stack
   */
  finalizeAndArchive() {
    // Logic to store the stack data in the backend and mark as completed
  }

  /**
   * Add a wheel to the top of the stack.
   * @param {Wheel} wheel - The wheel to add.
   * @returns {boolean} True if the wheel was added, false if the stack is full or the wheel is already in the stack.
   * @example
   * const wheel = new Wheel({ wheelId: 'W123', wheelSize: 'Large', wheelBatch: 'BatchA' });
   * const stack = new WheelStackData({ maxSize: 6 });
   * stack.addWheel(wheel); // Adds the wheel to the stack
   */
  addWheel(wheel) {
    if (this.wheels.length >= this.maxSize) {
      console.error('Cannot add wheel: Stack is full.');
      return false; // Stack is full
    }

    if (this.wheelMap[wheel.wheelId]) {
      console.error('Cannot add wheel: Wheel is already in the stack.');
      return false; // Wheel is already in the stack
    }

    this.wheels.push(wheel);
    this.wheelMap[wheel.wheelId] = wheel;
    wheel.stackPosition = this.wheels.length - 1;
    return true;
  }

  /**
   * Remove the top wheel from the stack.
   * @returns {Wheel|null} The removed wheel, or null if the stack is empty.
   */
  removeTopWheel() {
    if (this.wheels.length === 0) {
      return null; // Stack is empty
    }
    const topWheel = this.wheels.pop();
    delete this.wheelMap[topWheel.wheelId];
    return topWheel;
  }

  /**
   * Check if a wheel is present in the stack.
   * @param {string} wheelId - The ID of the wheel to check.
   * @returns {boolean} True if the wheel is present, false otherwise.
   * @example
   * const stack = new WheelStackData({ stackId: 'stack123', maxSize: 6 });
   * const hasWheel = stack.hasWheel('W123'); // Checks if the wheel with ID 'W123' is in the stack
   */
  hasWheel(wheelId) {
    return this.wheelMap[wheelId] !== undefined;
  }

  /**
   * Retrieve data of all wheels in the stack.
   * @returns {Array<Object>} An array of wheel data objects.
   * Each object contains:
   * - wheelId: {string} The ID of the wheel.
   * - wheelSize: {string} The size of the wheel.
   * - wheelBatch: {string} The batch of the wheel.
   * - placementRow: {string} The row placement of the wheel.
   * - placementColumn: {number} The column placement of the wheel.
   * - stackPosition: {number} The position of the wheel in the stack.
   * @example
   * const wheelData = stack.getAllWheelsData();
   * console.log(wheelData);
   * // [
   * //   { wheelId: 'W1', wheelSize: 'Large', wheelBatch: 'BatchA', placementRow: 'A', placementColumn: 1, stackPosition: 0 },
   * //   { wheelId: 'W2', wheelSize: 'Medium', wheelBatch: 'BatchB', placementRow: 'A', placementColumn: 1, stackPosition: 1 },
   * //   ...
   * // ]
   */
  getAllWheelsData() {
    return this.wheels.map(wheel => wheel.getWheelData());
  }

  /**
   * Retrieve comprehensive data about the wheel stack.
   * @returns {Object} An object containing the stack's data and its wheels' data:
   * - stackId: {string} The unique identifier for the wheel stack.
   * - placementRow: {string} The row placement of the wheel stack.
   * - placementColumn: {number} The column placement of the wheel stack.
   * - wheels: {Array<Object>} An array of wheel data objects (see getAllWheelsData for details).
   * @example
   * const stackData = stack.getStackData();
   * console.log(stackData);
   * // {
   * //   stackId: 'stack123',
   * //   placementRow: 'A',
   * //   placementColumn: 1,
   * //   wheels: [
   * //     { wheelId: 'W1', wheelSize: 'Large', wheelBatch: 'BatchA', placementRow: 'A', placementColumn: 1, stackPosition: 0 },
   * //     { wheelId: 'W2', wheelSize: 'Medium', wheelBatch: 'BatchB', placementRow: 'A', placementColumn: 1, stackPosition: 1 },
   * //     ...
   * //   ]
   * // }
   */
  getStackData() {
    return {
      stackId: this.stackId,
      placementRow: this.placementRow,
      placementColumn: this.placementColumn,
      wheels: this.getAllWheelsData()
    };
  }

  /**
   * Serialize the stack data into a JSON object.
   * @returns {string} The JSON representation of the stack data.
   * @example
   * const stack = new WheelStackData({ stackId: 'stack123', placementRow: 'A', placementColumn: 1 });
   * const jsonData = stack.toJSON();
   * console.log(jsonData);
   * // '{"stackId":"stack123","placementRow":"A","placementColumn":1,"wheels":[]}'
   */
  toJSON() {
    return JSON.stringify(this.getStackData());
  }

  /**
   * Move the top wheel to another wheel stack.
   * @param {WheelStackData} targetStack - The target stack to move the top wheel to.
   * @returns {boolean} True if the top wheel was moved successfully, false otherwise.
   * @example
   * const sourceStack = new WheelStackData({ stackId: 'source', maxSize: 6 });
   * const targetStack = new WheelStackData({ stackId: 'target', maxSize: 6 });
   * sourceStack.moveTopWheel(targetStack); // Moves the top wheel from sourceStack to targetStack
   */
  moveTopWheel(targetStack) {
    if (!this.canMoveTopWheel(targetStack)) {
      return false; // Cannot move top wheel
    }
    const topWheel = this.removeTopWheel();
    return targetStack.addWheel(topWheel);
  }

  /**
   * Move the entire stack to another cell.
   * @param {WheelStackData} targetCell - The target cell to move the stack to.
   * @returns {boolean} True if the stack was moved successfully, false otherwise.
   * @example
   * const sourceStack = new WheelStackData({ stackId: 'source', maxSize: 6 });
   * const targetCell = new WheelStackData({ stackId: 'target', maxSize: 6 });
   * sourceStack.moveWholeStack(targetCell); // Moves the entire stack from sourceStack to targetCell
   */
  moveWholeStack(targetCell) {
    if (!this.canMoveWholeStack(targetCell)) {
      return false; // Cannot move whole stack
    }

    for (let i = 0; i < this.wheels.length; i++) {
      const wheel = this.wheels[i];
      targetCell.addWheel(wheel);
      wheel.placementRow = targetCell.placementRow;
      wheel.placementColumn = targetCell.placementColumn;
      wheel.stackPosition = targetCell.wheels.length - 1;
    }

    this.wheels = [];
    this.wheelMap = {};

    return true;
  }

  /**
   * Transfer a specified wheel to the laboratory.
   * @param {string} wheelId - The ID of the wheel to transfer.
   * @returns {boolean} True if the wheel was transferred, false if the wheel was not found.
   * @example
   * const stack = new WheelStackData({ stackId: 'stack123', maxSize: 6 });
   * stack.transferWheelToLab('W123'); // Transfers the wheel with ID 'W123' to the laboratory
   */
  transferWheelToLab(wheelId) {
    if (this.wheelMap[wheelId]) {
      const wheel = this.wheelMap[wheelId];
      const wheelIndex = this.wheels.indexOf(wheel);

      // Remove the wheel from the stack
      this.wheels.splice(wheelIndex, 1); // Modifies the original array
      // Remove the wheel ID from the map
      delete this.wheelMap[wheelId];
      // Update the stack positions of remaining wheels
      this.wheels.forEach((wheel, index) => {
        wheel.stackPosition = index;
      });
      return true;
    } else {
      return false; // Wheel not found
    }
  }

  /**
   * Check if a wheel can be added to the stack.
   * @param {Wheel} wheel - The wheel to check.
   * @returns {boolean} True if the wheel can be added, false otherwise.
   * @example
   * const wheel = new Wheel({ wheelId: 'W123', wheelSize: 'Large', wheelBatch: 'BatchA' });
   * const stack = new WheelStackData({ maxSize: 6 });
   * const canAdd = stack.canAddWheel(wheel); // Checks if the wheel can be added to the stack
   */
  canAddWheel(wheel) {
    if (this.wheels.length >= this.maxSize) {
      return false; // Stack is full
    }
    if (this.wheelMap[wheel.wheelId]) {
      return false; // Wheel is already in the stack
    }
    return true; // Can add wheel
  }

  /**
   * Check if the top wheel can be removed from the stack.
   * @returns {boolean} True if the top wheel can be removed, false otherwise.
   * @example
   * const stack = new WheelStackData({ maxSize: 6 });
   * const canRemove = stack.canRemoveTopWheel(); // Checks if the top wheel can be removed
   */
  canRemoveTopWheel() {
    return this.wheels.length > 0;
  }

  /**
   * Check if the top wheel can be moved to another stack.
   * @param {WheelStackData} targetStack - The target stack to check.
   * @returns {boolean} True if the top wheel can be moved, false otherwise.
   * @example
   * const sourceStack = new WheelStackData({ stackId: 'source', maxSize: 6 });
   * const targetStack = new WheelStackData({ stackId: 'target', maxSize: 6 });
   * const canMove = sourceStack.canMoveTopWheel(targetStack); // Checks if the top wheel can be moved to the target stack
   */
  canMoveTopWheel(targetStack) {
    if (!this.canRemoveTopWheel()) {
      return false; // No wheel to move
    }
    if (targetStack.wheels.length >= targetStack.maxSize) {
      return false; // Target stack is full
    }
    if (targetStack.wheelMap[this.wheels[this.wheels.length - 1].wheelId]) {
      return false; // Wheel is already in the target stack
    }
    return true; // Can move top wheel
  }

  /**
   * Check if the entire stack can be moved to another cell.
   * @param {WheelStackData} targetCell - The target cell to check.
   * @returns {boolean} True if the stack can be moved, false otherwise.
   * @example
   * const sourceStack = new WheelStackData({ stackId: 'source', maxSize: 6 });
   * const targetCell = new WheelStackData({ stackId: 'target', maxSize: 6 });
   * const canMove = sourceStack.canMoveWholeStack(targetCell); // Checks if the stack can be moved to the target cell
   */
  canMoveWholeStack(targetCell) {
    const totalWheelsToMove = this.wheels.length;
    const availableSpace = targetCell.maxSize - targetCell.wheels.length;

    if (availableSpace < totalWheelsToMove) {
      return false; // Not enough space in the target cell
    }

    // Check if any wheel in the source stack is already in the target stack
    for (const wheel of this.wheels) {
      if (targetCell.wheelMap[wheel.wheelId]) {
        return false; // Wheel is already in the target stack
      }
    }

    return true; // Can move whole stack
  }
}
