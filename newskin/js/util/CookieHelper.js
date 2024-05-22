/**
 * Helper methods for dealing with HTTP cookies.
 */
export class CookieHelper {

    /**
     * Returns the value of a cookie by name.
     * @param name
     * @returns {string|undefined}
     */
    static getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    /**
     * Sets an HTTP cookie.
     * @param name {string} the name of the cookie to set
     * @param value {string} the value of that cookie
     * @param maxAge {number} the maximum age of the cookie in seconds
     */
    static setCookie(name, value, maxAge) {
        let agePart = maxAge ? '; max-age=' + maxAge : '';
        document.cookie = name + '=' + encodeURIComponent(value) + agePart;
    }

}