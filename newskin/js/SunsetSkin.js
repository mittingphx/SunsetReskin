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
import {SlideshowParser} from "./parsers/SlideshowParser.js";
import {SlideshowBuilder} from "./builders/SlideshowBuilder.js";
import {ShoppingCart, ViewCartParser} from "./parsers/ViewCartParser.js";
import {ViewCartBuilder} from "./builders/ViewCartBuilder.js";
import {ProductCategoryBreadcrumb} from "./parsers/CommonParser.js";
import {SiteSearch} from "./util/SiteSearch.js";
import {WishListBuilder} from "./builders/WishListBuilder.js";
import {LoginStatusParser,LoginStatus} from "./parsers/LoginStatusParser.js";

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
        else if (this.fileType === 'Cart') {
            newSkinUrl = 'newskin/html/Cart.html';
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
            this.buildFrontPageHtml();
        }
        else if (this.fileType === 'ItemDetail') {
            this.buildProductDetailsHtml();
        }
        else if (this.fileType === 'Category') {
            this.buildCategoryHtml();
        }
        else if (this.fileType === 'Cart') {
            this.buildCartHtml();
        }

        // setup common page controls
        SiteSearch.setupSearchControls();
        this.buildWishListDropdown();

        // setup common controls that require use login information
        let loginParser = new LoginStatusParser(this.html.oldHtmlBody);
        loginParser.readLoginStatus(status => {
            this.loginStatus = status;
            this.buildCartDropdown();
            this.buildLoginInfo();
        })
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
            console.log('buildCartDropdown() got cort', cart);

            let builder = new ViewCartBuilder();
            let $dropdown = builder.buildCartDropdown(cart, this.loginStatus);
            if (!$insertionPoint) {
                console.error('Could not find insertion point! (.ddl-cart)');
                return;
            }
            $insertionPoint.replaceWith($dropdown);
        })
    }

    /**
     * Renders the wish list dropdown on every page.
     */
    buildWishListDropdown() {
        let builder = new WishListBuilder();
        let $dropdown = builder.build();
        let $insertionPoint = document.querySelector('.ddl-wishlist');
        if (!$insertionPoint) {
            console.error('Could not find insertion point! (.ddl-wishlist)');
            return;
        }
        $insertionPoint.replaceWith($dropdown);
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
        console.log('buildFrontPageHtml()');

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

        // set up the slide show using slides from the old page
        let slideshowParser = new SlideshowParser();
        let slideshow = slideshowParser.readSlidesFromDocument(this.html.oldHtmlBody);
        let $slideshowInsertion = document.querySelector('.slider-head');
        if (!$slideshowInsertion) {
            console.error('Could not find slideshow insertion point');
            return;
        }

        console.log({slideshow:slideshow});
        let slideshowBuilder = new SlideshowBuilder(slideshow);
        if (slideshow.length === 0) {
            let $missingSlideshow = document.createElement('div');
            $missingSlideshow.classList.add('slider-head');
            $missingSlideshow.innerHTML = '<div class="hero-slider">ERROR: Slideshow contains no slides.</div>';
            $slideshowInsertion.replaceWith($missingSlideshow);
        }
        else {
            $slideshowInsertion.replaceWith(slideshowBuilder.build());
            slideshowBuilder.setupSlideshow();

            // wait until page has settled down to process custom content
            setTimeout(() => {
                slideshowBuilder.addSlideshowChooseProductHandler()
            }, 100);
        }


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
        let $breadcrumbs = breadcrumbBuilder.build(productItem.text, productItem.category);
        document.querySelector('.breadcrumbs').replaceWith($breadcrumbs);

        // set the window title
        document.title = `${productItem.text} - Sunset Wholesale West`;
    }

    buildCartHtml() {

        console.log('buildCartHtml()');

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
        $insertionPoint.replaceWith(builder.buildCartView(cart));

        // build the breadcrumbs in the header
        let breadcrumbBuilder = new ProductBreadcrumbBuilder();
        let $breadcrumbs = breadcrumbBuilder.build('Shopping Cart', builder.buildBreadCrumbs());
        document.querySelector('.breadcrumbs').replaceWith($breadcrumbs);

        // set the window title
        document.title = `Checkout - Sunset Wholesale West`;
    }

    /**
     * Inserts current information about the logged in user into the
     * header.
     */
    buildLoginInfo() {

        // TODO: move to LoginStatusBuilder class?

        let $topEnd = document.querySelector('.top-end');
        if (!$topEnd) {
            console.error('Could not find .top-end');
            return;
        }
        $topEnd.innerHTML = '';

        // username display
        let $user = document.createElement('div');
        {
            $user.classList.add('user');
            $topEnd.appendChild($user);

            $user.innerHTML = '<i class="lni lni-user"></i>';

            if (this.loginStatus.loggedIn) {
                $user.innerHTML += ` ${this.loginStatus.email}`;
            }
            else {
                $user.innerHTML += ' Not Logged In';
            }
        }

        // user buttons
        let $userLogin = document.createElement('ul');
        {
            $userLogin.classList.add('user-login');
            $topEnd.appendChild($userLogin);

            if (this.loginStatus.loggedIn) {

                let $btnSignOut = this.html.oldHtmlBody.querySelector('#LBtnLogOut');
                if (!$btnSignOut) {
                    console.error('Could not find #LBtnLogOut');
                }

                // sign out button
                let $login = document.createElement('li');
                {
                    let $aSignOut = $login.querySelector('a');
                    {
                        $aSignOut.title = 'Sign Out';
                        $aSignOut.href = 'javascript:void(0)';
                        $login.appendChild($aSignOut);
                        $aSignOut.addEventListener('click', function() {
                            $btnSignOut.click();
                        });
                    }
                    $userLogin.appendChild($login);
                }

                // my account button
                let $register = document.createElement('li');
                {
                    $register.innerHTML = '<a href="MyAccount.aspx">My Account</a>';
                    $userLogin.appendChild($register);
                }

                // admin button
                if (this.loginStatus.isAdmin) {
                    let $admin = document.createElement('li');
                    {
                        $admin.innerHTML = '<a href="Admin/Dashboard.aspx">Admin</a>';
                        $userLogin.appendChild($admin);
                    }
                }
            }
            else {
                // sign in button
                let $login = document.createElement('li');
                {
                    $login.innerHTML = '<a href="Login/Login.aspx">Sign In</a>';
                    $userLogin.appendChild($login);
                }

                // register button
                let $register = document.createElement('li');
                {
                    $register.innerHTML = '<a href="MyAccount.aspx">Register</a>';
                    $userLogin.appendChild($register);
                }
            }
        }

    }
}
