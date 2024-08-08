/**
 * Class that provides ways to call javascript functions when normal
 * event handlers are either not working or are unavailable.
 */
export class ClickHelper {

    /**
     * Next id to use in #handlers
     * @type {number}
     */
    static #nextId = 0;

    /**
     * Array of registers handlers.
     * @type {function(Event)[]}
     */
    static #handlers = [];

    /**
     * Registers a function to be called when a short javascript
     * string is needed to be set to the onclick attribute.
     * @param fn {function} click handler function
     * @returns {string} a string that can be inserted into the
     * onclick attribute to allow the function to be called
     */
    static registerFunction(fn) {
        window.ClickHelper = ClickHelper;
        let id = ClickHelper.#nextId++;
        ClickHelper.#handlers[id] = fn;
        return `ClickHelper.call(${id}, event)`;
    }

    /**
     * Makes the call to a registered function.  A call to this function
     * is returned by registerFunction()
     * @param id {number} the id of the function to call
     * @param e {Event} the event that triggered the call (if available)
     */
    static call(id, e) {
        ClickHelper.#handlers[id](e);
    }

}