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
