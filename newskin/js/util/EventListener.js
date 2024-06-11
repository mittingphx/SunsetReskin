
/**
 * Manages the handlers around a custom event.
 */
export class EventListener {

    /**
     * Name to use for this event (optional, default: 'event')
     * @type {string|null}
     */
    name = null;

    /**
     * Array of function callbacks that are called when event triggers
     * @type {function(EventListener)[]}
     */
    #listeners = [];

    /**
     * Function that generates argument sent to event.
     * @type {function|null}
     */
    #fnArgument = null;

    /**
     * @param name {string}
     * @param fnArgument {function} optional function that generates argument sent to event (default is this)
     */
    constructor(name = 'event', fnArgument = () => { return this; }) {
        this.name = name;
        this.#fnArgument = fnArgument;
    }

    /**
     * Adds a listener for this event.
     * @param fn {function(EventListener)}
     */
    addListener(fn) {
        this.#listeners.push(fn);
    }

    /**
     * Removes a listener for this event.
     * @param fn {function(EventListener)}
     */
    removeListener(fn) {
        let index = this.#listeners.indexOf(fn);
        if (index > -1) {
            this.#listeners.splice(index, 1);
        }
    }

    /**
     * Sends a notification to all listeners with a reference to this instance.
     */
    trigger() {
        let arg = this.#fnArgument();

        for (let fn of this.#listeners) {
            fn(arg);
        }
    }
}