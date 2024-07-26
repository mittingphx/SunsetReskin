// noinspection JSUnusedGlobalSymbols

import {fixUrl} from "../UrlHelper.js";

/**
 * One url and element to read in a set to multi-fetch.
 */
export class FetchQueryItem {

    /**
     * The url to load with fetch()
     * @type {string|null}
     */
    url = null;

    /**
     * The DOM query to search for
     * @type {string|null}
     */
    query = null;

    /**
     * When true the element if pulled instead of its value. (default: false)
     * @type {boolean}
     */
    getElement = false;

    /**
     * Constructor accepts both parts for the item.
     * @param url {string} url to grab from
     * @param query {string} DOM selector
     * @param getElement {boolean} grab element instead of value (default: false)
     */
    constructor(url, query, getElement = false) {
        //this.url = UrlHelper.makeRelativeUrl(url);
        this.url = fixUrl(url);
        this.query = query;
        this.getElement = getElement;
    }
}

/**
 * Provides the list of URLs to fetch in the multiFetch calls.
 */
export class FetchQueryList {

    /**
     * The items that needs to be fetched keyed by the property names
     * to assign them to.
     * @type {Object.<string, FetchQueryItem>}
     */
    items = {};

    /**
     * Fills the items list from a variety of different sources.
     * @param args {*}
     *
     */
    constructor(args) {

        // type should be {Object.<string, (FetchQueryItem|string[]|string|*)[]>}

        if (args) {
            for (let key in args) {
                let item = args[key];

                // array of [url, query]
                if (Array.isArray(item)) {
                    if (item.length !== 2) {
                        console.error('Invalid item: ' + JSON.stringify(item) + ' for key: ' + key + ' expected length of 2');
                        continue;
                    }
                    this.add(key, item[0], item[1]);
                    continue;
                }

                // string in format 'url/query'
                if (typeof item === 'string') {
                    item = String(item);
                    let splitIndex = item.lastIndexOf('/');
                    if (splitIndex === -1) {
                        console.error('Invalid item: ' + JSON.stringify(item) + ' for key: ' + key);
                        continue;
                    }
                    this.add(key, item.substring(0, splitIndex), item.substring(splitIndex + 1));
                    continue;
                }

                // FetchQueryItem
                if (item instanceof FetchQueryItem) {
                    this.addItem(key, item);
                    continue;
                }

                // POJO in form {url: 'url', query: 'query'}
                if (item.hasOwnProperty('url')) {
                    this.add(key, item.url, item.query);
                    continue;
                }

                // unknown format
                console.error('Unknown item: ' + JSON.stringify(item) + ' for key: ' + key);
            }
        }
    }

    /**
     * Adds a new url and query to be fetched to this object.
     * @param key {string}
     * @param url {string}
     * @param query {string}
     */
    add(key, url, query) {
        this.addItem(key, new FetchQueryItem(url, query));
    }

    /**
     * Adds a new item object to be fetched.
     * @param key {string}
     * @param item {FetchQueryItem}
     */
    addItem(key, item) {
        this.items[key] = item;
    }

    /**
     * Returns the unique URLS from the fetch list.
     * @returns {string[]}
     */
    getUniqueUrlList() {
        let urls = {}
        for (let key in this.items) {
            let item = this.items[key];
            if (item.url) {
                //item.url = FetchHelper.makeRelativeUrl(item.url);
                urls[item.url] = true;
            }
        }
        return Object.keys(urls);
    }
}

/**
 * Class that allows multiple simultaneous fetches.
 */
export class FetchHelper {

    /**
     * Fetches all the urls needed to grab the requested elements
     * simultaneously, returning the innerHTML of each.
     * @param queryList {FetchQueryList}
     * @returns {Promise<Object.<string,string>>}
     */
    async fetchAndQuery(queryList) {

        // request urls over network
        let urls = queryList.getUniqueUrlList();
        const responses = await Promise.all(urls.map(url => fetch(url)));
        const htmlContents = await Promise.all(responses.map(response => response.text()));

        // cache each result by url
        let fetchedPages = {};
        for (let i = 0; i < urls.length; i++) {
            let html = htmlContents[i];
            fetchedPages[urls[i]] = new DOMParser().parseFromString(html, 'text/html');
        }

        // grab innerHTML from each
        let results = {};
        for (let key in queryList.items) {
            let query = queryList.items[key];
            let $element = fetchedPages[query.url].querySelector(query.query);
            if (!$element) {
                console.warn( 'Could not find element with query: ' + query.query + ' in url: ' + query.url);
                continue;
            }

            // grab element when requested
            if (query.getElement) {
                results[key] = $element;
                continue;
            }

            // otherwise grab value
            switch ($element.tagName) {
                case 'IMG':
                    results[key] = $element.src;
                    break;
                case 'INPUT':
                    results[key] = $element.value;
                    break;
                default:
                    results[key] = $element.innerHTML;
                    break;
            }
        }
        return results;
    }

    /**
     * Performs the fetch from a synchronous call, sending results
     * to a callback when they are available.
     * @param fetchQueryList {FetchQueryList}
     * @param callback {Function}
     */
    fetchAndQueryCallback(fetchQueryList, callback) {
        this.fetchAndQuery(fetchQueryList).then((results) => {
            callback(results);
        });
    }
}
