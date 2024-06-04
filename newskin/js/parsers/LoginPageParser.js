import {DomHelper} from "../util/DomHelper.js";

/**
 * Set of references to DOM elements for the login page.
 */
export class LoginPageForm {

    /**
     * Reference to the username text box.
     * @type {HTMLInputElement|null}
     */
    $username = null;

    /**
     * Reference to the password text box.
     * @type {HTMLInputElement|null}
     */
    $password = null;

    /**
     * Reference to the remember me checkbox.
     * @type {HTMLInputElement|null}
     */
    $chkRememberMe = null;

    /**
     * Reference to the submit button.
     * @type {HTMLInputElement|null}
     */
    $btnSubmit = null;

    /**
     * Reference to the forgot password button.
     * @type {HTMLAnchorElement|null}
     */
    $btnForgotPassword = null;

    /**
     * Container of the error message.
     * @type {HTMLElement|null}
     */
    $error = null;

    /**
     * The error message on the login page, if any.
     * @type {string|null}
     */
    errorMessage = null;

    /**
     * Reference to the email text box on the registration form.
     * @type {HTMLInputElement|null}
     */
    $regEmail = null;

    /**
     * Reference to the password text box on the registration form.
     * @type {HTMLInputElement|null}
     */
    $regPassword = null;

    /**
     * Reference to the confirm-password text box on the registration form.
     * @type {HTMLInputElement|null}
     */
    $regConfirmPassword = null;

    /**
     * Reference to the first name text box on the registration form.
     * @type {HTMLInputElement|null}
     */
    $regFirstName = null;

    /**
     * Reference to the last name text box on the registration form.
     * @type {HTMLInputElement|null}
     */
    $regLastName = null;

    /**
     * Reference to the company text box on the registration form.
     * @type {HTMLInputElement|null}
     */
    $regCompany = null;

    /**
     * Reference to the account number text box on the registration form.
     * @type {HTMLInputElement|null}
     */
    $regAcctNo = null;

    /**
     * Reference to the submit button on the registration form.
     * @type {HTMLInputElement|null}
     */
    $regBtnSubmit = null;

}

/**
 * Grabs references to DOM elements for the login page.
 */
export class LoginPageParser {

    /**
     * The HTML document to connect to.
     * @type {Document|null}
     */
    sourceDocument = null;

    /**
     * Constructor defaults source document to the current document.
     * @param source {Document|null}
     */
    constructor(source= null) {
        this.sourceDocument = source || document;
    }

    /**
     * Grabs references to DOM elements for the login page.
     * @returns {LoginPageForm}
     */
    getLoginForm() {
        let ret = new LoginPageForm();
        DomHelper.addElementsByQuery(ret, this.sourceDocument, {
            // dom elements on login form
            $username: '#MainContent_TxtReturningEmail',
            $password: '#MainContent_TxtReturningPassword',
            $chkRememberMe: '#MainContent_ChkRememberMe',
            $btnSubmit: '#MainContent_BtnLogin',
            $btnForgotPassword: '#MainContent_BtnForgotPassword',

            // error message
            $error: '#MainContent_LblReturningError',

            // dom elements on the registration form*
            $regEmail: '#MainContent_TxtNewEmailAddress',
            $regPassword: '#MainContent_TxtNewPassword',
            $regConfirmPassword: '#MainContent_TxtNewPassword2',
            $regFirstName: '#MainContent_TxtFirstName',
            $regLastName: '#MainContent_TxtLastName',
            $regCompany: '#MainContent_TxtCompany',
            $regAcctNo: '#MainContent_TxtAcctNo',
            $regBtnSubmit: '#MainContent_BtnContinue'
        });
        if (ret.$error) {
            ret.errorMessage = ret.$error.innerText;
        }
        return ret;
    }
}