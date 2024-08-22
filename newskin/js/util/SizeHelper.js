/**
 * Utility functions for helping with DOM element sizes
 */
export class SizeHelper {

    /**
     * Minimum height for a product image
     * @type {number}
     */
    static minHeight = 100;

    /**
     * @typedef {Object} ElementMonitoredForSize
     * @property {HTMLElement} $parent the parent of the elements to monitor
     * @property {string|string[]} childQuery the query selector for the child elements to make the same size
     */

    /**
     * Set of elements that are monitored and resized every few
     * seconds.  These are maintained together so the list can
     * be cleared whenever the page is reloaded.
     * @type {ElementMonitoredForSize[]}
     */
    static #monitorList = [];

    /**
     * Keeps track of if the background thread is running.
     * @type {boolean}
     */
    static #updateThreadRunning = false;

    /**
     * How often to resize elements
     * @type {number}
     */
    static MONITOR_INTERVAL = 15000; // 15 seconds

    /**
     * How often to resize elements for a period of time when we first
     * start monitoring a new element.
     * @type {number}
     */
    static MONITOR_SHORT_INTERVAL = 1000; // 1 second

    /**
     * Number of times to use the short interval before going to the long interval
     * @type {number}
     */
    static MONITOR_SHORT_COUNT = 5;

    /**
     * When set, the short interval is used this many times before going to the long interval
     * @type {number}
     */
    static #shortIntervalLeft = 0;

    /**
     * Removes all elements from the monitor list.
     */
    static clearMonitorList() {
        this.#monitorList = [];
    }

    /**
     * Makes all child elements found by a query the same height
     * within the parent.
     * @param $parent {HTMLElement} the parent element
     * @param childQuery {string|string[]} the query selector for the child elements, when array each element is handled one after the other
     */
    static makeChildrenSameHeight($parent, childQuery= '.product-image') {

        // if childQuery is an array, handle each element independently
        if (Array.isArray(childQuery)) {
            for (let i = 0; i < childQuery.length; i++) {
                let query = childQuery[i];
                SizeHelper.makeChildrenSameHeight($parent, query);
            }
            return;
        }

        // check arguments
        if (!$parent) {
            console.warn('Called to makeProductImagesSameHeight without $parent');
            return;
        }

        // make sure we have product images
        let $productImages = $parent.querySelectorAll(childQuery);
        if ($productImages.length === 0) {
            console.warn('No product images found for query: ' + childQuery);
            return;
        }

        // makes sure this continues to be monitored for size in the background
        SizeHelper.#checkUpdateThread();
        SizeHelper.#addToMonitorList($parent, childQuery);

        // pass arguments to method that performs actual work
        SizeHelper.#performChildHeightUpdate($parent, childQuery);
    }

    /**
     * Does the actual work for makeChildrenSameHeight() after the input
     * has been validated.
     * @param $parent {HTMLElement} the parent element
     * @param childQuery {string|string[]} the query selector for the child elements, when array each element is handled one after the other
     */
    static #performChildHeightUpdate($parent, childQuery= '.product-image') {

        // clear out previous heights to get a clean measurement
        SizeHelper.#clearHeight($parent, childQuery);

        // grab all product images, give up if none are found
        let $productImages = $parent.querySelectorAll(childQuery);
        if ($productImages.length === 0) {
            return;
        }

        // find the tallest .product-image <div>, and the tallest for each row
        let rowHeights = {};
        let maxHeight = 0;
        $productImages.forEach($productImage => {
            let rect = $productImage.getBoundingClientRect();
            let row =  Math.floor(rect.y);
            let height = rect.height;
            if (row in rowHeights) {
                if (height > rowHeights[row]) {
                    rowHeights[row] = Math.max(SizeHelper.minHeight, height);
                }
            }
            else {
                rowHeights[row] = Math.max(SizeHelper.minHeight, height);
            }
            if (height > maxHeight) {
                maxHeight = height;
            }
        });

        $productImages.forEach($productImage => {
            let height = $productImage.clientHeight;
            if (height > maxHeight) {
                maxHeight = height;
            }
        });

        // don't set the height if we can't read it from DOM correctly,
        // background thread will pick this up later
        if (maxHeight <= SizeHelper.minHeight) {
            return;
        }

        // set all .product-image <div> to the same height for each row
        $productImages.forEach($productImage => {
            let rect = $productImage.getBoundingClientRect();
            let row = Math.floor(rect.y);
            if (row in rowHeights) {
                $productImage.style.height = rowHeights[row] + 'px';
            }
            else { // find nearest row if exact match not found
                let maxFound = -1;
                let foundHeight = 0;
                for (let r in rowHeights) {
                    if (row < r) {
                        if (r > maxFound) {
                            maxFound = r;
                            foundHeight = rowHeights[r];
                        }
                    }
                }
                $productImage.style.height = foundHeight + 'px';
            }
        });
    }


    /**
     * Clears all heights set by makeChildrenSameHeight()
     * @param $parent {HTMLElement} the parent element
     * @param childQuery {string|string[]} the query selector for the child elements
     */
    static #clearHeight($parent, childQuery) {
        if (Array.isArray(childQuery)) {
            childQuery.forEach((query) => {
                $parent.querySelectorAll(query).forEach((element) => {
                    element.style.height = '';
                });
            });
        }
        else {
            $parent.querySelectorAll(childQuery).forEach((element) => {
                element.style.height = '';
            });
        }
    }

    /**
     * Adds new items to the list of elements to monitor for size on
     * a regular interval.
     * @param $parent {HTMLElement} parent scope of the childQuery argument
     * @param childQuery {string|string[]} the query selector for the child elements
     */
    static #addToMonitorList($parent, childQuery) {

        // make sure element doesn't already exist
        for (let i = 0; i < SizeHelper.#monitorList.length; i++) {
            if (SizeHelper.#monitorList[i].$parent === $parent &&
                SizeHelper.#monitorList[i].childQuery === childQuery) {
                return;
            }
        }

        // otherwise add to the list
        SizeHelper.#monitorList.push({$parent:$parent, childQuery:childQuery});

        // since we added something new, monitor more frequently for a moment
        SizeHelper.#shortIntervalLeft = SizeHelper.MONITOR_SHORT_COUNT;
    }

    /**
     * Starts running the updateThread if needed.
     */
    static #checkUpdateThread() {
        if (!SizeHelper.#updateThreadRunning) {
            SizeHelper.#updateThreadRunning = true;
            SizeHelper.#updateThread();
        }
    }

    /**
     * Code run at regular intervals to keeps elements within the monitorList
     * at the correct size.
     */
    static #updateThread() {
        try {
            // run the update function for each element
            for (let i = 0; i < SizeHelper.#monitorList.length; i++) {
                SizeHelper.makeChildrenSameHeight(SizeHelper.#monitorList[i].$parent, SizeHelper.#monitorList[i].childQuery);
            }

            // schedule the next pass
            if (SizeHelper.#shortIntervalLeft > 0) {
                SizeHelper.#shortIntervalLeft--;
                setTimeout(SizeHelper.#updateThread, SizeHelper.MONITOR_SHORT_INTERVAL);
            }
            else {
                setTimeout(SizeHelper.#updateThread, SizeHelper.MONITOR_INTERVAL);
            }
        }
        catch (e) {
            console.error('Error in updateThread: ' + e);
            SizeHelper.#updateThreadRunning = false;
        }
    }
}