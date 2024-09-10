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
import {SunsetSkinHtml} from "./SunsetSkinHtml.js";
import {SunsetSettings} from "./SunsetSettings.js";
import {SunsetPreload, TimeSpan} from "./SunsetPreload.js";
import {LoginStatus} from "./models/LoginStatus.js";
import {ProgressBar} from "./util/ProgressBar.js";
import {AspNetIntercept} from "./util/AspNetIntercept.js";
import {CartController} from "./controllers/CartController.js";
import {LinkController} from "./controllers/LinkController.js";
import {MenuController} from "./controllers/MenuController.js";
import {LoginController} from "./controllers/LoginController.js";
import {WishListController} from "./controllers/WishListController.js";
import {SkinToggleController} from "./controllers/SkinToggleController.js";
import {SiteSearchController} from "./controllers/SiteSearchController.js";
import {UrlHelper} from "./UrlHelper.js";
import {ShoppingCart} from "./models/ShoppingCart.js";
import {SessionHistory} from "./util/SessionHistory.js";
import {SizeHelper} from "./util/SizeHelper.js";

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
     * Keeps track of when loadNewSkinPage() has been called, so we
     * can print warnings if functions aren't being called in the
     * order we expect.
     * @type {boolean}
     */
    #loadNewSkinPageCalled = false;

    /**
     * Constructor
     */
    constructor() {
        SunsetSkin.#instance = this;

        // create preloader
        this.preloader = new SunsetPreload();

        // reload session history
        SessionHistory.restore();

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
        });

        // if the restricted popup box's parent isn't the page's body, move it.
        // otherwise it won't be visible to the user
        this.#moveRestrictedPopup();
    }

    /**
     * Moves the restricted search popup to the body, if it's not already there.
     */
    #moveRestrictedPopup() {
        function forceToBody($element) {
            if (!$element) {
                return;
            }
            if ($element.parentElement.nodeName.toLowerCase() !== 'body') {
                $element.parentElement.removeChild($element);
                document.body.appendChild($element);
            }
        }
        forceToBody(document.querySelector('.restricted-search'));
        forceToBody(document.querySelector('.restricted-search-wrapper'));
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
        SessionHistory.addListener((event) => {
        //window.addEventListener('popstate', (event) => {

            // warn if calling navigateTo() before calling loadNewSkinPage()
            if (this.#loadNewSkinPageCalled === false) {
                console.warn('navigateTo() is being called before loadNewSkinPage()');
            }

            // if the state is null, then we need to reload the initial page
            let url = event.state === null ? document.location + '' : event.state.url;
            this.navigateTo(url).then(_ => {
                // hide preloader
                this.preloader.ready();

                // restore scroll position
                if (event.state && event.state.scroll) {
                    console.log('restoring scroll to ' + event.state.scroll);
                    window.scrollTo(0, event.state.scroll);
                }
                else {
                    console.log('no scroll to restore in history state');
                }
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

        // check function calls order
        if (!this.html) {
            console.error('navigateTo() called before loadNewSkinPage()');
            alert('navigateTo() called before loadNewSkinPage()');
            return;
        }

        // alias certain urls for convenience
        const alias = [
            { old: 'index.html', new: 'Default.aspx' }
        ];
        let baseUrl = UrlHelper.getDeployment();
        for (let i = 0; i < alias.length; i++) {
            if (url === baseUrl + alias[i].old) url = baseUrl + alias[i].new;
        }

        // log call
        console.log('navigateTo: ' + url);
        this.usingDynamicLoading = true;

        // start showing progress bar
        let progress = new ProgressBar()
        progress.anim(70, 5);
        progress.setVisible(true);

        // clear out background thread monitoring sizes
        SizeHelper.clearMonitorList()

        // load both old and new page
        let loaded = await this.html.loadOld(url)
        if (!loaded) {
            progress.setVisible(false);
            console.error('loading failed.  url=' + url);
            alert('load failed');
            return;
        }

        // update history api, storing the url and scroll position
        let scroll = document.documentElement.scrollTop;
        let state = { url: url, scroll: scroll };
        //history.pushState(state, '', url);
        SessionHistory.push(state);
        //console.log('history state: ' + JSON.stringify(state));

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

        // need to redirect if we attempt to load index.html, the front page
        // fails to load correctly if not loaded from Default.aspx
        if (newUrl === 'index.html') {
            document.location = 'index.html';
            return;
        }



        this.#loadNewSkinPageCalled = true;

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
        //console.log('loadNewSkinPage()',{fileType:this.fileType, fileTypeSettings:fileTypeSettings});

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

        // hide the start-your-order prompt by default
        document.querySelector('.order-here-prompt').style.display = 'none';

        // setup common page controls
        this.searchController.build();
        this.linkController.build();
        this.wishListController.build();
        this.loginController.updateLoginStatus();
        this.skinToggleController.build();

        // run custom html generators for filetype via controller classes
        if (fileTypeSettings.controller) {
            console.log('Running controller: ' + fileTypeSettings.controller, fileTypeSettings);
            this.controller = SunsetSettings.getControllerInstanceByName(fileTypeSettings.controller, this);
            this.controller.build();
        }
        else {
            console.error('No controller for filetype: ' + this.fileType);
        }

        // reload the cart if needed
        this.checkForceReloadCartDropdown();
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
     * Shows an alert notification that disappears automatically after a few seconds.
     * @param title {string} the main message of the alert
     * @param message {string} the smaller details of the alert
     * @param seconds {number} the number of seconds to show the alert before auto-closing
     */
    alertNotification(title, message, seconds = 5) {

        console.log('alertNotification:', title, message);

        // create the notification
        let $notification = document.createElement('div');
        $notification.className = 'popup-notification';
        $notification.innerHTML = `
            <h1>${title}</h1>
            <p>${message}</p>
            <button class="btn">Closing in 5...</button>
        `;

        // handle closing animation
        let closed = false;
        const fnClose = _ => {
            closed = true;
            $notification.style.animation = 'slideOut 0.5s';
            setTimeout(_ => $notification.remove(), 500);
        };

        // close on button click
        let $btn = $notification.querySelector('.btn');
        $btn.addEventListener('click', _ => {
            fnClose();
        });

        // add it to the body
        document.body.appendChild($notification);

        // do the countdown
        let secondsLeft = seconds || 5;
        const timer = setInterval(_ => {
            $btn.innerHTML = `Closing in ${secondsLeft}...`;
            secondsLeft -= 1;
            if (closed || secondsLeft < 0) {
                clearInterval(timer);
                if (!closed) {
                    fnClose();
                }
            }
        }, 1000);
    }

    /**
     * Signs out the user from the site.
     */
    signOut() {
        this.getLoginStatus(loginStatus => {
            //loginStatus.$btnSignOut.click()
            this.aspNet.serverClick(loginStatus.$btnSignOut)
        });
    }


    /**
     * Checks if a flag was set to reload the cart from the server,
     * and does so if set.
     */
    checkForceReloadCartDropdown() {
        if (localStorage.getItem('forceReloadCartDropdown') === 'yes') {
            this.forceReloadCartDropdown();
        }
    }

    /**
     * Makes sure the cart dropdown is reloaded after an item
     * is added.  Sets a flag to force a reload on the next
     * page load, as often the old page will reload pages when
     * adding items to the cart.
     */
    forceReloadCartDropdown() {
        console.log('forceReloadCartDropdown()');

        // check for reload flag and clear it
        if (localStorage.getItem('forceReloadCartDropdown') === 'yes') {
            localStorage.removeItem('forceReloadCartDropdown');
        }
        else {
            // set a flag to force a reload on next page load.
            localStorage.setItem('forceReloadCartDropdown', 'yes');
        }

        // reload the cart dropdown
        try {
            if (!this.cartController) {
                console.warn('could not find login controller to force cart dropdown to reload');
                return;
            }
            ShoppingCart.invalidate();
            this.getLoginStatus((loginStatus) => {
                console.log('got login status, building cart dropdown', loginStatus);
                this.cartController.buildCartDropdown(loginStatus);
            })
        }
        catch (e) {
            console.error('error forceReloadCartDropdown', e);
        }
    }

}
