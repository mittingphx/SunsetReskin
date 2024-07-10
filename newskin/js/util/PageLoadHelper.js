/**
 * Utility functions for detecting when the hidden page is ready to be used.
 */
export class PageLoadHelper {

    /**
     * Sets an interval that keeps checking if a page has loaded
     * and calls a callback once it's ready.
     * @param wnd {Window} window to wait for
     * @param callback {function} callback to call once the page is ready
     */
    static waitUntilPageReady = (wnd, callback) => {

        // wait until window can receive an injected script
        let interval = setInterval(_ => {

            // wait for window to load
            if (!wnd || !wnd.document || !wnd.document.body) {
                return;
            }

            // wait until there's actually something in the body;
            if (wnd.document.body.innerText.length === 0) {
                return;
            }

            // stop waiting
            clearInterval(interval);

            // do callback
            callback(wnd);
        });
    };

    /**
     * Waits until the page changes and calls a callback when it does.
     * @param wnd {Window} window to wait for
     * @param callback {function} callback to call once the page is ready
     */
    static waitUntilPageChange(wnd, callback) {

        let oldUrl = wnd.location.href;
        let oldTitle = wnd.document.title;

        let interval = setInterval(async _ => {
            if (wnd.location.href === oldUrl) {
                return;
            }
            console.log('window title = ' + wnd.document.title
                + ' location=' + wnd.location.href
                + ' old=' + oldUrl
                + ' oldTitle=' + oldTitle
            );
            clearInterval(interval);

            // close the temporary window
            if (wnd) {
                wnd.close(); // TODO: is this needed?  maybe remove iframe?
            }

            // do callback
            callback(wnd);

        });

    }
}