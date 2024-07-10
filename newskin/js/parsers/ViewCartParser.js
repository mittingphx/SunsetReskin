import {DomHelper} from "../util/DomHelper.js";
import {CartProductItem} from "../models/CartProductItem.js";
import {ShoppingCart} from "../models/ShoppingCart.js";

/**
 * Parses ViewCart.aspx for all the products in the cart.
 */
export class ViewCartParser {

    /**
     * The document to be parsed
     * @type {HTMLElement}
     */
    source = null;

    /**
     * The selector to find the cart.
     * @type {string}
     */
    selector = '.ViewCart';

    /**
     * Constructor takes the optional document to be parsed and the
     * selector to use.  The defaults are the current document and
     * the selector '.ViewCart'.
     * @param sourceDocument {HTMLElement}
     * @param selector {string|null}
     */
    constructor(sourceDocument, selector) {
        this.source = sourceDocument || document.body;
        this.selector = selector || '.ViewCart';
    }

    /**
     * Reads all the nodes within the given <table>.
     * @returns {ShoppingCart}
     */
    readCart() {

        // grab cart elements from DOM
        let dom = {};
        DomHelper.addElementsByQuery(dom, this.source, {
            $table: '.ViewCart',
            $tableSummary: 'table#MainContent_TblSumm',
            $error: 'span#MainContent_LblError'
        })

        // create cart with any error received
        let cart = new ShoppingCart()
        if (dom.$error && dom.$error.textContent) {
            console.warn('Cart error: ' + dom.$error.textContent);
            cart.errorMessage = dom.$error.textContent;
        }
        else {
            cart.errorMessage = null;
        }

        // fill cart items and submit button
        if (dom.$table) {
            cart.items = this.readCartProducts(dom.$table);
            cart.$btnUpdate = dom.$table.querySelector('input#MainContent_BtnUpdateCart');
        }
        else {
            cart.items = [];
        }

        // fill cart with DOM references from summary table
        if (dom.$tableSummary) {
            DomHelper.addElementsByQuery(cart, dom.$tableSummary, {
                $oldShipping: 'select#MainContent_DropShipMethod',
                $oldPO: 'input#MainContent_TxtPONumber',
                $oldMessage: 'input#MainContent_TxtMessage',
                $btnSubmit: 'input#MainContent_BtnCheckOut'
            })
        }

        cart.storeInCache();
        return cart;
    }

    /**
     * Reads all the nodes within the given <table>.
     * @param $table {HTMLTableElement}
     * @returns {CartProductItem[]}
     */
    readCartProducts($table) {
        let items = [];
        let $rows = $table.querySelectorAll('tr');

        for (let i = 0; i < $rows.length; i++) {

            // skip header
            if (i === 0) continue;

            // skip footer
            if (i === $rows.length - 1) continue;

            // grab each cart item row
            let $row = $rows[i];
            let item = this.readFromRow($row);
            if (item) {
                items.push(item);
            }
        }
        return items;
    }

    /**
     * Reads the data from the given row.
     * @param $row {HTMLTableRowElement}
     * @returns {CartProductItem|null}
     */
    readFromRow($row) {
        let item = new CartProductItem();
        let $cells = $row.querySelectorAll('td');

        // image
        //item.image = $cells[0].querySelector('img').src;

        // product info
        let productText = $cells[1].querySelector('a').innerHTML;
        let productTextSplit = productText.split('<br>');

        if (productTextSplit.length > 1) {
            item.itemNo = parseInt(productTextSplit[0]);
            item.description = productTextSplit[1];
        }
        else {
            item.itemNo = 0;
            item.description = productTextSplit[0];
        }
        if (productTextSplit.length > 2) {
            item.unitType = productTextSplit[2];
        }
        else {
            item.unitType = '';
        }

        // get image from itemNo
        if (item.itemNo > 0) {
            item.image = 'https://swwest.com/Images/SunsetItems/' + item.itemNo + '/0thn.jpg';
        }

        // error message
        let textError = $cells[1].querySelector('.TextError');
        if (textError) {
            item.textError = textError.innerText;
        }

        // price
        let price = $cells[2].innerText;
        price = price.replace('$', '');
        item.price = parseFloat(price);

        // quantity
        item.quantity = parseInt($cells[3].querySelector('input').value);

        // total
        // (just use calculation property)

        // input for quantity and checkbox
        item.$qty = $cells[3].querySelector('input');
        item.$removeCheckbox = $cells[5].querySelector('input');

        return item;
    }
}