import {ChangePasswordForm} from "../models/ChangePasswordForm.js";
import {DomHelper} from "../util/DomHelper.js";

/**
 * Grabs references to DOM elements on the change password page.
 * /Login/Login.aspx?ChangePassword=1&reskin=no
 */
export class ChangePasswordParser {

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
     * Grabs references to DOM elements on the change password page.
     * @returns {ChangePasswordForm}
     */
    getChangePasswordForm() {
        let ret = new ChangePasswordForm();
        DomHelper.addElementsByQuery(ret, this.sourceDocument, {
            $txtChangePassword: '#MainContent_TxtNewPassword',
            $txtChangePasswordConfirm: '#MainContent_TxtNewPassword2',
            $btnSubmit: '#MainContent_BtnChangePassword',
            $lblChangePasswordError: '#MainContent_LblChangePasswordError'
        });
        return ret;
    }
}