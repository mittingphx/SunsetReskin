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

        let originalUrl = url;

        // if url is relative, use current location to determine deployment
        if (!url) url = '' + document.location;
        if (url.startsWith('http') === false) {
            url = '' + document.location;
        }

        // list of known deployments
        let deployments = [
            'https://swwest.com/reskin/',
            'https://swwest.com/',
            'http://localhost/sunset/',
        ];

        // find which domain we're on
        for (let i = 0; i < deployments.length; i++) {
            if (url.startsWith(deployments[i])) {
                return deployments[i];
            }
        }

        // report an error if we didn't find a match
        if (url !== originalUrl) {
            console.error('Url is not on a known deployment: ' + originalUrl + ' (using ' + url + ')');
        }
        else {
            console.error('Url is not on a known deployment: ' + originalUrl);
        }
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
     * Returns true if the current url is on localhost.  Borrowed from React.
     * @returns {boolean}
     */
    static isLocalhost = Boolean(
        window.location.hostname === 'localhost' ||
        // [::1] is the IPv6 localhost address.
        window.location.hostname === '[::1]' ||
        // 127.0.0.1/8 is considered localhost for IPv4.
        window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
        )
    );

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
        if (url instanceof HTMLElement) {
            url = url.getAttribute('href');
        }
        if (!url.startsWith('http')) return true;
        let baseUrl = UrlHelper.getBaseUrl();
        return url.startsWith(baseUrl);
    }

    /**
     * Converts a relative url to an absolute url to resolve some problems
     * fetch was having dealing with relative urls when using the history
     * API while changing sub-folders.
     * @param url {string}
     */
    static makeAbsoluteUrl(url) {

        let linkDeployment = SplitUrl.findDeployment(url);
        let currentDeployment = SplitUrl.findDeployment(null);

        // if url is for an offsite link, just use that
        if (!linkDeployment) {
            return url;
        }

        // if url contains its deployment url, strip it out
        if (url.startsWith(linkDeployment)) {
            url = url.substring(linkDeployment.length);
        }

        // re-home the url to the current page's deployment server
        return new URL(url, currentDeployment).toString();
    }

    /**
     * Finds all <a> tags and maps their hrefs to absolute urls.
     * @param $parent
     */
    static mapLinks($parent) {
        // console.log('mapLinks', $parent);
        $parent.querySelectorAll('a').forEach((a) => {
            let oldHref = a.href
            a.href = UrlHelper.makeAbsoluteUrl(oldHref);
            if (oldHref !== a.href) {
                console.log('UrlHelper.mapLinks() mapped ' + oldHref + ' to ' + a.href);
            }
        });
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

/**
 * Short version of UrlHelper.makeAbsoluteUrl() that can more easily
 * be embedded in html generating code.
 * @param url {string}
 * @returns {string}
 */
export function fixUrl(url) {
    return UrlHelper.makeAbsoluteUrl(url);
}
