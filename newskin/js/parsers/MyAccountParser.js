// noinspection JSUnusedGlobalSymbols

import {DomHelper} from "../util/DomHelper.js";
import {OrderHistoryRow} from "../models/OrderHistoryRow.js";
import {ShippingAddress} from "../models/ShippingAddress.js";


/**
 * DOM references to the paging buttons on the order history page.
 */
export class OrderPaging {

    /**
     * Button to go to the last page.
     * @type {HTMLAnchorElement|null}
     */
    $btnLast = null;

    /**
     * Button to go to the first page.
     * @type {HTMLAnchorElement|null}
     */
    $btnFirst = null;

    /**
     * Button to go to the previous page.
     * @type {HTMLAnchorElement|null}
     */
    $btnPrev = null;

    /**
     * Button to go to the next page.
     * @type {HTMLAnchorElement|null}
     */
    $btnNext = null;
}

/**
 * DOM references to the fields on the old page for editing a shipping address.
 */
export class AddressEditForm {

    /**
     * Field for the fax number.
     * @type {HTMLInputElement|null}
     */
    $name = null;

    /**
     * Field for the fax number.
     * @type {HTMLInputElement|null}
     */
    $address = null;

    /**
     * Field for the fax number.
     * @type {HTMLInputElement|null}
     */
    $unitNo = null;

    /**
     * Field for the fax number.
     * @type {HTMLInputElement|null}
     */
    $zipCode = null;

    /**
     * Field for the fax number.
     * @type {HTMLInputElement|null}
     */
    $city = null;

    /**
     * Field for the fax number.
     * @type {HTMLSelectElement|null}
     */
    $state = null;

    /**
     * Field for the phone number.
     * @type {HTMLInputElement|null}
     */
    $phoneNumber = null;

    /**
     * Field for the cell number.
     * @type {HTMLInputElement|null}
     */
    $cellNumber = null;

    /**
     * Field for the fax number.
     * @type {HTMLInputElement|null}
     */
    $faxNumber = null;

    /**
     * Submit button to save a new address.
     * @type {HTMLInputElement|null}
     */
    $btnAdd= null;

    /**
     * Submit button to cancel editing an address.
     * @type {HTMLInputElement|null}
     */
    $btnCancel = null;

    /**
     * Span containing a message after an address has been saved.
     * @type {HTMLSpanElement|null}
     */
    $message = null;


}

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

/**
 * Grabs references to DOM elements for the My Account page.
 */
export class MyAccountParser {

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
     * Grabs references to DOM elements for the account page.
     * @returns {MyAccountForm}
     */
    getMyAccountForm() {
        let ret = new MyAccountForm();

        DomHelper.addElementsByQuery(ret, this.sourceDocument, {
            // dom elements on account page
            $spanName: '#MainContent_LblName',
            $spanCompany: '#MainContent_LblCompany',

            $orderTable: '#MainContent_GridOrders',
            $shippingAddressTable: '#MainContent_GridShipToAddresses',
            $shippingAddressForm: '#MainContent_TableEditShipToAddress',
            $btnChangePassword: '#MainContent_LnkChangePassword',

            $acctNo: '#MainContent_LblAcctNo'
        });
        ret.acctNo = ret.$acctNo.innerHTML;

        // parse order history
        ret.orders = this.#parseOrders(ret.$orderTable);
        ret.$orderPaging = this.#parsePaging(ret.$orderTable);

        // parse shipping addresses
        ret.shippingAddresses = this.#parseShippingAddresses(ret.$shippingAddressTable);

        // the edit form
        ret.editForm = new AddressEditForm();
        DomHelper.addElementsByQuery(ret.editForm, ret.$shippingAddressForm, {
            $name: '#MainContent_TxtName',
            $address: '#MainContent_TxtAddress',
            $unitNo: '#MainContent_TxtApartment',
            $zipCode: '#MainContent_TxtZipCode',
            $city: '#MainContent_TxtCity',
            $state: '#MainContent_DropState',
            $phoneNumber: '#MainContent_TxtPhone',
            $cellNumber: '#MainContent_TxtCell',
            $faxNumber: '#txtFaxNumber',
            $btnAdd: '#MainContent_BtnAddAddress',
            $btnCancel: '#MainContent_BtnCancel',
            $message: '#MainContent_LblShipMessage'
        });

        return ret;
    }

