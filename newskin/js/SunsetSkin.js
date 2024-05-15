/**
 * Project: Sunset Wholesale West Website
 * File:    SunsetSkin.js
 * Author:  Scott Mitting
 * Date:    2024-05-13
 * Abstract:
 *  Top level classes for parsing and rewriting the website.
 *
 */

import {SunsetPreload} from "./SunsetPreload.js";
import {FileDetector} from "./FileDetector.js";

import {FrontPageSpecialsParser} from "./parsers/FrontPageSpecialsParser.js";
import {SunsetMenuParser} from "./parsers/SunsetMenuParser.js";
import {FrontPageSpecialsBuilder} from "./builders/FrontPageSpecialsBuilder.js";
import {SunsetMenuBuilder} from "./builders/SunsetMenuBuilder.js";
import {ProductDetailParser} from "./parsers/ProductDetailParser.js";
import {ProductDetailBuilder} from "./builders/ProductDetailBuilder.js";

// launch preloader as soon as possible
let sunsetPreloader = new SunsetPreload();

/**
 * Stores the old and new HTML sections of the website.
 */
class SunsetSkinHtml {

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
     * Constructor saves copy of current webpage.
     */
    constructor() {
        this.oldHtmlBody = document.createElement('div');
        this.oldHtmlHead = document.createElement('div');
        this.oldHtmlBody.innerHTML = document.body.innerHTML;
        this.oldHtmlHead.innerHTML = document.head.innerHTML;
    }

