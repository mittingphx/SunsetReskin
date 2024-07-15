
/**
 * Stores a cache of OrderHistoryRow records by account number.
 */
export class OrderCache {

    /**
     * The account number for this cache
     * @type {string}
     */
    acctMo = '';

    /**
     * The cached set of rows
     * @type {OrderHistoryRow[]}
     */
    orders = [];

    /**
     * Range of order numbers in the cache.
     * @type {{min: string, max: string}}
     */
    cacheRange = {
        min: '',
        max: ''
    };

    /**
     * Loads the existing cache by account number.
     * @param acctMo {string}
     */
    constructor(acctMo) {
        this.acctMo = acctMo;
    }

    /**
     * Loads the existing cache by account number.
     */
    load() {
        let cache = localStorage.getItem('orders_' + this.acctMo);
        if (cache) {
            this.orders = JSON.parse(cache);
            this.cacheRange = this.#getOrderRange(this.orders);
            console.log('Loaded ' + this.orders.length + ' orders from cache for account #' + this.acctMo, this.cacheRange);
        }
    }

    /**
     * Saves to local storage by account number.
     */
    save() {
        this.sort();
        this.cacheRange = this.#getOrderRange(this.orders);

        localStorage.setItem('orders_' + this.acctMo, JSON.stringify(this.orders));
    }

    /**
     * Looks at a set of rows and determines if we should load the next page.
     * @param pageRows {OrderHistoryRow[]}
     */
    shouldLoadNextPage(pageRows) {
        let pageRange = this.#getOrderRange(pageRows);

        // we don't allow empty page ranges here
        if (pageRange.min === '' || pageRange.max === '') {
            console.warn('shouldLoadNextPage received empty page range', pageRows);
            return true;
        }

        // this is a page of records newer than what's in the cache
        // and does not overlay the cache at all so there may be
        // more data
        if (pageRange.min > this.cacheRange.max) {
            return true;
        }

        // this is a page of records older than what's in the cache,
        // so we haven't loaded all pages yet for this browser,
        // which should happen once.
        if (pageRange.min < this.cacheRange.min) {
            return true;
        }

        // all the new records needed are contained within this page of data.
        return false;
    }

    /**
     * Returns true if the cache contains an order with the specified order number.
     * @param orderNo {string} the order number
     * @return {boolean}
     */
    hasOrder(orderNo) {
        for (let order of this.orders) {
            if (order.orderNo === orderNo) {
                return true;
            }
        }
        return false;
    }

    /**
     * Adds rows to the orders cache if they don't already exist.
     * Does not sort or save the changed data.
     * The cacheRange is left untouched.
     * @param rows {OrderHistoryRow[]}
     */
    addRows(rows) {
        for (let i = 0; i < rows.length; i++) {
            if (!this.hasOrder(rows[i].orderNo)) {
                this.orders.push(rows[i]);
            }
        }
    }

    /**
     * Sorts all rows by orderNo descending.
     */
    sort() {
        this.orders.sort((a, b) => b.orderNo - a.orderNo);
    }

    /**
     * Gets the minimum and maximum order numbers in a list.
     * @param orderArray {OrderHistoryRow[]} the array of orders to check
     * @returns {{min: string, max: string}}
     */
    #getOrderRange(orderArray) {
        if (orderArray.length === 0) {
            return { min: '', max: '' };
        }
        let ret = { min: orderArray[0].orderNo, max: orderArray[0].orderNo };
        for (let order of orderArray) {
            if (order.orderNo > ret.max) {
                ret.max = order.orderNo;
            }
            else if (order.orderNo < ret.min) {
                ret.min = order.orderNo;
            }
        }
        return ret;
    }

}
