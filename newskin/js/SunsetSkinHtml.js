/**
 * Project: Sunset Wholesale West Website
 * File:    SunsetSkinHtml.js
 * Author:  Scott Mitting
 * Date:    2024-05-20
 * Abstract:
 *  Handles loading HTML for the new skin.
 *
 */

import {TimedMemoizer} from "./util/TimedMemoizer.js";
import {UrlHelper} from "./UrlHelper.js";

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
     * Footer shared across all pages just like the header.
     * @type {HTMLElement|null}
     */
    footer = null;

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
        let footerIndex = -1;
        let templateIndex = -1;

        // load all needed files in parallel
        let urls = [];
        if (!this.header) {
            urls.push('newskin/html/header.html');
            headerIndex = urls.length - 1;
        }
        if (!this.footer) {
            urls.push('newskin/html/footer.html');
            footerIndex = urls.length - 1;
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

        // load footer if needed
        if (footerIndex >= 0) {
            this.footer = documents[footerIndex].querySelector('footer');
        }

        // load template if needed
        if (templateIndex >= 0) {
            this.newHtmlDocument = documents[templateIndex];
        }

        // use new template with header inserted
        this.newHtmlDocument.querySelector('header').replaceWith(this.header);
        this.newHtmlDocument.querySelector('footer').replaceWith(this.footer);
        this.replaceDocument(this.newHtmlDocument);

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

        // hack to block white space at bottom of page from being visible
        this.addScrollListener()
    }

    /**
     * Adds scroll listener to prevent over-scrolling.
     */
    addScrollListener() {

        // last element of the page
        const $footer = document.querySelector('footer');
        if (!$footer) {
            console.error('Could not find footer to add scroll listener to');
            return;
        }

        // how far down to scroll, automatically updated when the
        // window's dimensions or body's content changes
        let maxScroll = new TimedMemoizer(() => {
            const windowHeight = window.innerHeight;
            const bodyHeight = $footer.offsetTop + $footer.offsetHeight
            return bodyHeight - windowHeight;
        }, 100);

        // scrolling event handler
        window.addEventListener('scroll', function() {

            // prevent over-scrolling by scrolling back to the max allowed value
            if (window.scrollY > maxScroll.get()) {
                window.scrollTo({
                    top: maxScroll.get(),
                    behavior: 'instant'
                });
            }
        });
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
