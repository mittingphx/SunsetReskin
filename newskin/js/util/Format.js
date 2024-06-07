/**
 * String formatting helper functions.
 */
export class Format {

    /**
     * Parses a price string and returns it as a formatted string including leading $
     * @param price {string|number}
     * @returns {string}
     */
    static formatPrice(price) {
        let priceSplit = ('' + price).split('.');
        if (priceSplit.length > 1) {
            price = priceSplit[0] + '.' + (priceSplit[1] + '00').substring(0, 2);
        }
        else {
            price = price + '.00';
        }

        if (!price.startsWith('$')) {
            price = '$' + price;
        }

        return price;
    }

    /**
     * Gets a number out of a string that contains a price.
     * @param priceString {string}
     * @returns {number}
     */
    static parsePrice(priceString) {
        const regex = /[+-]?\d+(\.\d+)?/g;
        let match = regex.exec(priceString);
        if (match) {
            return parseFloat(match[0]);
        }
        else {
            return 0;
        }
    }


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