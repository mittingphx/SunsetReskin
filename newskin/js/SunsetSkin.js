/**
 * Project: Sunset Wholesale West Website
 * File:    SunsetSkin.js
 * Author:  Scott Mitting
 * Date:    2024-05-13
 * Abstract:
 *  Top level classes for parsing and rewriting the website.
 *
 */

import {FileDetector} from "./FileDetector.js";
import {SunsetPreload} from "./SunsetPreload.js";
import {SunsetSkinHtml} from "./SunsetSkinHtml.js";

import {CategoryParser} from "./parsers/CategoryParser.js";
import {ProductCategoryBreadcrumb} from "./parsers/CommonParser.js";
import {FrontPageSpecialsParser} from "./parsers/FrontPageSpecialsParser.js";
import {LoginPageParser} from "./parsers/LoginPageParser.js";
import {LoginStatusParser,LoginStatus} from "./parsers/LoginStatusParser.js";
import {ProductDetailParser} from "./parsers/ProductDetailParser.js";
import {SlideshowParser} from "./parsers/SlideshowParser.js";
import {SunsetMenuParser} from "./parsers/SunsetMenuParser.js";
import {ShoppingCart, ViewCartParser} from "./parsers/ViewCartParser.js";

import {CategoryBuilder} from "./builders/CategoryBuilder.js";
import {FrontPageSpecialsBuilder} from "./builders/FrontPageSpecialsBuilder.js";
import {LoginPageBuilder} from "./builders/LoginPageBuilder.js";
import {ProductBreadcrumbBuilder, ProductDetailBuilder} from "./builders/ProductDetailBuilder.js";
import {SlideshowBuilder} from "./builders/SlideshowBuilder.js";
import {SunsetMenuBuilder} from "./builders/SunsetMenuBuilder.js";
import {ViewCartBuilder} from "./builders/ViewCartBuilder.js";
import {WishListBuilder} from "./builders/WishListBuilder.js";

import {DomHelper} from "./util/DomHelper.js";
import {LinkHandler} from "./util/LinkHandler.js";
import {ProgressBar} from "./util/ProgressBar.js";
import {SiteSearch} from "./util/SiteSearch.js";
import {UrlHelper} from "./UrlHelper.js";
import {LoginStatusBuilder} from "./builders/LoginStatusBuilder.js";
import {ContactPageBuilder} from "./builders/ContactPageBuilder.js";

/**
 * Settings constants for different aspects of the system.
 */
export class SunsetSettings {

    /**
     * Settings for each of the file types supported by this system.
     * @type {Object.<string,{newSkinUrl: string, hasMenu: boolean, fn: string}>}
     */
    static fileTypes = {
        'FrontPage': {
            newSkinUrl: 'newskin/html/FrontPage.html',
            hasMenu: true,
            fn: 'buildFrontPageHtml'
        },
        'ItemDetail': {
            newSkinUrl: 'newskin/html/ItemDetails.html',
            hasMenu: true,
            fn: 'buildProductDetailsHtml'
        },
        'Category': {
            newSkinUrl: 'newskin/html/Category.html',
            hasMenu: true,
            fn: 'buildCategoryHtml'
        },
        'Cart': {
            newSkinUrl: 'newskin/html/Cart.html',
            hasMenu: true,
            fn: 'buildCartHtml'
        },
        'Login': {
            newSkinUrl: 'newskin/html/Login.html',
            hasMenu: true,
            fn: 'buildLoginPageHtml'
        },
        'ContactUs': {
            newSkinUrl: 'newskin/html/Contact.html',
            hasMenu: true,
            fn: 'buildContactPageHtml'
        }
    };
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
     * Gets set to true when a page is being loaded using fetch() instead
     * of redirecting the browser to a page directly.
     * @type {boolean}
     */
    usingDynamicLoading = false;

    /**
     * The menu of product categories displayed as a mega menu.
     * @type {SunsetMenu}
     */
    menu = null;

    /**
     * Account details for the logged-in user.
     * @type {LoginStatus}
     */
    loginStatus = null;

    /**
     * Intercepts links to other pages.
     * @type {LinkHandler}
     */
    linkHandler = null;

    /**
     * True once the loading has completed
     * @type {boolean}
     */
    finishedLoading = false;

    /**
     * Most recent instance of this object.
     * @type {SunsetSkin}
     */
    static #instance = null;

