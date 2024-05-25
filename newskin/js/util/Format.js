/**
 * String formatting helper functions.
 */
export class Format {

    /**
     * Formats a number as money if the format of $1.23
     * @param value
     * @returns {string}
     */
    static money(value) {
        return '$' + value.toFixed(2);
    }
}