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
import {SunsetSettings} from "./SunsetSettings.js";
import {Global} from "./util/Global.js";

import {LoginStatusParser,LoginStatus} from "./parsers/LoginStatusParser.js";

import {LinkHandler} from "./util/LinkHandler.js";
import {ProgressBar} from "./util/ProgressBar.js";
import {SiteSearch} from "./util/SiteSearch.js";
import {UrlHelper} from "./UrlHelper.js";

import {CategoryController} from "./controllers/CategoryContoller.js";
import {CartController} from "./controllers/CartController.js";
import {LoginController} from "./controllers/LoginController.js";
import {WishListController} from "./controllers/WishListController.js";
import {MenuController} from "./controllers/MenuController.js";
import {SkinToggleController} from "./controllers/SkinToggleController";

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
     * The controller class used to build this page.
     * @type {BaseControllers|null}
     */
    controller = null;

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
        //this.fileType = FileDetector.getPageType();
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

            // TODO: test that this is working.  it's called by the back/forward buttons

            // NOTE: this may be calling navigateTo() before calling loadNewSkinPage()
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

        this.usingDynamicLoading = false;
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

        // determine file type of new page
        this.fileType = FileDetector.getPageType(newUrl);

        // determine settings by file type
        let fileTypeSettings = SunsetSettings.getByFileType(this.fileType);
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
        if (!fileTypeSettings.newSkinUrl) {
            console.error('No url to load new skin from');
            return;
        }

        this.html = this.html || new SunsetSkinHtml()
        await this.html.load(fileTypeSettings.newSkinUrl);
        SunsetPreload.getInstance().transfer(this.html.newHtmlBody);

        // remove any loading messages from old webpage
        this.removePreloader();

        // show toggle so we can switch back and forth between
        // the new skin and the old skin
        new SkinToggleController(this).build();


        // insert new menu data into menu html
        if (fileTypeSettings.hasMenu) {
            new MenuController(this).build();
        }

        // setup common page controls
        SiteSearch.setupSearchControls();
        new WishListController(this).build();
        this.updateLoginStatus();
        this.setupLinkHandler();

        // run custom html generators for filetype via controller classes
        if (fileTypeSettings.controller) {
            console.log('Running controller: ' + fileTypeSettings.controller);
            this.controller = Global.createInstanceByName(fileTypeSettings.controller, this);
            this.controller.build();
        }
        else {
            console.error('No controller for filetype: ' + this.fileType);
        }
    }

    /**
     * Sets up controls that need the login status.
     */
    updateLoginStatus() {
        // TODO: this may require re-loading pages.
        new LoginStatusParser(this.html.oldHtmlBody)
            .readLoginStatus(status => {
                this.loginStatus = status;


                new CartController(this).buildCartDropdown();

                // TODO: need ot deal with this being a separate function
                // of a page controller
                new LoginController(this).buildStatusInfo();
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
     * Shows the loading message.
     */
    showLoading() {

        // don't show load screen if we've already finished
        if (this.finishedLoading) return;

        // show the preloader's loading screen
        SunsetPreload.getInstance().preload(); // TODO: probably not needed, as constructor calls this
    }
}
