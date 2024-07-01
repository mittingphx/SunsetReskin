// noinspection JSUnusedGlobalSymbols

import {PageControllerBase} from "./BaseControllers.js";
import {LoginPageParser} from "../parsers/LoginPageParser.js";
import {LoginPageBuilder} from "../builders/LoginPageBuilder.js";
import {LoginStatusBuilder} from "../builders/LoginStatusBuilder.js";
import {DomHelper} from "../util/DomHelper.js";
import {LoginStatusParser} from "../parsers/LoginStatusParser.js";
import {EventListener} from "../util/EventListener.js";


/**
 * Controller for the login page and site elements.
 */
export class LoginController extends PageControllerBase {

    /**
     * Last login status read from the web page.  Use getStatus()
     * order the statusUpdatedEvent to access this value, otherwise
     * it might not yet be populated.
     * @type {LoginStatus|null}
     */
    #status = null;

    /**
     * Builder for the html elements in the login page.
     * @type {LoginPageBuilder}
     */
    pageBuilder = new LoginPageBuilder();

    /**
     * Builder for the  area showing the login status of the web page.
     * @type {LoginStatusBuilder}
     */
    statusBuilder = new LoginStatusBuilder();

    /**
     * Parser for reading the form on the login page.
     * @type {LoginPageParser|null}
     */
    pageParser = null;

    /**
     * Parser for getting the current user's login status.
     * @type {LoginStatusParser|null}
     */
    statusParser = null;

    /**
     * Handles event when the login status changes.
     * @type {EventListener}
     */
    statusUpdatedEvent = new EventListener('LoginStatusUpdated', _ => {
        return this.#status;
    });


    /**
     * Constructor takes reference to the skin to be built.
     * @param skin {SunsetSkin} the skin to build
     */
    constructor(skin) {
        super(skin);
    }

    /**
     * Builds the login page.
     */
    build() {

        if (!this.#initParsers()) return;

        let dom = {};
        if (!DomHelper.addElementsByQuery(dom, {
            $loginForm: 'form.login-form',
            $registerForm: 'form.account-register-form'
        })) return;

        // build the form
        this.pageBuilder.build(
            this.pageParser.getLoginForm(),
            dom.$loginForm,
            dom.$registerForm);

        // set the window title
        document.title = `Login - Sunset Wholesale West`;
    }

    /**
     * Builds the login status area at the top of the page.
     * @param loginStatus {LoginStatus|null} optionally allows status to be passed in instead of using #status
     */
    buildStatusInfo(loginStatus = null) {

        if (!loginStatus) {
            loginStatus = this.#status;
        }

        // make sure we've got a status
        if (!loginStatus) {
            console.error('Call to buildStatusInfo() before updateLoginStatus()');
            return;
        }

        // make sure we've got a place to put it
        //if (!this.$insertStatusInfo) {   // this was pointing at prior pages when we saved the reference
            let $insertStatusInfo = document.querySelector('.top-end');
            if (!$insertStatusInfo) {
                console.error('Could not find .top-end');
                return;
            }
        //}

        // build the status area
        let $newStatusInfo = this.statusBuilder.build(loginStatus);
        $insertStatusInfo.replaceWith($newStatusInfo);
    }

    /**
     * Immediately returns the login status if it's available, otherwise
     * the status is requested and a new event is registered to call the
     * callback as soon as the status is available.
     * @param fnCallback {function(LoginStatus)}
     */
    getStatus(fnCallback) {
        if (this.#status) {
            fnCallback(this.#status);
        }
        this.statusUpdatedEvent.addListener(fnCallback);
    }

    /**
     * Parses the login status from the old page and builds the new status.
     */
    updateLoginStatus() {
        if (!this.#initParsers()) return;

        this.statusParser.readLoginStatus(status => {
            this.#status = status;
            this.statusUpdatedEvent.trigger();
        })
    }

    /**
     * Creates the parsing instances if they don't already exist.
     * @returns {boolean} true if the parsers were created
     */
    #initParsers() {

        let $oldBody = this.skin.html.oldHtmlBody;
        if (!$oldBody) {
            console.error('Could not find old body');
            return false;
        }

        if (!this.pageParser) {
            this.pageParser = new LoginPageParser($oldBody);
        }
        if (!this.statusParser) {
            this.statusParser = new LoginStatusParser($oldBody);
        }

        return !(!this.pageParser || !this.statusParser);
    }
}