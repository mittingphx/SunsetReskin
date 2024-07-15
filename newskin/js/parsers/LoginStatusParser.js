import {FetchHelper, FetchQueryList, FetchQueryItem} from "../util/FetchHelper.js";
import {DomHelper} from "../util/DomHelper.js";
import {LoginStatus} from "../models/LoginStatus.js";

/**
 * Parses from the old web page whether the user is logged in, and who
 * is that user.
 */
export class LoginStatusParser {

    /**
     * The document we're reading the loggedIn property form.
     * @type {HTMLElement}
     */
    sourceDocument = null;

    /**
     * Constructor defaults source document to the current document.
     * @param source {HTMLElement|null}
     */
    constructor(source) {
        this.sourceDocument = source;
    }

    /**
     * Reads the login status from the source document with an optional
     * callback when all details have finished loading.
     * @param {function(LoginStatus)} callback
     * @returns {LoginStatus}
     */
    readLoginStatus(callback) {
        let ret = new LoginStatus();

        // grab DOM references
        DomHelper.addElementsByQuery(ret, this.sourceDocument, {
            $acctLink: '#LnkMyAccount',
            $adminLink: '#LnkAdmin',
            $btnSignOut: '#LBtnLogOut'
        });

        // check for login, if not found then we're not logged in
        if (!ret.$acctLink || ret.$acctLink.innerHTML === 'Create Account') {
            ret.loggedIn = false;
            if (typeof callback === 'function') {
                callback(ret);
            }
            return ret;
        }
        // read details if logged in
        else {
            ret.loggedIn = true;
            ret.isAdmin = !!ret.$adminLink;
            this.#fetchDetailPages().then(results => {
                ret.email = results.email;
                ret.name = results.name;
                ret.company = results.company;
                ret.acctNo = results.acctNo;

                //console.log('readLoginStatus() results', ret);
                if (typeof callback === 'function') {
                    callback(ret);
                }
            });
        }
        return ret;
    }

    /**
     * Uses FetchHelper to fetch the account details from several pages.
     * @returns {Promise<Record<string, string>>}
     */
    async #fetchDetailPages() {
        return await new FetchHelper().fetchAndQuery(new FetchQueryList({
            email: new FetchQueryItem('ContactUs.aspx', '#MainContent_TxtEmail'),
            name: new FetchQueryItem('Login/MyAccount.aspx', '#MainContent_LblName'),
            company: new FetchQueryItem('Login/MyAccount.aspx', '#MainContent_LblCompany'),
            acctNo: new FetchQueryItem('Login/MyAccount.aspx', '#MainContent_LblAcctNo')
        }));
    }
}
