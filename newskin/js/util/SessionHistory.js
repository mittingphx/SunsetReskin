/**
 * Stores the history API calls in the sessionStorage to allow the
 * history to persist across page loads.
 */
export class SessionHistory {

    /**
     * Last timestamp when a popstate event was fired, which is used
     * to detect that the current page is being loaded because of a
     * browser back/forward.
     * @type {number}
     */
    static #lastPopStateTime = 0;

    /**
     * @typedef {object} HistoryState
     * @property {string} url the url in the browser history
     * @property {number} scroll the last y scroll position of the page
     */

    /**
     * Adds to the history API in a way to persists across page loads
     * @param state {object} the state to add
     */
    static push(state) {

        // detect if this is a popstate event and ignore if so
        // let elapsed = Date.now() - SessionHistory.#lastPopStateTime;
        if (SessionHistory.#isHistoryEvent()) {
            // alert('ignoring push call because this page is loaded because of a browser back/forward.  elapsed: ' + elapsed);
            return;
        }

        // log call
        // alert('SessionHistory.push(elapsed: ' + elapsed + ') => ' + state.url);

        // grab current state
        let fullState = [];
        if (sessionStorage.getItem('historyState')) {
            fullState = JSON.parse(sessionStorage.getItem('historyState'));
        }

        // add to the history
        let historyItem = { url: state.url, scroll: state.scroll };
        fullState.push(historyItem);
        history.pushState(historyItem, '', state.url);

        // store history to the session state to preserve across page loads
        sessionStorage.setItem('historyState', JSON.stringify(fullState));
    }

    /**
     * Fills the history API in a way to restores the last state before a page load
     */
    static restore() {

        // grab current state
        let fullState = [];
        if (sessionStorage.getItem('historyState')) {
            fullState = JSON.parse(sessionStorage.getItem('historyState'));
        }

        // add the entire state to the history
        for (let i = 0; i < fullState.length; i++) {
            history.pushState(fullState[i], '', fullState[i].url);
        }
    }

    /**
     * Registers a function to be called when the state changes
     * @param fn {function} the function to call when the state changes
     */
    static addListener(fn) {
        window.addEventListener('popstate', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            // alert('popstate, loading url => ' + event.state.url + ' scroll => ' + event.state.scroll);
            SessionHistory.#markAsHistoryEvent()
            fn(event);
        });
    }

    /**
     * Marks the current page load as a history event.
     */
    static #markAsHistoryEvent() {
        SessionHistory.#lastPopStateTime = Date.now();
    }

    /**
     * Returns true if the current page load is due to a browser back/forward.
     * @return {boolean}
     */
    static #isHistoryEvent() {
        let elapsed = Date.now() - SessionHistory.#lastPopStateTime;
        return elapsed < 1000;
    }
}