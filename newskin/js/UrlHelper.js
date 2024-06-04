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
     * Finds the base url of the copy of this website that is serving
     * the current page, so we can determine how to convert relative
     * urls to absolute urls.
     * @param url {string|null}
     */
    static findDeployment(url= null) {

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
                return deployments[i];
            }
        }

        console.error('Url is not on a known deployment: ' + url);
        return null;
    }

    /**
     * Splits an url into its server deployment, hierarchy of folders,
     * filename, and query.
     * @param url {string|null} the url to split, defaults to the current
     * @returns {SplitUrl|null}
     */
    static parse(url = null) {

        let ret = new SplitUrl()
        ret.sourceUrl = url || '' + document.location;

        // if url is relative, use current location to determine deployment
        // to support links that both start and don't start with /.
        let deployment;
        if (url && url.startsWith('http') === false) {
            deployment = SplitUrl.findDeployment(null);
        }
        else {
            deployment = SplitUrl.findDeployment(url);
        }

        // assign the deployment and extract the rest of the url
        ret.server = deployment;
        if (!ret.server) {
            return null;
        }
        if (!url) {
            url = '' + document.location;
        }
        if (url.startsWith(ret.server)) {
            url = url.substring(ret.server.length);
        }

        // remove the leading slash if still present
        if (url.startsWith('/')) {
            url = url.substring(1);
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
        //ret.folders = ret.folders.filter((v, i) => i > 0);

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
     * Gets the base deployment url of the running website.
     * @returns {string}
     */
    static getDeployment() {
        return SplitUrl.findDeployment(null);
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
