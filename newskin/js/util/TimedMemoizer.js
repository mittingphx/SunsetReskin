/**
 * Project: Sunset Wholesale West Website
 * File:    TimedMemoizer.js
 * Author:  Scott Mitting
 * Date:    2024-05-20
 * Abstract:
 *  Memoizer with a configurable refresh rate.
 */

/**
 * Accepts a function that generates the value for this object, which
 * is updated automatically when the get method is called after the
 * refresh rate has passed.  The refresh rate is set to 1000ms by default.
 */
export class TimedMemoizer {

    /**
     * Last calculated value for this memoizer.
     * @type {any}
     */
    value = null;

    /**
     * Function that generates the value for this memoizer.
     * @type {function}
     */
    fn = null;

    /**
     * When the value was last calculated.
     * @type {number}
     */
    timestamp = 0;

    /**
     * Minimum in milliseconds between recalculations.  Does not refresh
     * unless the get method is called after the refreshRate has passed.
     * @type {number}
     */
    refreshRate = 1000;

    /**
     * Constructor takes a function that generates the value for this object.
     * @param fn
     * @param rate
     */
    constructor(fn, rate) {
        if (rate) {
            this.refreshRate = rate;
        }
        if (fn) {
            this.fn = fn;
            this.refresh()
        }
    }

    /**
     * Gets the current value of this object.
     * @returns {null}
     */
    get () {
        if (this.expired()) {
            this.refresh();
        }
        return this.value;
    }

    /**
     * Recalculates the value for this object.
     */
    refresh() {
        if (this.fn === null) {
            return;
        }
        this.value = this.fn();
        this.timestamp = Date.now();
    }

    /**
     * Returns true iff the value should be refreshed.
     * @returns {boolean}
     */
    expired() {
        return Date.now() - this.timestamp > this.refreshRate;
    }
}
