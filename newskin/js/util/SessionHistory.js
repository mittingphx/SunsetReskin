/**
 * Stores the history API calls in the sessionStorage to allow the
 * history to persist across page loads.
 */
export class SessionHistory {

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

        // grab current state
        let fullState = [];
        if (sessionStorage.getItem('historyState')) {
            fullState = JSON.parse(sessionStorage.getItem('historyState'));
        }

        // add to the history
        fullState.push(state);
        history.pushState(state, '', state.url);

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
        window.addEventListener('popstate', fn);
    }
}