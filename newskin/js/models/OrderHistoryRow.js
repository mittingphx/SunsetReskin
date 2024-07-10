/**
 * Record class for all data about one order history row.
 */
export class OrderHistoryRow {

    /**
     * The order link in the history table
     * @type {HTMLAnchorElement|null}
     */
    $link = null;

    /**
     * The order number
     * @type {string|null}
     */
    orderNo = null;

    /**
     * The order date
     * @type {Date|null}
     */
    orderDate = null;

    /**
     * The invoice number
     * @type {string|null}
     */
    invoiceNo = null;

    /**
     * The order status
     * @type {string|null}
     */
    orderStatus = null;

    /**
     * The order total
     * @type {Number|null}
     */
    orderTotal = null;
}