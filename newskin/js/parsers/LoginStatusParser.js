import {FetchHelper, FetchQueryList, FetchQueryItem} from "../util/FetchHelper.js";

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
     * Just checks the login status without attempting to load the
     * rest of the account fields.
     * @returns {boolean}
     */
    isLoggedIn() {
        return this.readBasicLoginStatus().loggedIn;
    }

    /**
     * Checks that the login is an admin user without attempting to load
     * the rest of the account fields.
     */
    isAdmin() {
        return this.readBasicLoginStatus().isAdmin
    }

    /**
     * Gets just the login status from the source document without querying
     * other files to fill in all details.
     * @returns {LoginStatus}
     */
    readBasicLoginStatus() {
        let ret = new LoginStatus();

        // check for login
        let $acctLink = this.sourceDocument.querySelector('#LnkMyAccount');
        if (!$acctLink) {
            console.error('Could not find account link using selector: #LnkMyAccount');
            ret.loggedIn = false;
            return ret;
        }

        // check for admin
        let $adminLink = this.sourceDocument.querySelector('#LnkAdmin');
        ret.isAdmin = !!$adminLink;

        return ret;
    }

    /**
     * Reads the login status from the source document with an optional
     * callback when all details have finished loading.
     * @param {function(LoginStatus)} callback
     * @returns {LoginStatus}
     */
    readLoginStatus(callback) {

        // detected if we're logged in
        let ret = this.readBasicLoginStatus();

        // read details if logged in
        if (ret.loggedIn) {
            this.#fetchDetailPages().then(results => {
                ret.email = results.email;
                ret.name = results.name;
                ret.company = results.company;
                ret.acctNo = results.acctNo;

                if (typeof callback === 'function') {
                    callback(ret);
                }
            });
        }
        else {
            if (typeof callback === 'function') {
                callback(ret);
            }
        }
        return ret;
    }

    /**
     * Uses FetchHelper to fetch the account details from several pages.
     * @returns {Promise<Record<string, string>>}
     */
    async #fetchDetailPages() {
        return await new FetchHelper().fetchAndQuery(new FetchQueryList({
            email: new FetchQueryItem('ContactUs.aspx', 'MainContent_TxtEmail'),
            name: new FetchQueryItem('Login/MyAccount.aspx', 'MainContent_LblName'),
            company: new FetchQueryItem('Login/MyAccount.aspx', 'MainContent_LblCompany'),
            acctNo: new FetchQueryItem('Login/MyAccount.aspx', 'MainContent_LblAcctNo')
        }));
    }

}
