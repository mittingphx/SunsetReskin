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
        FrontPage: [ 'Default.aspx', 'swwest_copy.html', ''],
        // TODO: this may need to be a custom function so we can
        // determine if it's a category page or a search result
        Category: [ 'ItemSearch.aspx', 'swwest_category.html' ],
        ItemDetail: [ 'ItemDetail.aspx', 'swwest_detail.html'],
        Cart: [ 'ViewCart.aspx', 'swwest_cart.html' ],
        ContactUs: [ 'ContactUs.aspx' ],
        Login: [ 'Login.aspx' ]
    };

    /**
     * Returns the page type of the current page.
     * @returns {*|string}
     */
    static getPageType() {
        let filename = FileDetector.#getCurrentFilename();
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
     * Returns the filename from the current url.
     * @returns {string}
     */
    static #getCurrentFilename() {
        let url = window.location.pathname;
        let lastSlash = url.lastIndexOf('/');
        return lastSlash === -1 ? '' : url.substring(lastSlash + 1);
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
