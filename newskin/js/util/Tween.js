import {Range} from "./Range.js";

/**
 * Class that handles fading between two value over a period of time.
 */
export class Tween {

    /**
     * The function called whenever the tween changes the output value
     * @type {function(Tween, number)}
     */
    fnCallback = null;

    /**
     * Returns true if the tween is active.
     * @returns {boolean}
     */
    get active() {
        return this.#active;
    }

    /**
     * Starts or stops the tween depending on the value.
     * @param value
     */
    set active(value) {
        if (value) {
            this.start();
        } else {
            this.stop();
        }
    }

    /**
     * The range of values that the tween can take.
     * @type {Range}
     */
    range = new Range(0, 100);

    /**
     * How long the tween should take in milliseconds.
     * @type {number}
     */
    duration = 1000;

    /**
     * The tween is running when set to true.
     * @type {boolean}
     */
    #active = false;

    /**
     * The handle of the setInterval() call that runs the animation.
     * @type {number}
     */
    #intervalHandle = 0;

    /**
     * The time that the tween started
     * @type {number}
     */
    #startTime = 0;

    /**
     * How long the tween has been running in seconds.
     * @type {number}
     */
    get elapsed() {
        if (!this.active) {
            return 0;
        }
        return (Date.now() - this.#startTime) / 1000;
    }

    /**
     * The percentage through the tween so far.
     * @type {number} between 0.0 and 1.0
     */
    get percent() {
        return this.elapsed / this.duration
    }

    /**
     * Current output value of the tween.
     * @type {number} between startValue and endValue
     */
    get progressValue() {
        return this.#progressValue
    }

    /**
     * The current value that is manipulated by the tween.
     * @type {number}
     */
    #progressValue = 0;

    /**
     * Constructor optionally takes the callback function, range, and duration of the animation.
     * @param {function(Tween, number)} callback
     * @param {Range} range
     * @param {number} duration
     */
    constructor(callback = null, range = null, duration = 0) {
        this.fnCallback = callback;
        this.range = range || new Range(0, 100);
        this.duration = duration || 1000;
    }

    /**
     * Manually sets the progress value, which triggers the callback if available.
     * @param value
     */
    setProgressValue(value) {
        if (this.#progressValue === value) { // prevents infinite loops at stop()
            return;
        }
        this.#progressValue = value;

        if (this.fnCallback) {
            if (this.#active) {
                this.fnCallback(this, this.#progressValue);
            }
        }
    }

    /**
     * Starts the animation, optionally specifying a new callback.
     */
    start(callback= null) {
        if (callback) {
            this.fnCallback = callback;
        }
        this.#startTime = Date.now();
        this.#active = true;

        // start the background thread
        if (this.#intervalHandle) {
            clearInterval(this.#intervalHandle);
        }
        this.#intervalHandle = setInterval(_ => {
            this.step();
        }, 1000 / 60);
    }

    /**
     * Stops the animation
     */
    stop() {

        // kill the background thread
        if (this.#intervalHandle) {
            clearInterval(this.#intervalHandle);
            this.#intervalHandle = 0;
        }

        // set the final value
        this.setProgressValue(this.range.end);
        this.#active = false;
    }

    /**
     * Sets the percentage to completed and then stops.
     */
    finish() {
        this.#startTime = 0;
        this.step();
    }

    /**
     * Advances the animation for the current time.
     */
    step() {
        if (!this.active) {
            return;
        }

        this.setProgressValue(this.range.start + this.range.length * this.percent);
        if (this.elapsed >= this.duration) {
            this.stop();
        }
    }
}

