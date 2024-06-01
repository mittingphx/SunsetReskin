/**
 * Project: Sunset Wholesale West Website
 * File:    UrlHelper.js
 * Author:  Scott Mitting
 * Date:    2024-05-15
 * Abstract:
 *  Internal helper methods for dealing with URL conversions.
 */

/**
 * Helper methods when dealing with URLs.
 */
export class UrlHelper {

    /**
     * Returns the base URL of the current page.
     * @returns {string}
     */
    static getBaseUrl() {
        return window.location.origin;
    }

    /**
     * Returns true iff the url is on the same domain.
     * @param url {string|HTMLAnchorElement}
     * @returns {boolean}
     */
    static urlIsOnSameDomain(url) {
        if (!url) return true;
        if (url instanceof HTMLAnchorElement) {
            url = url.href;
        }
        if (!url.startsWith('http')) return true;
        let baseUrl = UrlHelper.getBaseUrl();
        return url.startsWith(baseUrl);
    }

    /**
     * Converts an absolute URL pointing at https://swwest.com to a
     * relative url that can be used to navigate to the same page.
     * @param url {string}
     */
    static makeRelativeUrl(url) {
        // TODO: need to make sure we're currently in the root of the website,
        // fow now we'll just assume we're in the root of the website


        if (url.startsWith('https://swwest.com')) {
            url = url.replace('https://swwest.com', '');
        }
        if (url.startsWith('/')) {
            url = url.substring(1);
        }
        return url;
    }

    /**
     * Adds a slash to the end of a url if it doesn't already have one.
     * @param url {string}
     * @returns {string}
     */
    static addTrailingSlash(url) {
        if (!url.endsWith('/')) {
            url += '/';
        }
        return url;
    }

    /**
     * Removes a slash from the end of a url if it has one.
     * @param url {string}
     * @returns {string}
     */
    static removeTrailingSlash(url) {
        if (url.endsWith('/')) {
            url = url.substring(0, url.length - 1);
        }
        return url;
    }

    /**
     * Convert a full size image url to a thumbnail image url
     * @param src {string}
     * @returns {string}
     */
    static toThumbNail(src) {
        return src.replace('.jpg', 'thn.jpg');
    }

    /**
     Convert a thumbnail image url to a full size image url
     * @param src {string}
     * @returns {string}
     */
    static toFullSize(src) {
        return src.replace('thn.', '.');
    }
}
