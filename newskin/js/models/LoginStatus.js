
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