    /**
     * Constructor
     */
    constructor() {
        SunsetSkin.#instance = this;
        this.fileType = FileDetector.getPageType();
    }

    /**
     * Gets the most recent instance of this object.
     * @returns {SunsetSkin}
     */
    static getInstance() {
        if (!SunsetSkin.#instance) {
            SunsetSkin.#instance = new SunsetSkin();
        }
        return this.#instance;
    }

    /**
     * Starts monitoring the page for its data and launches the
     * process to build the new webpage as soon as the data is
     * available.
     */
    apply() {
        console.log('apply()');

        // trigger event when document.body is available
        let initInterval = setInterval(() => {
           if (document.body) {
               clearInterval(initInterval);
               this.showLoading();
           }
        });

        // trigger document.ready event
        document.addEventListener("DOMContentLoaded", () => {
            this.loadNewSkinPage().then(_ => {
                console.log('load webpage completed');
                SunsetPreload.getInstance().ready();
            });
        });

        // monitor history
        window.addEventListener('popstate', (event) => {
            this.navigateTo(event.state.url).then(_ => {
                console.log('navigate finished: ' + event.state.url);

                // TODO: will need make sure any loading messages are removed
                // sunsetPreloader.ready();
            });
        });
    }

    /**
     * Completely eliminates all trace of the preloader from the page.
     */
    removePreloader() {
        SunsetPreload.hidePreloader();

        if (this.html) {
            this.html.removeElementsFromOld('#divSunsetPreloader');
            this.html.removeElementsFromOld('.preloader');
        }
        else {
            let list = document.querySelectorAll('#divSunsetPreloader');
            for (let i = 0; i < list.length; i++) {
                list[i].remove();
            }

            list = document.querySelectorAll('.preloader');
            for (let i = 0; i < list.length; i++) {
                list[i].remove();
            }
        }


        this.finishedLoading = true;
    }

    /**
     * Navigates to a relative link within the sunset site, showing
     * a loading message as needed while the page is loading.  The
     * browser's History API is used to navigate within the site.
     * @param url {string}
     */
    async navigateTo(url) {
     //   window.location.href = url;

        if (!this.html) {
            console.error('navigateTo() called before loadNewSkinPage()');
            alert('navigateTo() called before loadNewSkinPage()');
            return;
        }

        //alert('navigateTo: ' + url);
        this.usingDynamicLoading = true;

        let progress = new ProgressBar()
        progress.anim(70, 5);
        progress.setVisible(true);

        // load both old and new page
        let loaded = await this.html.loadOld(url)
        if (!loaded) {
            progress.setVisible(false);
            console.error('loading failed.  url=' + url);
            alert('load failed');
            return;
        }

        // determine file type of new page
        this.fileType = FileDetector.getPageType(url);

        // update history api
        history.pushState({ url: url }, '', url);

        // let progress bar finish and show new page
        const NEW_SKIN_DELAY = 100;
        progress.anim(100, 1);
        window.scrollTo(0, 0);
        setTimeout(async _ => await this.loadNewSkinPage(url), NEW_SKIN_DELAY);
    }

    /**
     * Loads the webpage index.html and replaces the current
     * page's head and body with the loaded head and body, while
     * inserting data from the old page.
     * @param newUrl {string|null} the optional url to load if we can't load by file type
     * @returns {Promise<void>}
     */
    async loadNewSkinPage(newUrl = null) {

        // determine settings by file type
        let fileTypeSettings = SunsetSettings.fileTypes[this.fileType];
        if (!fileTypeSettings) {
            alert('unknown page type: ' + this.fileType);
            console.error('unknown page type: ' + this.fileType);

            // hide the loading screen for unknown file types
            this.removePreloader();

            // just redirect when using dynamic js loading.
            if (this.usingDynamicLoading && newUrl) {
                document.location = newUrl;
            }
            return;
        }
        console.log('loadNewSkinPage()',{fileType:this.fileType, fileTypeSettings:fileTypeSettings});

        // load new page html from server if needed
        if (fileTypeSettings.newSkinUrl) {
            this.html = this.html || new SunsetSkinHtml()
            await this.html.load(fileTypeSettings.newSkinUrl);
            SunsetPreload.getInstance().transfer(this.html.newHtmlBody);

            // remove any loading messages from old webpage
            this.removePreloader();

            // show toggle so we can switch back and forth between
            // the new skin and the old skin
            this.setupNewSkinToggle();
        }
        else {
            console.error('No url to load new skin from');
            return;
        }

        // insert new menu data into menu html
        if (fileTypeSettings.hasMenu) {
            this.buildMenuHtml();
        }

        // setup common page controls
        SiteSearch.setupSearchControls();
        this.buildWishListDropdown();
        this.updateLoginStatus();
        this.setupLinkHandler();

        // run custom html generators for filetype
        if (fileTypeSettings.fn) {
            console.log('Running custom html generator: ' + fileTypeSettings.fn + '()');
            this[fileTypeSettings.fn]();
        }
    }

