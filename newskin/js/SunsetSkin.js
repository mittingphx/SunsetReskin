// noinspection JSUnusedGlobalSymbols

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
import {SunsetPreload, TimeSpan} from "./SunsetPreload.js";
import {SunsetSkinHtml} from "./SunsetSkinHtml.js";
import {SunsetSettings} from "./SunsetSettings.js";

import {ProgressBar} from "./util/ProgressBar.js";

import {CartController} from "./controllers/CartController.js";
import {LinkController} from "./controllers/LinkController.js";
import {MenuController} from "./controllers/MenuController.js";
import {LoginController} from "./controllers/LoginController.js";
import {WishListController} from "./controllers/WishListController.js";
import {SkinToggleController} from "./controllers/SkinToggleController.js";
import {SiteSearchController} from "./controllers/SiteSearchController.js";
import {LoginStatus} from "./models/LoginStatus.js";
import {AspNetIntercept} from "./util/AspNetIntercept.js";

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
     * Drapes that hide the website while it is loaded.
     * @type {SunsetPreload|null}
     */
    preloader = null;

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
     * True once the loading has completed
     * @type {boolean}
     */
    finishedLoading = false;

    /**
     * The controller class used to build this page.
     * @type {BaseController|null}
     */
    controller = null;

    /**
     * Controller for login status information.
     * @type {LoginController|null}
     */
    loginController = null;

    /**
     * Controller for the shopping cart
     * @type {CartController|null}
     */
    cartController = null;

    /**
     * Controller for the product menu.
     * @type {MenuController|null}
     */
    menuController = null;

    /**
     * Controller for the skin toggle button.
     * @type {SkinToggleController|null}
     */
    skinToggleController = null;

    /**
     * Controller for the wish list dropdown
     * @type {WishListController|null}
     */
    wishListController = null;

    /**
     * Controller for the link routing
     * @type {LinkController|null}
     */
    linkController = null;

    /**
     * Controller for the site search bar.
     * @type {SiteSearchController|null}
     */
    searchController = null;

    /**
     * Provides interaction with server-side components of the old
     * website from javascript classes on the new website.
     * @type {AspNetIntercept|null}
     */
    aspNet = null;

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

        // create preloader
        this.preloader = new SunsetPreload();

        // create component controllers
        this.loginController = new LoginController(this);
        this.cartController = new CartController(this);
        this.menuController = new MenuController(this);
        this.wishListController = new WishListController(this);
        this.skinToggleController = new SkinToggleController(this);
        this.linkController = new LinkController(this);
        this.searchController = new SiteSearchController(this)

        // asp.net server-side postback handlers
        this.aspNet = new AspNetIntercept();

        // handle changes in login status
        this.loginController.statusUpdatedEvent.addListener(loginStatus => {
            if (loginStatus instanceof LoginStatus) {
                this.cartController.buildCartDropdown(loginStatus);
                this.loginController.buildStatusInfo();
            }
        })
    }


    /**
     * Gets the most recent instance of this object.
     * @returns {SunsetSkin}
     */
    static getInstance() {
        return this.#instance;
    }


    /**
     * Starts monitoring the page for its data and launches the
     * process to build the new webpage as soon as the data is
     * available.
     */
    apply() {
        console.log('Sunset Warehouse West Website version 2.0 is running...');

        // trigger event when document.body is available
        let initInterval = setInterval(() => {
           if (document.body) {
               clearInterval(initInterval);

               // don't show load screen if we've already finished
               if (this.finishedLoading) return;

               // show the preloader's loading screen
               this.preloader.preload();
           }
        });

        // trigger document.ready event
        document.addEventListener("DOMContentLoaded", () => {
            this.loadNewSkinPage().then(_ => {
                //console.log('load webpage completed');
                this.preloader.ready();
            });
        });

        // monitor history
        window.addEventListener('popstate', (event) => {

            // TODO: test that this is working.  it's called by the back/forward buttons

            // NOTE: this may be calling navigateTo() before calling loadNewSkinPage()
            this.navigateTo(event.state.url).then(_ => {
                //console.log('navigate finished: ' + event.state.url);
                this.preloader.ready();
            });
        });
    }

    /**
     * Completely eliminates all trace of the preloader from the page.
     */
    removePreloader() {
        this.preloader.fadeOutPreloader(TimeSpan.IMMEDIATE);

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
     * Static async version of navigateTo() call.
     * @param url {string}
     */
    static async navigateToAsync(url) {
        await SunsetSkin.#instance.navigateTo(url);
    }

    /**
     * Static synchronous version of navigateTo() call.
     * @param url {string} webpage to go to
     * @param callback {function} callback called after the page is loaded
     */
    static navigateToUrl(url, callback) {
        SunsetSkin.#instance.navigateTo(url).then(callback);
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
            //alert('unknown page type: ' + this.fileType);
            console.error('unknown page type: ' + this.fileType + ' newUrl=' + newUrl);

            // hide the loading screen for unknown file types
            this.removePreloader();

            // just redirect when using dynamic js loading.
            //if (this.usingDynamicLoading) {
                 if (newUrl) {
                    document.location = newUrl;
                }
            //}
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
        this.preloader.transfer(this.html.newHtmlBody);

        // remove any loading messages from old webpage
        this.removePreloader();

        // insert new menu data into menu html
        if (fileTypeSettings.hasMenu) {
            this.menuController.build();
        }

        // build the mobile menu
        if (fileTypeSettings.hasMenu) {
            this.menuController.buildMobileMenu();
        }

        // setup common page controls
        this.searchController.build();
        this.linkController.build();
        this.wishListController.build();
        this.loginController.updateLoginStatus();
        this.skinToggleController.build();

        // run custom html generators for filetype via controller classes
        if (fileTypeSettings.controller) {
            console.log('Running controller: ' + fileTypeSettings.controller);
            this.controller = SunsetSettings.getControllerInstanceByName(fileTypeSettings.controller, this);
            this.controller.build();
        }
        else {
            console.error('No controller for filetype: ' + this.fileType);
        }
    }

    /**
     * Gets the login status using a callback.
     * @param fnCallback {function(LoginStatus)}
     */
    getLoginStatus(fnCallback) {
        this.loginController.getStatus(loginStatus => {
            fnCallback(loginStatus);
        });
    }

    /**
     * Gets the login status using an async promise.
     * @returns {LoginStatus}
     */
    async getLoginStatusAsync() {
        const promise = new Promise((resolve, _) => {
            this.getLoginStatus(resolve);
        });
        return await promise;
    }

    /**
     * Signs out the user from the site.
     */
    signOut() {
        this.getLoginStatus(loginStatus => {
            loginStatus.$btnSignOut.click()
        });
    }

}
