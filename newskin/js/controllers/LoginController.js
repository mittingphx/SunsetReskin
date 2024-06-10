import {PageControllerBase} from "./BaseControllers.js";
import {LoginPageParser} from "../parsers/LoginPageParser.js";
import {LoginPageBuilder} from "../builders/LoginPageBuilder.js";
import {LoginStatusBuilder} from "../builders/LoginStatusBuilder.js";
import {DomHelper} from "../util/DomHelper.js";

/**
 * Controller for the login page and site elements.
 */
export class LoginController extends PageControllerBase {

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

        let $oldBody = this.html.oldHtmlBody;
        if (!$oldBody) {
            console.error('Could not find old body');
            return;
        }

        let parser = new LoginPageParser($oldBody);
        let loginForm = parser.getLoginForm();

        let dom = {};
        if (!DomHelper.addElementsByQuery(dom, {
            $loginForm: 'form.login-form',
            $registerForm: 'form.account-register-form'
        })) return;

        // build the form
        this.pageBuilder.build(loginForm, dom.$loginForm, dom.$registerForm);

        // set the window title
        document.title = `Login - Sunset Wholesale West`;
    }

    /**
     * Builds the login status area at the top of the page.
     */
    buildStatusInfo() {

        // grab insertion point
        let $topEnd = document.querySelector('.top-end');
        if (!$topEnd) {
            console.error('Could not find .top-end');
            return;
        }

        // create status info
        let $loginStatus = this.statusBuilder.build(this.skin.loginStatus);
        $topEnd.replaceWith($loginStatus);
    }
}