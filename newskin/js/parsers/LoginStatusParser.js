import {FetchHelper, FetchQueryList, FetchQueryItem} from "../util/FetchHelper.js";
import {DomHelper} from "../util/DomHelper.js";
import {LoginStatus} from "../models/LoginStatus.js";
import {Format} from "../util/Format.js";

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
                ret.email = Format.unescape(results.email);
                ret.name = Format.unescape(results.name);
                ret.company = Format.unescape(results.company);
                ret.acctNo = results.acctNo;
                ret.phone = this.readPhoneNumberFromTable(results.$addressTable);

                //console.log('readLoginStatus() results', ret);
                if (typeof callback === 'function') {
                    callback(ret);
                }
            });
        }
        return ret;
    }

    /**
     * Reads the phone number from the first address in the list on the
     * My Account page.
     * @param $addressTable {HTMLElement}
     */
    readPhoneNumberFromTable($addressTable) {
        if (!$addressTable) return null;

        let $tr = $addressTable.querySelectorAll('tr');
        if (!$tr) return null;
        if ($tr.length < 2) return null;

        // find the Phone column in the header and return the phone number in the second row
        let $th = $tr[0].querySelectorAll('th');
        for (let i = 0; i < $th.length; i++) {
            if ($th[i].innerHTML === 'Phone') {
                return Format.phone($tr[1].cells[i].innerHTML);
            }
        }

        // didn't find phone number
        return null;
    }

    /**
     * Uses FetchHelper to fetch the account details from several pages.
     * @returns {Promise<Record<string, string|HTMLElement>>}
     */
    async #fetchDetailPages() {
        return await new FetchHelper().fetchAndQuery(new FetchQueryList({
            email: new FetchQueryItem('ContactUs.aspx', '#MainContent_TxtEmail'),
            name: new FetchQueryItem('Login/MyAccount.aspx', '#MainContent_LblName'),
            company: new FetchQueryItem('Login/MyAccount.aspx', '#MainContent_LblCompany'),
            acctNo: new FetchQueryItem('Login/MyAccount.aspx', '#MainContent_LblAcctNo'),
            $addressTable : new FetchQueryItem('Login/MyAccount.aspx', '#MainContent_GridShipToAddresses', true)
        }));
    }
}
