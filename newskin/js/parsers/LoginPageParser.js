import {DomHelper} from "../util/DomHelper.js";
import {LoginPageForm} from "../models/LoginPageForm.js";

/**
 * Grabs references to DOM elements for the login page.
 */
export class LoginPageParser {

    /**
     * The HTML document to connect to.
     * @type {Document|HTMLElement|null}
     */
    sourceDocument = null;

    /**
     * Constructor defaults source document to the current document.
     * @param source {Document|HTMLElement|null}
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
            $regMessage: '#MainContent_LblMessage',
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
        if (ret.$regMessage) {
            ret.regMessage = ret.$regMessage.innerText;
        }
        return ret;
    }
}