/**
 * Project: Sunset Wholesale West Website
 * File:    SunsetSkinHtml.js
 * Author:  Scott Mitting
 * Date:    2024-05-20
 * Abstract:
 *  Handles loading HTML for the new skin.
 *
 */

/**
 * Stores the old and new HTML sections of the website.
 */
export class SunsetSkinHtml {

    /**
     * The <head> section before skin changes.
     * @type {HTMLDivElement | null}
     */
    oldHtmlHead = null;

    /**
     * The <body> section before skin changes.
     * @type {HTMLDivElement | null}
     */
    oldHtmlBody = null;

    /**
     * The <head> section after skin changes.
     * @type {HTMLHeadElement|null}
     */
    newHtmlHead = null;

    /**
     * The <body> section after skin changes.
     * @type {HTMLBodyElement|null}
     */
    newHtmlBody = null;

    /**
     * The entire DOM of the new template file
     * @type {Document|null}
     */
    newHtmlDocument = null;

    /**
     * Header shared across all pages, which is automatically inserted
     * into all loaded template pages.
     * @type {HTMLElement|null}
     */
    header = null;

    /**
     * Constructor saves copy of current webpage.
     */
    constructor() {
        this.oldHtmlBody = document.createElement('div');
        this.oldHtmlHead = document.createElement('div');
        this.oldHtmlBody.innerHTML = document.body.innerHTML;
        this.oldHtmlHead.innerHTML = document.head.innerHTML;
    }

    /**
     * Loads the html template for the new skin from the given url.
     * @param newSkinUrl {string} the url of the new skin
     * @returns {Promise<void>}
     */
    async load(newSkinUrl) {

        let headerIndex = -1;
        let templateIndex = -1;

        // load all needed files in parallel
        let urls = [];
        if (!this.header) {
            urls.push('newskin/html/header.html');
            headerIndex = urls.length - 1;
        }
        if (!this.newHtmlDocument || !this.newHtmlBody || !this.newHtmlHead) {
            urls.push(newSkinUrl);
            templateIndex = urls.length - 1;
        }
        const responses = await Promise.all(urls.map(url => fetch(url)));
        const htmlContents = await Promise.all(responses.map(response => response.text()));
        const documents = htmlContents.map(html => new DOMParser().parseFromString(html, 'text/html'));

        // load header if needed
        if (headerIndex >= 0) {
            this.header = documents[headerIndex].querySelector('header');
        }

        // load template if needed
        if (templateIndex >= 0) {
            this.newHtmlDocument = documents[templateIndex];
        }

        // use new template with header inserted
        this.newHtmlDocument.querySelector('header').replaceWith(this.header);
        this.replaceDocument(this.newHtmlDocument);

        /*
        // load header as needed
        if (!this.header) {
            let headerResponse = await fetch('newskin/html/header.html');
            let headerHtml = await headerResponse.text();
            let headerDocument = new DOMParser().parseFromString(headerHtml, 'text/html');
            this.header = headerDocument.querySelector('header');
        }

        // TODO: load both files in parallel

        // load new skin
        let response = await fetch(newSkinUrl);
        let newHtml = await response.text();
        let newDocument = new DOMParser().parseFromString(newHtml, 'text/html');


*/
    };

    /**
     * Toggles between the old and new HTML.
     * @param set {string} either 'new' or 'old'
     */
    toggle(set) {
        if (set === 'new') {
            document.head.innerHTML = this.newHtmlHead.innerHTML;
            document.body.innerHTML = this.newHtmlBody.innerHTML;

            // run any scripts within template code
            // note: this hack does not allow functions to be
            // included that can be called later, but that
            // shouldn't be needed.
            let scripts = this.newHtmlBody.querySelectorAll('script');
            for (let i = 0; i < scripts.length; i++) {
                try {
                    eval(scripts[i].innerHTML);
                }
                catch {
                    console.error('failed to run script: ' + scripts[i].innerHTML);
                }
            }
        }
        else if (set === 'old') {
            document.head.innerHTML = this.oldHtmlHead.innerHTML;
            document.body.innerHTML = this.oldHtmlBody.innerHTML;
        }
        else {
            console.error('unknown set: ' + set);
        }
    }

    /**
     * Replaces the head and body of the current document with a new one.
     * @param doc {Document}
     */
    replaceDocument(doc) {

        // remove base tag from head, which is used for relative links
        // within the templates so the IDE works correctly
        let baseTag = doc.querySelector('base');
        if (baseTag) {
            baseTag.remove();
        }

        // grab head and body from loaded document
        this.newHtmlBody = doc.querySelector('body');
        this.newHtmlHead = doc.querySelector('head');

        // replace old document with new
        this.toggle('new');
    }

    /**
     * Removes HTML elements from the old document.
     * @param selector {any}
     */
    removeElementsFromOld(selector) {
        let results = this.oldHtmlBody.querySelectorAll(selector);
        for (let i = 0; i < results.length; i++) {
            results[i].remove();
        }
    }
}
