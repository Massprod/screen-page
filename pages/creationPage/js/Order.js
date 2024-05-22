export default class Order {
  /**
   * Create an order.
   * @param {Object} [params] - The parameters for the order.
   * @param {string} [params.order_id=null] - The ID of the order.
   * @param {string} [params.action=null] - The action associated with the order.
   * @param {Object} [params.posFrom=null] - The starting position of the order.
   * @param {Object} [params.posTo=null] - The ending position of the order.
   * @param {boolean} [params.completed=false] - The completion status of the order.
   * @param {string} [params.date=new Date().toISOString()] - The date of the order.
   * @param {string} [params.comment=null] - The comment associated with the order.
   * @param {boolean} [params.canceled=false] - The cancellation status of the order.
   */
  constructor({
    order_id = null,
    action = null,
    posFrom = null,
    posTo = null,
    completed = false,
    date = new Date().toISOString,
    comment = '',
    canceled= false,
  } = {}) {
    this.order_id = order_id;
    this.action = action;
    this.posFrom = posFrom,
    this.posTo = posTo;
    this.completed = completed;
    this.canceled = canceled;
    this.comment = comment;
    this.date = date;
  }

  /**
   * Mark the order as completed.
   * @param {string} [comment=null] - The comment to add when completing the order.
   * @returns {boolean} Whether the order was successfully completed.
   */
  complete(comment = null) {
    if (this.canceled || this.completed) {
      return false;
    }
    this.completed = true;
    if (comment) {
      this.comment = String(comment);
    }
    return true;
  }

  /**
   * Mark the order as canceled.
   * @param {string} [comment=null] - The comment to add when canceling the order.
   * @returns {boolean} Whether the order was successfully canceled.
   */
  cancel(comment = null) {
    if (this.completed) {
      return false;
    }
    this.canceled = true;
    if (comment) {
      this.comment = String(comment);
    }
    return true;
  }
}