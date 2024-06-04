

export default class WheelStackData {

  constructor(
    wheelStackId,
    originalPisId,
    batchNumber,
    maxSize,
    blocked,
    placement,
    colPlacement,
    rowPlacement,
    wheels,
  ) {
    this.wheelStackId = wheelStackId;
    this.originalPisId = originalPisId;
    this.batchNumber = batchNumber;
    this.maxSize = maxSize;
    this.blocked = blocked;
    this.placement = placement;
    this.colPlacement = colPlacement;
    this.rowPlacement = rowPlacement;
    this.wheels = wheels;
  }
}
