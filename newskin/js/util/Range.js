
/**
 * A set of two numbers that represent a range.
 */
export class Range {

    /**
     * Start value of the range.
     * @type {number}
     */
    start = 0;

    /**
     * End value of the range.
     * @type {number}
     */
    end = 100;

    /**
     * Returns the length of the range.
     * @returns {number}
     */
    get length() {
        return this.end - this.start;
    }

    /**
     * Constructs a range.
     * @param start {number}
     * @param end {number}
     */
    constructor(start = 0, end = 1) {
        this.start = start;
        this.end = end;
    }
}
