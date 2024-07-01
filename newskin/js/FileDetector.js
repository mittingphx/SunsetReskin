/**
 * Project: Sunset Wholesale West Website
 * File:    FileDetector.js
 * Author:  Scott Mitting
 * Date:    2024-05-13
 * Abstract:
 *  Classes to help detect what kind of file is being loaded.
 */

/**
 * Helper class for detecting what kind of file is being loaded.
 */
export class FileDetector {

    /**
     * The types of pages detected by this class.
     */
    static Pages = {
        FrontPage: 'FrontPage',
        Category: 'Category',
        ItemDetail: 'ItemDetail',
        ContactUs:  'ContactUs',
        Cart: 'Cart',
        Login: 'Login',
        Unknown: 'Unknown'
    };

    /**
     * List of files to belong to a given page type or optionally
     * a custom function to help determine which page type it belongs to.
     */
    static #PageFn = {
        FrontPage: [ 'Default.aspx', 'swwest_copy.html', 'index.html', ''],
        // determine if it's a category page or a search result
        Category: [ 'ItemSearch.aspx', 'swwest_category.html' ],
        ContactUs: [ 'ContactUs.aspx' ],
        ItemDetail: [ 'ItemDetail.aspx', 'swwest_detail.html'],
        Cart: [ 'ViewCart.aspx', 'swwest_cart.html' ],
        Login: [ 'Login.aspx', 'swwest_login.html' ]
    };

    /**
     * Returns the page type of the current page.
     * @param url {string|null} the url of the current page, or null to use the window.location
     * @returns {*|string}w
     */
    static getPageType(url= null) {
        let filename;
        try {
            filename = FileDetector.#getCurrentFilename(url);
        }
        catch (e) {
            console.error(e);
            return FileDetector.Pages.Unknown;
        }
        for (let key in FileDetector.#PageFn) {
            let fn = FileDetector.#PageFn[key];
            if (typeof fn === 'function') {
                if (fn(filename)) return key;
            }
            else if (FileDetector.#matchFilename(filename, fn)) return key;
        }
        return FileDetector.Pages.Unknown;
    }

    /**
     * Returns the filename from the current url, optionally passing in that current url
     * @param currentUrl {string|null}
     * @returns {string}
     */
    static #getCurrentFilename(currentUrl = null) {
        let url = window.location.pathname;
        if (currentUrl) {
            try {
                if (url.indexOf('/') > -1) {
                    url = new URL(currentUrl).pathname;
                }
                else {
                    url = currentUrl;
                }
            } catch {
                url = currentUrl;
            }
        }
        if (url.indexOf('/') > -1) {
            let lastSlash = url.lastIndexOf('/');
            return lastSlash === -1 ? '' : url.substring(lastSlash + 1);
        }
        else {
            return url;
        }
    }

    /**
     * Returns true if the filename is in the list
     * @param {string} filename
     * @param list {string[]}
     * @returns {boolean}
     */
    static #matchFilename(filename, list) {
        for (let i = 0; i < list.length; i++) {
            if (filename === list[i]) return true;
        }
        return false;
    }
}
