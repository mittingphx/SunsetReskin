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
import {SunsetSkinHtml} from "./SunsetSkinHtml.js";
import {FileDetector} from "./FileDetector.js";

import {FrontPageSpecialsParser} from "./parsers/FrontPageSpecialsParser.js";
import {SunsetMenuParser} from "./parsers/SunsetMenuParser.js";
import {ProductDetailParser} from "./parsers/ProductDetailParser.js";
import {CategoryParser} from "./parsers/CategoryParser.js";

import {FrontPageSpecialsBuilder} from "./builders/FrontPageSpecialsBuilder.js";
import {SunsetMenuBuilder} from "./builders/SunsetMenuBuilder.js";
import {ProductBreadcrumbBuilder, ProductDetailBuilder} from "./builders/ProductDetailBuilder.js";
import {CategoryBuilder} from "./builders/CategoryBuilder.js";

// launch preloader as soon as possible
let sunsetPreloader = new SunsetPreload();

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

        console.log('loadNewSkinPage()');

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
        else if (this.fileType === 'Category') {
            newSkinUrl = 'newskin/html/Category.html';
            hasMenu = true;
        }
        else {
            alert('unknown page type: ' + this.fileType);
            console.error('unknown page type: ' + this.fileType);
        }

        // load new page html from server if needed
        this.html = new SunsetSkinHtml()

        if (newSkinUrl) {
            await this.html.load(newSkinUrl);
            sunsetPreloader.transfer(this.html.newHtmlBody);

            // remove any loading messages from old webpage
            this.html.removeElementsFromOld('#divSunsetPreloader');
            this.html.removeElementsFromOld('.preloader');
            this.finishedLoaded = true;

            // show toggle so we can switch back and forth between
            // the new skin and the old skin
            this.setupNewSkinToggle();
        }
        else {
            console.error('No url to load new skin from');
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
        else if (this.fileType === 'Category') {
            this.buildCategoryHtml();
        }

        // resize window so there isn't a bunch of white space at the bottom

        // TODO: fix this
        // I was getting weird height calculations for hte page like 15403 etc
        /*
        let $footer = document.querySelector('.page-bottom');
        if ($footer) {


            let rect = $footer.getBoundingClientRect();
            console.log({pageBottom:rect});

            let newHeight = 2570;// rect.bottom;

            let timeoutHandle = 0;
            let lastSetTime = 0;
            window.addEventListener('scroll', (e) => {
                if (window.scrollY + window.outerHeight >= newHeight) {
                    window.scrollY = newHeight - window.outerHeight;
                    console.log('limiting scroll to ' + window.scrollY);

                    let now = new Date().getTime();
                    if (now - lastSetTime > 300) {
                        lastSetTime = now;
                        window.scrollTo({
                            top: window.scrollY,
                            left: 0,
                            behavior: 'smooth'
                        });
                    }
                    else {
                        // call scrollTo again in 300ms
                        if (timeoutHandle === 0) {
                            timeoutHandle = setTimeout(() => {
                                window.scrollTo({
                                    top: window.scrollY,
                                    left: 0,
                                    behavior: 'smooth'
                                });
                                clearTimeout(timeoutHandle);
                                timeoutHandle = 0;
                            }, 300);
                        }
                    }
                }
                else {
                    console.log('scroll is okay: ' + window.scrollY)
                }
            });

        }*/
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

        // set the window title
        document.title = `Sunset Wholesale West`;
    }

    /**
     * Builds the category and search pages.
     */
    buildCategoryHtml() {
        console.log('buildCategoryHtml()');

        // find the table containing product data
        let $table = this.html.oldHtmlBody.querySelector('.Items');
        if (!$table) {
            console.error('Could not find table with class "Items"');
            return;
        }

        // find where we're going to insert the category
        let $insertionPoint = document.querySelector('.insert-category');

        if (!$insertionPoint) {
            console.error('Could not find insertion point!');
            return;
        }

        // parse from the old to build the category grid
        let parser = new CategoryParser(this.html.oldHtmlBody);
        let category = parser.readNodesFromTable($table);
        console.log({category:category});

        let builder = new CategoryBuilder();
        builder.buildCategoryProducts(category, $insertionPoint);

        // build the breadcrumbs in the header
        let breadcrumbBuilder = new ProductBreadcrumbBuilder();
        let $breadcrumbs = breadcrumbBuilder.build(category.name, category.breadcrumbs);
        document.querySelector('.breadcrumbs').replaceWith($breadcrumbs);

        // set the window title
        document.title = `${category.name} - Sunset Wholesale West`;

        // show item count
        document.querySelector('.total-show-product span').innerText
            = '1 - ' + category.items.length + ' items';

        // implement sorting dropdown
        let $ddlSort = document.querySelector('#sorting');
        $ddlSort.addEventListener('change', function() {
            let sortOrder = $ddlSort.value;
            if (sortOrder === 'name-asc') {
                category.items.sort(function(a, b) { return a.text.localeCompare(b.text); });
            }
            else if (sortOrder === 'name-desc') {
                category.items.sort(function(a, b) { return b.text.localeCompare(a.text); });
            }
            else if (sortOrder === 'price-asc') {
                category.items.sort(function(a, b) { return a.casePrice.localeCompare(b.casePrice); });
            }
            else if (sortOrder === 'price-desc') {
                category.items.sort(function(a, b) { return b.casePrice.localeCompare(a.casePrice); });
            }
            else if (sortOrder === 'item-no') {
                category.items.sort(function(a, b) { return a.itemNo.localeCompare(b.itemNo); });
            }
            builder.buildCategoryProducts(category, $insertionPoint);
        });

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

        // parse product details from the old webpage
        let parser = new ProductDetailParser(this.html.oldHtmlBody);
        let productItem = parser.readProductDetail();
        console.log({productItem:productItem});

        // build the main product details area
        let builder = new ProductDetailBuilder();
        $insertionPoint.after(builder.build(productItem));

        // build the breadcrumbs in the header
        let breadcrumbBuilder = new ProductBreadcrumbBuilder();
        let $breadcrumbs = breadcrumbBuilder.build(productItem);
        document.querySelector('.breadcrumbs').replaceWith($breadcrumbs);

        // set the window title
        document.title = `${productItem.text} - Sunset Wholesale West`;
    }
}
