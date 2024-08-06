/**
 * Utility functions for helping with DOM element sizes
 */
export class SizeHelper {

    /**
     * Makes all child elements found by a query the same height within the parent.
     * @param $parent {HTMLElement} the parent element
     * @param childQuery {string} the query selector for the child elements
     * @param callback {function} called after the heights are calculated successfully (may take a few retries)
     * @param retriesLeft {number} number of retries before giving up (default 5)
     */
    static makeChildrenSameHeight($parent, childQuery= '.product-image', callback = null, retriesLeft = 5) {

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

        // find the tallest .product-image <div>
        let maxHeight = 0;
        $productImages.forEach($productImage => {
            //let height = $productImage.offsetHeight;
            let height = $productImage.clientHeight;
            if (height > maxHeight) {
                maxHeight = height;
            }
        });

        // make sure we were able to detect the heights, if we call this
        // before the elements are added to the DOM they'll all be 0
        if (maxHeight <= 32) {
            if (retriesLeft < 0) {
                console.warn('Call to makeChildrenSameHeight() failed after 5 retries.  ' +
                    'Query = ' + childQuery + '.  Height = ' + maxHeight, $parent);
                return;
            }
            console.warn('Call to makeChildrenSameHeight() to early for DOM to calculate heights.  ' +
                'Query = ' + childQuery + '.  Height = ' + maxHeight + '.  Retrying in 1 second...');
            setTimeout(() => {
                SizeHelper.makeChildrenSameHeight($parent, childQuery, callback, retriesLeft - 1);
            }, 1000);
            return;
        }

        // set all .product-image <div> to the same height
        $productImages.forEach($productImage => {
            $productImage.style.height = maxHeight + 'px';
        });

        // notify callback
        if (typeof callback === 'function' && callback) {
            callback();
        }
    }
}