    /**
     * Renders the wish list dropdown on every page.
     */
    buildWishListDropdown() {
        document.querySelector('.ddl-wishlist')
            .replaceWith(new WishListBuilder().build());
    }

    /**
     * Sets up controls that need the login status.
     */
    updateLoginStatus() {
        // TODO: this may require re-loading pages.
        new LoginStatusParser(this.html.oldHtmlBody)
            .readLoginStatus(status => {
                this.loginStatus = status;
                this.buildCartDropdown();
                this.buildLoginInfo();
            });
    }

    /**
     * Intercept links so we can manually load new pages into the
     * skin, allowing us to show loading messages for pages that
     * take a while and to avoid seeing a flash of the old webpage
     */
    setupLinkHandler() {

        // remove old handler if needed
        if (this.linkHandler) {
            this.linkHandler.removeEventListener();
        }

        // how to handle links and which links to handle
        this.linkHandler = new LinkHandler(
            async $a => { await this.navigateTo($a.href);},
                     $a => { return UrlHelper.urlIsOnSameDomain($a);});
        this.linkHandler.addEventListener();
    }

    /**
     * Builds the dropdown preview of the cart available on every page.
     */
    buildCartDropdown() {

        console.log('buildCartDropdown()');

        // show a spinner while the cart is being loaded
        let $insertionPoint = document.querySelector('.ddl-cart');
        if (!$insertionPoint) {
            console.error('Could not find insertion point! (.ddl-cart)');
            return;
        }
        $insertionPoint.innerHTML = '<i class="fa fa-spinner fa-spin fa-2x"></i>';

        // load cart in the background
        ShoppingCart.getInstanceAsync(cart => {
            $insertionPoint.replaceWith(
                new ViewCartBuilder()
                    .buildCartDropdown(cart, this.loginStatus)
            );
        })
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
        if (this.finishedLoading) return;

        // show the preloader's loading screen
        SunsetPreload.getInstance().preload(); // TODO: probably not needed, as constructor calls this
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
        this.menu = parser.menu;

        // build the menu into the new website
        let builder = new SunsetMenuBuilder(this.menu);
        $megaMenu.append(builder.build());
    }

    /**
     * Builds the HTML for the special offers on the front page using
     * the section data loaded from the old page.
     */
    buildFrontPageHtml() {

        // grab DOM references
        let dom = {};
        DomHelper.addElementsByQuery(dom, this.html.oldHtmlBody, {
            $table: '.ItemSpecials'
        });
        DomHelper.addElementsByQuery(dom, document, {
            $insertionPoint: '.insert-products',
            $slideshowInsertion: '.slider-head'
        });

        // parse from the old to build the new specials
        if (dom.$table) {
            let parser = new FrontPageSpecialsParser();
            let specials = parser.readNodesFromTable(dom.$table);
            console.log({specials: specials});

            if (dom.$insertionPoint) {
                let builder = new FrontPageSpecialsBuilder();
                builder.buildFrontPageProducts(specials, dom.$insertionPoint);
            }
        }

        // set up the slide show using slides from the old page
        let slideshowParser = new SlideshowParser();
        let slideshow = slideshowParser.readSlidesFromDocument(this.html.oldHtmlBody);
        console.log({slideshow:slideshow});

        if (dom.$slideshowInsertion) {
            let slideshowBuilder = new SlideshowBuilder(slideshow);
            if (slideshow.length === 0) {
                let $missingSlideshow = document.createElement('div');
                $missingSlideshow.classList.add('slider-head');
                $missingSlideshow.innerHTML = '<div class="hero-slider">ERROR: Slideshow contains no slides.</div>';
                dom.$slideshowInsertion.replaceWith($missingSlideshow);
            } else {
                dom.$slideshowInsertion.replaceWith(slideshowBuilder.build());
                slideshowBuilder.setupSlideshow();

                // wait until page has settled down to process custom content
                setTimeout(() => {
                    slideshowBuilder.addSlideshowChooseProductHandler()
                }, 100);
            }
        }

        // set the window title
        document.title = `Sunset Wholesale West`;
    }


