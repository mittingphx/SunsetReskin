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
        Unknown: 'Unknown'
    };

    /**
     * Functions to help detect what kind of file is being loaded.
     */
    static PageFn = {
        FrontPage: FileDetector.#isFrontPage,
        Category: FileDetector.#isCategoryPage,
        ItemDetail: FileDetector.#isItemDetailPage
    };

    /**
     * Returns the page type of the current page.
     * @returns {*|string}
     */
    static getPageType() {
        let filename = FileDetector.#getCurrentFilename();
        for (let key in FileDetector.PageFn) {
            if (FileDetector.PageFn[key](filename)) {
                return FileDetector.Pages[key];
            }
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
     * Returns true if the given file is an HTML file
     * @param {string} filename
     * @returns {boolean}
     */
    static #isFrontPage(filename) {
        if (filename === "Default.aspx") return true;
        if (filename === "swwest_copy.html") return true;
        if (filename === "") return true;
        return false;
    }

    /**
     * Returns true if the given file is an HTML file
     * @param {string} filename
     * @returns {boolean}
     */
    static #isCategoryPage(filename) {
        return filename === "ItemSearch.aspx";
    }

    /**
     * Returns true if the given file is an HTML file
     * @param {string} filename
     * @returns {boolean}
     */
    static #isItemDetailPage(filename) {
        return filename === "ItemDetail.aspx";
    }
}
