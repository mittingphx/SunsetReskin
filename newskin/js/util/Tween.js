import {Range} from "./Range.js";


/**
 * Helper functions for easing, clamping, and resizing math values.
 */
export class MathFilter {

    /**
     * Converts a value within a range into a new range, for example
     * a value between 0.25 - 1.0 could be converted to 0.0 - 1.0
     * for some calculates and then back to 0.25 - 1.0
     * @param t {number} value to translate
     * @param oldMin {number} the minimum value of the old range
     * @param oldMax {number} the maximum value of the old range
     * @param newMin {number} the minimum value of the new range
     * @param newMax {number} the maximum value of the new range
     * @returns {number}
     */
    static translate(t, oldMin, oldMax, newMin, newMax) {
        let oldRange = oldMax - oldMin;
        let newRange = newMax - newMin;
        return (((t - oldMin) * newRange) / oldRange) + newMin;
    }

    /**
     * Takes a value and clamps it to one of the values specified in
     * an array of allowed values.
     * @param t {number} the value to clamp
     * @param values {number[]} a sorted array of allowed values
     * @returns {number}
     */
    static distinctClamp(t, values) {
        let index = 0;
        while (t > values[index] && index < values.length - 1) {
            index++;
        }
        return values[index];
    }

    /**
     * Performs the easing function on both the start and end of the range.
     * @param t {number} between 0.0 and 1.0
     * @param pow {number} the power of the easing (default: 3)
     * @returns {number}
     */
    static easeInOut(t, pow = 3) {
        return t < 0.5 ? 4*Math.pow((t-1),pow)+1 : 4*Math.pow(t,pow);
    }

    /**
     * Performs the easing function on the end of the range.
     * @param t {number} between 0.0 and 1.0
     * @param pow {number} the power of the easing (default: 3)
     * @returns {number}
     */
    static easeOut(t, pow = 3) {
        return 1 - Math.pow(1 - t, pow);
    }

    /**
     * Performs the easing function on the start of the range.
     * @param t {number} between 0.0 and 1.0
     * @param pow {number} the power of the easing (default: 3)
     * @returns {number}
     */
    static easeIn(t , pow = 3) {
        return Math.pow(t, pow);
    }
}

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