    /**
     * Builds the category and search pages.
     */
    buildCategoryHtml() {

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

        // build the subcategory list on the left, or show search terms when searching
        let $subcategoryMenu;
        if (SiteSearch.isSearchResult()) {
            // custom left pane
            let search = SiteSearch.getSearchTerm();
            $subcategoryMenu = builder.buildMessageAsList(
                'Search Results',
                'The results for your search <b>' + search + '</b> are now being displayed'
            );

            // custom breadcrumb
            category.name = 'Search Results';
            category.breadcrumbs = new ProductCategoryBreadcrumb();
            category.breadcrumbs.name = 'Search Results for "' + SiteSearch.getSearchTerm() + '"';
            category.breadcrumbs.parent = new ProductCategoryBreadcrumb();
            category.breadcrumbs.parent.name = 'Home';
            category.breadcrumbs.parent.link = 'Default.aspx';
        }
        else {
            $subcategoryMenu = builder.buildSubcategoryList(category, this.menu);
        }

        // insert the subcategory list in the left panel
        if ($subcategoryMenu) {
            console.log('inserting subcategory list at .sub-category-list', {$subcategoryMenu:$subcategoryMenu});
            document.querySelector('.sub-category-list').replaceWith($subcategoryMenu);
        }
        else {
            // no subcategory list so remove the left panel completely
            console.error('Could not build $subcategoryMenu');
            document.querySelector('.sub-category-list').remove();
        }

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
        let $breadcrumbs = breadcrumbBuilder.build(productItem.text, productItem.category);
        document.querySelector('.breadcrumbs').replaceWith($breadcrumbs);

        // set the window title
        document.title = `${productItem.text} - Sunset Wholesale West`;
    }

    /**
     * Builds the shopping cart view on the cart page.
     */
    buildCartHtml() {

        // find where we're going to insert the product details
        let $insertionPoint = document.querySelector('.shopping-cart');
        if (!$insertionPoint) {
            console.error('Could not find insertion point! (.shopping-cart)');
            return;
        }

        // parse product details from the old webpage
        let parser = new ViewCartParser(this.html.oldHtmlBody, null);
        let cart = parser.readCart();
        console.log({cart:cart});

        // build the main product details area
        let builder = new ViewCartBuilder();
        $insertionPoint.replaceWith(builder.buildCartView(cart, this.loginStatus));

        // build the breadcrumbs in the header
        let breadcrumbBuilder = new ProductBreadcrumbBuilder();
        let $breadcrumbs = breadcrumbBuilder.build('Shopping Cart', builder.buildBreadCrumbs());
        document.querySelector('.breadcrumbs').replaceWith($breadcrumbs);

        // set the window title
        document.title = `Checkout - Sunset Wholesale West`;
    }

    /**
     * Builds the login form.
     */
    buildLoginPageHtml() {

        let parser = new LoginPageParser(this.html.oldHtmlBody);
        let loginForm = parser.getLoginForm();

        let dom = {};
        if (!DomHelper.addElementsByQuery(dom, {
            $loginForm: 'form.login-form',
            $registerForm: 'form.account-register-form'
        })) return;

        // build the form
        let builder = new LoginPageBuilder()
        builder.build(loginForm, dom.$loginForm, dom.$registerForm);

        // set the window title
        document.title = `Login - Sunset Wholesale West`;
    }

    /**
     * Inserts current information about the logged-in user into the
     * header.
     */
    buildLoginInfo() {

        // grab insertion point
        let $topEnd = document.querySelector('.top-end');
        if (!$topEnd) {
            console.error('Could not find .top-end');
            return;
        }

        // create status info
        let builder = new LoginStatusBuilder();
        let $loginStatus = builder.build(this.loginStatus);
        $topEnd.replaceWith($loginStatus);

    }


    /**
     * Builds the contact us page.
     */
    buildContactPageHtml() {


        let dom = {};
        if (!DomHelper.addElementsByQuery(dom, {
            $contactForm: 'form#Form1'
        })) return;

        // build the contact page
        let builder = new ContactPageBuilder()
        builder.build(this.loginStatus, dom.$contactForm);

        // set the window title
        //document.title = `Sunset Wholesale West`;
    }

}
