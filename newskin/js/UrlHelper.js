/**
 * Project: Sunset Wholesale West Website
 * File:    UrlHelper.js
 * Author:  Scott Mitting
 * Date:    2024-05-15
 * Abstract:
 *  Internal helper methods for dealing with URL conversions.
 */

/**
 * Parses an url into its component parts relative to the deployed
 * location it is running within.
 */
export class SplitUrl {

    /**
     * The original url that was passed in
     * @type {string|null}
     */
    sourceUrl = null;

    /**
     * The base deployment url, which can include sub-folders.
     * @type {string|null}
     */
    server = null;

    /**
     * The hierarchy of folders within the url after the server.
     * @type {string[]}
     */
    folders = [];

    /**
     * The filename portion of the url
     * @type {string|null}
     */
    filename = null;

    /**
     * The part of the url after the ? or #, whichever comes first.
     * Includes the ? or # so we know how to reconstruct the url
     * @type {string|null}
     */
    query = null;

    /**
     * Splits an url into its server deployment, hierarchy of folders,
     * filename, and query.
     * @param url {string|null} the url to split, defaults to the current
     * @returns {SplitUrl|null}
     */
    static parse(url = null) {

        let ret = new SplitUrl()
        ret.sourceUrl = url;

        if (url && url.startsWith('http') === false) {
            console.error('Calling SplitUrl.parse() with a relative link is not supported');
            return null;
        }

        // list of known deployments
        let deployments = [
            'https://swwest.com/reskin/',
            'https://swwest.com/',
            'http://localhost/sunset/',
        ];

        // find which domain we're on
        if (!url) url = '' + document.location;
        for (let i = 0; i < deployments.length; i++) {
            if (url.startsWith(deployments[i])) {
                ret.server = deployments[i];
                url = url.substring(deployments[i].length);
                break;
            }
        }

        if (!ret.server) {
            console.error('Url is not on a known deployment: ' + url);
            return null;
        }

        // split the url query
        let index = url.indexOf('?');
        let index2 = url.indexOf('#');
        if (index2 > 0 && (index < 0 || index2 < index)) {
            index = index2;
        }
        if (index > 0) {
            ret.query = url.substring(index); // anything after the ? or # including the ? or #
            url = url.substring(0, index);
        }

        // split the url into folders
        ret.folders = url.split('/');
        ret.filename = ret.folders.pop();
        ret.folders = ret.folders.filter((v, i) => i > 0);

        return ret;
    }
}

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
        let ret = '';

        let target = SplitUrl.parse(url);
        let current = SplitUrl.parse(null);

        // we're going to allow different deployments, because localhost sometimes gets links to swwest.com that don't work
        /*
        if (target.server !== current.server) {
            console.error('UrlHelper.makeRelativeUrl() called with a url that is not on the same deployment: ' + url);
            return url;
        }
        */

        // get depth of folders that is the same for both
        let skipFolderCount = 0;
        for (let i = 0; i < current.folders.length; i++) {
            if (current.folders[i] !== target.folders[i]) {
                skipFolderCount = i;
                break;
            }
        }

        // get number of folders we need to walk up to get to the common folder
        for (let i = skipFolderCount; i < current.folders.length; i++) {
            ret += '../';
        }

        // add the remaining folders to make the target a relative url
        for (let i = skipFolderCount; i < target.folders.length; i++) {
            ret += target.folders[i] + '/';
        }

        // add back the filename and query
        if (target.filename) ret += target.filename;
        if (target.query) ret += target.query;

        return ret;
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
