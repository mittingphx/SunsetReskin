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
     * Clears all heights set by makeChildrenSameHeight()
     * @param $parent {HTMLElement} the parent element
     * @param childQuery {string|string[]} the query selector for the child elements
     */
    static clearHeight($parent, childQuery) {
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
     * Makes all child elements found by a query the same height
     * within the parent.
     * @param $parent {HTMLElement} the parent element
     * @param childQuery {string|string[]} the query selector for the child elements, when array each element is handled one after the other
     * @param callback {function} called after the heights are calculated successfully (may take a few retries)
     * @param retriesLeft {number} number of retries before giving up (default 5)
     */
    static makeChildrenSameHeight($parent, childQuery= '.product-image', callback = null, retriesLeft = 5) {

        // clear out previous heights to get a clean measurement
        SizeHelper.clearHeight($parent, childQuery);

        // if childQuery is an array, handle each element independently
        if (Array.isArray(childQuery)) {
            let childIndex = 0;
            function processNextQuery() {
                if (childIndex >= childQuery.length) {
                    if (callback) {
                        callback();
                    }
                    return;
                }
                let query = childQuery[childIndex];
                childIndex++;
                SizeHelper.makeChildrenSameHeight($parent, query, processNextQuery, retriesLeft);
            }
            processNextQuery();
            return;
        }

        // check arguments
        if (!$parent) {
            console.warn('Called to makeProductImagesSameHeight without $parent');
            return;
        }

        // grab all product images
        let $productImages = $parent.querySelectorAll(childQuery);
        if ($productImages.length === 0) {
            console.warn('No product images found for query: ' + childQuery);
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

        // make sure we were able to detect the heights, if we call this
        // before the elements are added to the DOM they'll all be 0
        if (maxHeight <= SizeHelper.minHeight) {
            if (retriesLeft < 0) {
                return;
            }
            setTimeout(() => {
                SizeHelper.makeChildrenSameHeight($parent, childQuery, callback, retriesLeft - 1);
            }, 1000);
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

        // notify callback
        if (typeof callback === 'function' && callback) {
            callback();
        }
    }
}