    /**
     * Toggles between the old and new HTML.
     * @param set {string} either 'new' or 'old'
     */
    toggle(set) {
        if (set === 'new') {
            document.head.innerHTML = this.newHtmlHead.innerHTML;
            document.body.innerHTML = this.newHtmlBody.innerHTML;
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

/**
 * Analyzes the original HTML to figure out the contents of the menu
 * and to build a new website over top of it with a modern look-and-
 * feel.
 */
export class SunsetSkin {

    /**
     * The file type of the current page.
     * @type {string}
     */
    fileType = '';

    /**
     * The HTML sections of the website.
     * @type {SunsetSkinHtml|null}
     */
    html = null;

    /**
     * Constructor
     */
    constructor() {
        this.fileType = FileDetector.getPageType();
    }

    /**
     * Starts monitoring the page for its data and launches the
     * process to build the new webpage as soon as the data is
     * available.
     */
    apply() {
        console.log('apply()');

        // trigger event when document.body is available
        let bodyCallback = this.onDocumentBodyReady.bind(this);
        let initInterval = setInterval(function() {
            if (document.body) {
                clearInterval(initInterval);
                bodyCallback();
            }
        }, 1);

        // trigger document.ready event
        document.addEventListener("DOMContentLoaded", this.onWebPageLoaded.bind(this));
    }

    /**
     * Triggered once document.body is available
     */
    onDocumentBodyReady() {
        this.showLoading();
    }

    /**
     * Triggered once the webpage has finished loading
     */
    onWebPageLoaded() {
        this.loadNewSkinPage().then(_ => {
            console.log('load webpage completed');
            sunsetPreloader.ready();
        });
    }

    /**
     * Loads the webpage index.html and replaces the current
     * page's head and body with the loaded head and body, while
     * inserting data from the old page.
     *
     * @returns {Promise<void>}
     */
    async loadNewSkinPage() {

        // determine settings by file type
        let newSkinUrl = null;
        let hasMenu = false;
        if (this.fileType === 'FrontPage') {
            newSkinUrl = 'newskin/html/FrontPage.html';
            hasMenu = true;
        }
        else if (this.fileType === 'ItemDetail') {
            newSkinUrl = 'newskin/html/ItemDetails.html';
            hasMenu = true;
        }
        else {
            alert('unknown page type: ' + this.fileType);
            console.error('unknown page type: ' + this.fileType);
        }

        // load new page html from server if needed
        this.html = new SunsetSkinHtml()
        if (newSkinUrl) {
            const response = await fetch(newSkinUrl);
            const html = await response.text();

            let parser = new DOMParser();
            let doc = parser.parseFromString(html, 'text/html');

            // replace old document with new, keeping preloader active
            this.html.replaceDocument(doc);
            sunsetPreloader.transfer(this.html.newHtmlBody);

            // remove any loading messages from old webpage
            this.html.removeElementsFromOld('#divSunsetPreloader');
            this.html.removeElementsFromOld('.preloader');
            this.finishedLoaded = true;

            // show toggle so we can switch back and forth between
            // the new skin and the old skin
            this.setupNewSkinToggle();
        }

        // insert new menu data into menu html
        if (hasMenu) {
            this.buildMenuHtml();
        }

        // insert products into the html
        if (this.fileType === 'FrontPage') {
            this.buildProductsHtml();
        }
        else if (this.fileType === 'ItemDetail') {
            this.buildProductDetailsHtml();
        }
    }

    /**
     * Creates the events for the new skin toggle in the upper right.
     */
    setupNewSkinToggle() {

        // grab new skin toggle
        const $newSkinPanel = document.querySelector('.newskin-toggle');
        if (!$newSkinPanel) {
            console.error('.newskin-toggle not found');
            return;
        }
        const $newSkinIcon = $newSkinPanel.querySelector('i');
        const $newSkinLabel = $newSkinPanel.querySelector('b');

        // toggle new skin
        let newSkinEnabled = true;
        $newSkinPanel.addEventListener('click', () => {
            if (newSkinEnabled) {
                newSkinEnabled = false;
                $newSkinIcon.classList.remove('fa-toggle-on');
                $newSkinIcon.classList.add('fa-toggle-off');
                $newSkinLabel.innerText = 'Classic Look';

                this.html.toggle('old');
            }
            else {
                newSkinEnabled = true;
                $newSkinIcon.classList.remove('fa-toggle-off');
                $newSkinIcon.classList.add('fa-toggle-on');
                $newSkinLabel.innerText = 'New Skin Enabled';

                this.html.toggle('new');
            }
        });
    }

    /**
     * Shows the loading message.
     */
    showLoading() {

        // don't show load screen if we've already finished
        if (this.finishedLoaded) return;

        // show the preloader's loading screen
        if (sunsetPreloader) {
            sunsetPreloader.preload();
        }
    }

    /**
     * Builds the HTML menu from the menu data loaded from the old
     * webpage html.
     *
     * @returns {void}
     */
    buildMenuHtml() {
        console.log('buildMenuHtml()');

        // find insertion point
        let $megaMenu = document.querySelector('.mega-category-menu');
        if (!$megaMenu) {
            console.error('Could not load .mega-category-menu to fill menu data');
            return;
        }

        // parse the menu from the old website
        let parser = new SunsetMenuParser(this.html.oldHtmlBody);
        parser.readMenu();

        // build the menu into the new website
        let builder = new SunsetMenuBuilder();
        let $html = builder.buildMenuNode(parser.menu, 0);
        $megaMenu.append($html);
    }

    /**
     * Builds the HTML for the special offers on the front page using
     * the section data loaded from the old page.
     */
    buildProductsHtml() {
        console.log('buildProductsHtml()');

        // find the table containing product data
        let $table = this.html.oldHtmlBody.querySelector('.ItemSpecials');
        if (!$table) {
            console.error('Could not find table with class "ItemSpecials"');
            return;
        }

        // find where we're going to insert the sections
        let $insertionPoint = document.querySelector('.insert-products');
        if (!$insertionPoint) {
            console.error('Could not find insertion point!');
            return;
        }

        // parse from the old to build the new specials
        let parser = new FrontPageSpecialsParser();
        let specials = parser.readNodesFromTable($table);
        console.log({specials:specials});

        let builder = new FrontPageSpecialsBuilder();
        builder.buildFrontPageProducts(specials, $insertionPoint);
    }

    /**
     *  Builds the HTML for the product details on the front page using
     *  the product data loaded from the old page.
     */
    buildProductDetailsHtml() {
        console.log('buildProductDetailsHtml()');

        // find where we're going to insert the product details
        let $insertionPoint = document.querySelector('.insert-product-details');
        if (!$insertionPoint) {
            console.error('Could not find insertion point!');
            return;
        }

        // parse from the old to build the new specials
        let parser = new ProductDetailParser(this.html.oldHtmlBody);
        let productItem = parser.readProductDetail();
        console.log({productItem:productItem});

        let builder = new ProductDetailBuilder();
        builder.buildProductDetailItem(productItem, $insertionPoint);
    }
}