    /**
     * Reads the order history from its presentation in a html table.
     * @param $table {HTMLTableElement}
     * @returns {OrderHistoryRow[]}
     */
    #parseOrders($table) {
        let ret = [];
        let $rows = $table.querySelectorAll('tr');
        for (let i = 0; i < $rows.length; i++) {
            if (i === 0) continue; // skip header
            let orderRow = this.#parseOrderRow($rows[i]);
            if (orderRow) ret.push(orderRow);
        }
        return ret;
    }

    /**
     * Grabs references to the paging buttons in the order history table.
     * @param $table {HTMLTableElement}
     * @returns {OrderPaging}
     */
    #parsePaging($table) {

        let ret = new OrderPaging()

        // grab the row that has the paging buttons
        let $tr = this.#getPagingRow($table);
        if (!$tr) return ret;

        // read the paging buttons
        let $links = $tr.querySelectorAll('a');
        for (let j = 0; j < $links.length; j++) {
            let $link = $links[j];
            let linkHTML = $link.outerHTML;
            if (linkHTML.indexOf('Page$Next') > -1) {
                ret.$btnNext = $link;
            }
            else if (linkHTML.indexOf('Page$Prev') > -1) {
                ret.$btnPrev = $link;
            }
            else if (linkHTML.indexOf('Page$First') > -1) {
                ret.$btnFirst = $link;
            }
            else if (linkHTML.indexOf('Page$Last') > -1) {
                ret.$btnLast = $link;
            }
        }
        return ret;
    }

    /**
     * Parses one row record from a table row.
     * @param $tr
     * @returns {OrderHistoryRow}
     */
    #parseOrderRow($tr) {
        let $cells = $tr.querySelectorAll('td');

        // skip paging
        if (this.#isPagingRow($tr)) {
            return null;
        }

        let ret = new OrderHistoryRow();
        try {
            ret.$link = $cells[0].querySelector('a');
            ret.orderNo = ret.$link.innerHTML;
            ret.orderDate = $cells[1].innerHTML;
            ret.invoiceNo = $cells[2].innerHTML;
            ret.orderStatus = $cells[3].innerHTML;
            ret.orderTotal = $cells[4].innerHTML;
        }
        catch (ex) {
            console.error(ex);
            return null;
        }
        return ret;
    }

    /**
     * Returns true iff the row is the paging row from the old website.
     * @param $tr {HTMLTableRowElement}
     * @returns {boolean}
     */
    #isPagingRow($tr) {
        return $tr.innerHTML.indexOf('Page$Next') > -1
            || $tr.innerHTML.indexOf('Page$Previous') > -1
            || $tr.children.length !== 5;
    }

    /**
     * Gets the specific row in the order table that has the paging buttons.
     * @param $table {HTMLTableElement}
     * @returns {HTMLTableRowElement}
     */
    #getPagingRow($table) {
        let $rows = $table.querySelectorAll('tr');
        for (let i = 0; i < $rows.length; i++) {
            let $tr = $rows[i];
            if (this.#isPagingRow($tr)) {
                return $tr;
            }
        }
        return null;
    }

    /**
     * Reads the shipping addresses from its presentation in a html table.
     * @param $table {HTMLTableElement}
     * @returns {ShippingAddress[]}
     */
    #parseShippingAddresses($table) {

        let ret = [];
        let $rows = $table.querySelectorAll('tr');
        for (let i = 0; i < $rows.length; i++) {
            if (i === 0) continue; // skip header
            ret.push(this.#parseShippingAddressRow($rows[i]));
        }
        return ret;
    }

    /**
     * Reads a shipping address from a table row.
     * @param $tr {HTMLTableRowElement}
     * @returns {ShippingAddress}
     */
    #parseShippingAddressRow($tr) {

        let $cells = $tr.querySelectorAll('td');

        let ret = new ShippingAddress();
        ret.$link = $cells[0].querySelector('a');
        ret.addressName = $cells[1].innerHTML;
        ret.businessAddress = $cells[2].innerHTML;
        ret.unitNo = $cells[3].innerHTML;
        ret.city = $cells[4].innerHTML;
        ret.state = $cells[5].innerHTML;
        ret.zipCode = $cells[6].innerHTML;
        ret.phoneNumber = $cells[7].innerHTML;
        ret.cellNumber = $cells[8].innerHTML;
        ret.faxNumber = $cells[9].innerHTML;
        ret.$deleteLink = $cells[10].querySelector('a');
        return ret;
    }
}