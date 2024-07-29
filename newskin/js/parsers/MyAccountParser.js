
import {DomHelper} from "../util/DomHelper.js";
import {OrderHistoryRow} from "../models/OrderHistoryRow.js";
import {ShippingAddress} from "../models/ShippingAddress.js";
import {OrderCache} from "../util/OrderCache.js";
import {AddressEditForm} from "../models/AddressEditForm.js";
import {MyAccountForm} from "../models/MyAccountForm.js";
import {OrderLoadedEvent} from "../util/OrderLoadedEvent.js";
import {OrderPaging} from "../models/OrderPaging.js";



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
     * Reference to the controller instance using this parser.
     * @type {MyAccountController|null}
     */
    controller = null;

    /**
     * Receives orders that are loaded on additional pages in the background.
     * @type {OrderLoadedEvent}
     */
    onOrdersLoaded = new OrderLoadedEvent();

    /**
     * The cache of loaded order numbers
     * @type {OrderCache|null}
     */
    #cache = null;

    /**
     * Constructor defaults source document to the current document.
     * @param source {Document|HTMLElement|null}
     * @param controller {MyAccountController}
     */
    constructor(source, controller) {
        this.sourceDocument = source || document;
        this.controller = controller;
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

        // grab paging buttons
        ret.$orderPaging = this.parsePaging(ret.$orderTable);

        // load orders from cache
        this.#cache = new OrderCache(ret.acctNo);
        this.#cache.load();

        // parse order history on old page, check against cache for what needs loaded
        let topPageOrders = this.parseOrders(ret.$orderTable);
        let loadNextPage = this.#cache.shouldLoadNextPage(topPageOrders);
        this.#cache.addRows(topPageOrders);
        if (!loadNextPage) {
            this.#cache.save();
            this.onOrdersLoaded.fire(this.#cache.orders, true);
        }

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


        // would like to only load all pages after user clicks "show all" but it's not working

        // attempt to load all pages of the order history in the background
        if (loadNextPage) {
            try {
                this.loadNextPageInBackground(ret.$orderPaging.$btnNext, 1, (newOrders) => {
                    // add to cache and alert order listeners
                    this.#cache.addRows(newOrders);
                    this.#cache.save();
                    this.onOrdersLoaded.fire(this.#cache.orders, true);
                });
            }
            catch (ex) {
                console.error('error loading history (loadNextPageInBackground)', ex);
            }
        }

        return ret;
    }

    /**
     * This loads the next page of the order history in the background
     * until there are no more pages.
     *
     * This utilizes a cache stored in localStorage by account number,
     * only loading pages until we reach the orders we already know about.
     * Normally this means we don't need to load any pages in the background
     * as new items will be on the first page that's already loaded.  Only
     * if the user has places 10 orders since their last login will require
     * the background loading.
     *
     * @param $btnNext {HTMLElement} the button to click to load the next page
     * @param pageNumber {number} the page number of the next page
     * @param callback {function(OrderHistoryRow[])} callback with order history, each recursive call combines its results
     */
    loadNextPageInBackground($btnNext, pageNumber, callback) {

        console.log('loadNextPageInBackground pageNumber=' + pageNumber);

        try {

            // skip if there are no additional pages
            if (!$btnNext) {
                //console.warn('$btnNext is null.')
                return;
            }


            // recursively load the next page until we have all the orders.
            // each recursive call will have its own "orders" array that gets combined
            // with the array sent to the result callback.  This causes the first call
            // to loadNedPageInBackground to have all orders in the correct order.
            this.controller.skin.aspNet.backgroundPostback($btnNext, (iframeDoc) => {

                // parse data from the loaded html
                let $orderTable = iframeDoc.querySelector('#MainContent_GridOrders');
                let orders = this.parseOrders($orderTable);
                let $orderPaging = this.parsePaging($orderTable);
                //console.warn('Reading a page ' + pageNumber + ' of the order history in the background...', orders);

                // check if we should load the next page
                let loadNextPage = $orderPaging.$btnNext &&
                    this.#cache.shouldLoadNextPage(orders)

                // load the next page
                if (loadNextPage) {
                    let nextPageNumber = pageNumber + 1;
                    this.loadNextPageInBackground($orderPaging.$btnNext, nextPageNumber,
                        (newOrders) => {
                            // combines the new page with the existing pages
                            orders = orders.concat(newOrders);
                            callback(orders);
                        });
                } else {
                    // all pages have been loaded
                    callback(orders);
                }

            }, true);

        }
        catch (ex) {
            console.error('Error in loadNextPageInBackground pageNumber=' + pageNumber, ex);
        }
    }

    /**
     * Reads the order history from its presentation in a html table.
     * @param $table {HTMLTableElement}
     * @returns {OrderHistoryRow[]}
     */
    parseOrders($table) {
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
    parsePaging($table) {

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