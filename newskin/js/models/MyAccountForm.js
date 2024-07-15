
/**
 * Set of references to DOM elements for the account page.
 */
export class MyAccountForm {

    /**
     * Reference to the span containing the account name.
     * @type {HTMLSpanElement|null}
     */
    $spanName = null;

    /**
     * Reference to the span containing the account's company name.
     * @type {HTMLSpanElement|null}
     */
    $spanCompany = null;

    /**
     * Reference to the recent orders table.
     * @type {HTMLTableElement|null}
     */
    $orderTable = null;

    /**
     * References to the paging buttons for the orders table.
     * @type {OrderPaging|null}
     */
    $orderPaging = null;

    /**
     * Reference to the table of shipping addresses.
     * @type {null}
     */
    $shippingAddressTable = null;

    /**
     * The form for editing the selected shipping address.
     * @type {null}
     */
    $shippingAddressForm = null;

    /**
     * The button to show the change password form.
     * @type {HTMLAnchorElement|null}
     */
    $btnChangePassword = null;

    /**
     * The order history.
     * @type {OrderHistoryRow[]}
     */
    orders = [];

    /**
     * All shipping addresses tied to this account.
     * @type {ShippingAddress[]}
     */
    shippingAddresses = [];

    /**
     * Form elements for editing an address.
     * @type {AddressEditForm|null}
     */
    editForm = null;

    /**
     * The span holding the account number in the old webpage.
     * @type {HTMLSpanElement|null}
     */
    $acctNo = null;

    /**
     * The account number for the logged-in user.
     * @type {string|null}
     */
    acctNo = null;

}
