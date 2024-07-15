
// noinspection JSUnusedGlobalSymbols

/**
 * Event sent to OrderLoadedEvent handlers
 */
export class OrderFired {
    /**
     * The order history.
     * @type {OrderHistoryRow[]}
     */
    orders = [];

    /**
     * True iff all pages are loaded.
     * @type {boolean}
     */
    allPagesLoaded = false;
}

/**
 * Handles events when orders are loaded.
 */
export class OrderLoadedEvent {

    /**
     * @typedef OrderListener
     * @type {function(OrderHistoryRow[], boolean)}
     */

    /**
     * Adds a listener to the list.
     * @type {OrderListener[]}
     */
    listeners = [];

    /**
     * Last set of arguments sent to fire().  Any addListener() call after
     * the firing will immediately receive these arguments.
     * @type OrderFired
     */
    #lastFire = null;

    /**
     * Adds a listener to the list.
     * @param listener {OrderListener}
     */
    addListener(listener) {
        this.listeners.push(listener);
        if (this.#lastFire) {
            listener(this.#lastFire.orders, this.#lastFire.allPagesLoaded);
        }
    }

    /**
     * Removes a listener from the list.
     * @param listener {OrderListener}
     */
    removeListener(listener) {
        for (let i = 0; i < this.listeners.length; i++) {
            if (this.listeners[i] === listener) {
                this.listeners.splice(i, 1);
                break;
            }
        }
    }

    /**
     * Triggers the callback on all listeners.
     * @param orders {OrderHistoryRow[]} the set of orders
     * @param allPagesLoaded {boolean} true if all pages have been loaded
     */
    fire(orders, allPagesLoaded) {
        for (let listener of this.listeners) {
            listener(orders, allPagesLoaded);
        }

        // save event for any future listeners
        this.#lastFire = new OrderFired();
        this.#lastFire.orders = orders;
        this.#lastFire.allPagesLoaded = allPagesLoaded;
    }

}
