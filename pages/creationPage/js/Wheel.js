export default class Wheel {
  constructor({
    wheelId = null,
    wheelSize = null,
    wheelBatch = null,
    wheelStackRow = null,
    wheelStackColumn = null,
    wheelStackPosition = null,
  } = {}) {
    this.wheelId = wheelId;
    this.wheelSize = wheelSize;
    this.wheelBatch = wheelBatch;
    this.wheelStackRow = wheelStackRow;
    this.wheelStackColumn = wheelStackColumn;
    this.wheelStackPosition = wheelStackPosition;
  }
}