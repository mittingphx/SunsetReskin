import {FetchHelper, FetchQueryList, FetchQueryItem} from "../util/FetchHelper.js";
import {DomHelper} from "../util/DomHelper.js";

/**
 * Current status of the user.
 */
export class LoginStatus {

    /**
     * True iff the user is logged in.
     * @type {boolean}
     */
    loggedIn = false; // from every page LnkMyAccount says "Create Account" or "My Account"

    /**
     * True iff the user is an admin
     * @type {boolean}
     */
    isAdmin = false; // from every page does LnkAdmin exist

    /**
     * The id of the user's account.
     * @type {string|null}
     */
    acctNo = null; // Login/MyAccount.aspx > MainContent_LblAcctNo

    /**
     * The name on the user's account.
     * @type {string|null}
     */
    name = null; // ContactUs.aspx > MainContent_TxtFullName
    // or Login/MyAccount.aspx > MainContent_LblName

    /**
     * The name of the company the user belongs to.
     * @type {string|null}
     */
    company = null; // ContactUs.aspx > MainContent_TxtCompany
    // or Login/MyAccount.aspx > MainContent_LblCompany

    /**
     * The email of the user account.
     * This comes from ContactUs.aspx > MainContent_TxtEmail
     * @type {string|null}
     */
    email = null;  // from ContactUs.aspx > MainContent_TxtEmail

    /**
     * Reference to the log-out button on the old page, if logged in.
     * @type {HTMLElement|null}
     */
    $btnSignOut = null;

    /**
     * DOM reference to the link to the account page, if available.
     * @type {HTMLElement|null}
     */
    $acctLink = null;

    /**
     * DOM reference to the link to the admin page, if available
     * @type {HTMLElement|null}
     */
    $adminLink = null;
}

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

                console.log('readLoginStatus() results', ret);
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
