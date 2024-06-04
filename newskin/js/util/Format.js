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

    /**
     * Returns true iff the value (or input with a value) entered contains a valid email
     * @param value {string|HTMLInputElement}
     * @returns {boolean}
     */
    static isEmail(value) {
        if (value instanceof HTMLInputElement) {
            value = value.value;
        }

        return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value);
    }
}