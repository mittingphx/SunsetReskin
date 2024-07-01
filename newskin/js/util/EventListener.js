
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
     * @type {function(*)[]}
     */
    #listeners = [];

    /**
     * Function that generates argument sent to event.
     * @type {function|null}
     */
    #fnArgument = null;

    /**
     * The last argument sent to the event.
     * @type {*|null}
     */
    #lastArgument = null;

    /**
     * Set to true when the event has been triggered.  When true, new listeners
     * will be called immediately after being added.
     * @type {boolean}
     */
    #triggered = false;

    /**
     * @param name {string}
     * @param fnArgument {function} optional function that generates argument sent to event (default is this)
     */
    constructor(name = 'event', fnArgument = () => { return this; }) {
        this.name = name;
        this.#fnArgument = fnArgument;
    }

    /**
     * Adds a listener for this event.  Calls the listener immediately
     * if the event has already been triggered and not cleared.
     * @param fn {function(*)}
     */
    addListener(fn) {
        this.#listeners.push(fn);
        if (this.#triggered) {
            fn(this.#lastArgument);
        }
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
     * @param autoClear {boolean} does not keep the event triggered when set (default: false)
     */
    trigger(autoClear = false) {
        let arg = this.#fnArgument();
        this.#triggered = !autoClear;
        this.#lastArgument = arg;
        for (let fn of this.#listeners) {
            fn(arg);
        }
        if (autoClear) {
            this.clearTrigger();
        }
    }

    /**
     * Clears the event's trigger so that no new listeners will be called.
     */
    clearTrigger() {
        this.#triggered = false;
        this.#lastArgument = null;
    }
}