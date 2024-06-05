import {UrlHelper} from "../UrlHelper.js";
import {DomHelper} from "../util/DomHelper";

/**
 * The contents of the customer's shopping cart.
 */
export class ShoppingCart {

    /**
     * The last loaded instance of the shopping cart, allowing for
     * building features like the cart dropdown view without having
     * to reload the cart page in the background.
     *
     * Reloaded instances will only have the items property available.
     * All other properties will be disconnected.
     *
     * Other classes should call getInstance()
     *
     * @type {ShoppingCart}
     */
    static #instance = null;

    /**
     * The items in the shopping cart.
     * @type {CartProductItem[]}
     */
    items = [];

    /**
     * Error message reported by the server (usually cart is empty)
     * @type {string|null}
     */
    errorMessage = null;

    /**
     * The submit button in the shopping cart.
     * @type {HTMLInputElement}
     */
    $btnSubmit = null;

    /**
     * The update cart button in the shopping cart.
     * @type {HTMLInputElement}
     */
    $btnUpdate = null;

    /**
     * The <select> for shipping in the old form.
     * @type {HTMLSelectElement}
     */
    $oldShipping = null;

    /**
     * The <input> for PO number in the old form.
     * @type {HTMLInputElement}
     */
    $oldPO = null;

    /**
     * The <input> for message in the old form.
     * @type {HTMLInputElement}
     */
    $oldMessage = null;

    /**
     * The <select> for shipping in the shopping cart.
     * @type {HTMLSelectElement}
     */
    $newShipping = null;

    /**
     * The <input> for PO number in the shopping cart.
     * @type {HTMLInputElement}
     */
    $newPO = null;

    /**
     * The <input> for message in the shopping cart.
     * @type {HTMLInputElement}
     */
    $newMessage = null;

    /**
     * Returns all the items in the shopping cart
     */
    get total() {
        let total = 0;
        for (let item of this.items) {
            total += item.total;
        }
        return total;
    }

    /**
     * Default constructor
     */
    constructor() {

        // save last instance as singleton
        ShoppingCart.#instance = this;
    }

    /**
     * Attempts to load the cart's items from cache if the singleton is
     * not already available.
     */
    static getInstance() {
        if (!ShoppingCart.#instance) {
            ShoppingCart.#instance = new ShoppingCart();
            ShoppingCart.#instance.readFromCache();
        }
        return ShoppingCart.#instance;
    }

    /**
     * Calls the asynchronous function to load the cart from the server
     * and calls the callback function when finished.
     * @param fnCallback
     */
    static getInstanceAsync(fnCallback) {
        let loaded = false;
        console.log('Call to getInstanceAsync()');

        // check for singleton instance first
        if (ShoppingCart.#instance) {
            fnCallback(ShoppingCart.#instance);
            return;
        }

        // attempt a cache read
        let cart  = new ShoppingCart();
        loaded = cart.readFromCache();
        if (loaded) {
            fnCallback(cart);
            return;
        }

        // load in the background from server
        new Promise(async () => {
            cart = await ShoppingCart.loadCartFromServer();
            if (!cart) {
                fnCallback(new ShoppingCart());
            }
            else {
                fnCallback(cart);
            }
        }).then(() => {
            // moved callback to above
        });
    }


    /**
     * Sets the DOM elements from the shopping cart in the old page
     * and presses submit button.
     *
     * TODO: need to handle the response elegantly somehow
     */
    updateAndSubmit() {
        this.update();
        this.$btnSubmit.click();
    }

    /**
     * This copies all the new form fields into the old form
     * and presses update button.
     */
    updateCart() {
        this.update();
        this.$btnUpdate.click();
    }

    /**
     * Copies the new form fields into the old form and updates the
     * items properties to reflect the new values.
     */
    update() {
        for (let item of this.items) {
            // we can reliably use the object values, as event handling
            // guarantees these match the form fields
            item.$qty.value = item.quantity.toString();
            item.$removeCheckbox.checked = item.markedForDeletion;
        }
    }

    /**
     * Serializes the items and writes them to local storage, so we
     * can build the cart preview without reloading the cart data
     * from the server on every page hit.
     */

    storeInCache() {

        // save last instance as singleton
        ShoppingCart.#instance = this;

        // store item data in local storage
        let items = [];
        for (let item of this.items) {
            items.push(item.freeze());
        }
        let data = {
            items: items,
            timestamp: new Date().getTime()
        };
        localStorage.setItem('cart', JSON.stringify(data));
    }

    /**
     * Loads item data from local storage.
     *
     * @returns {boolean} true iff successfully read from cache to fill object
     */
    readFromCache() {

        // read item data from local storage
        let cache = localStorage.getItem('cart');
        if (cache === null) {
            return false;
        }

        // make sure it's not expired
        const TEN_MINUTES = 10 * 60;
        let data = JSON.parse(cache);
        let now = new Date().getTime();
        let elapsedSeconds = (now - data.timestamp) / 1000;
        if (elapsedSeconds > TEN_MINUTES) {
            return false;
        }

        // parse the individual items
        this.items = [];
        if (data.items) {
            for (let item of data.items) {
                let newItem = CartProductItem.thaw(item);
                this.items.push(newItem);
            }
        }
        return true;
    }

    /**
     * Loads the HTML for the shopping cart in the background.
     * This allows the cached data to be updated from the server.
     * Also sets the instance property and updates cache.
     *
     * @returns {ShoppingCart}
     */
    static async loadCartFromServer() {

        console.log('loadCartFromServer()');

        let cart = null;

        try {
            // grab from server
            const url = UrlHelper.getDeployment() + 'ViewCart.aspx';
            const response = await fetch(url);
            if (response.status !== 200) {
                console.error('HTTP Error ' + response.statusText + ' while loading cart data.  Returning cached cart.');
                cart = ShoppingCart.getInstance();
                cart.errorMessage = 'HTTP Error ' + response.status + ' (' + response.statusText + ')';
                return cart;
            }

            const htmlContent = await response.text();
            const cartDocument = new DOMParser().parseFromString(htmlContent, 'text/html');
            console.log({cartDocument: cartDocument})

            // parse and cache
            let parser = new ViewCartParser(cartDocument.body, null);
            cart = parser.readCart();
            console.log({cart: cart});
        }
        catch (error) {
            console.error(error);
        }

        return cart;
    }


    /**
     * Returns true iff there are no items in the cart.
     * @returns {boolean}
     */
    isEmpty() {
        return this.items.length === 0;
    }
}

/**
 * Represents one item in the shopping cart.
 */
export class CartProductItem {

    /**
     * The item number of the product in the cart.
     * @type {number}
     */
    itemNo = 0;

    /**
     * The text description of the product in the cart.
     * @type {string|null}
     */
    description = null;

    /**
     * The units each qty is sold in, for example "SINGLE" or "18/CASE"
     * @type {string}
     */
    unitType = '';

    /**
     * The image of the product in the cart.
     * @type {string}
     */
    image = '';


    /**
     * The unit price of the product in the cart.
     * @type {number}
     */
    price = 0;

    /**
     * The quantity of the product in the cart.
     * @type {number}
     */
    quantity = 0;

    /**
     * When true the item will be removed from the cart upon submission.
     * @type {boolean}
     */
    markedForDeletion = false;

    /**
     * The error message displayed for this item in the cart.
     * @type {string|null}
     */
    textError = null;

    /**
     * Input tag for editing quantity.
     * @type {HTMLInputElement}
     */
    $qty = null;

    /**
     * Checkbox for removing an item from the cart.
     * @type {HTMLInputElement}
     */
    $removeCheckbox = null;

    /**
     * The input for editing the quantity in the new skin.
     * @type {HTMLInputElement}
     */
    $newQuantity = null;

    /**
     * The checkbox for removing an item from the cart in the new skin.
     * @type {HTMLElement}
     */
    $newCheckbox = null;


    /**
     * Returns the total price for the quantity of items to be purchased
     * @returns {number}
     */
    get total() {
        return this.price * this.quantity;
    }

    /**
     * Returns the link to the item detail page.
     * @returns {string}
     */
    get link() {
        return 'ItemDetail.aspx?ItemNo=' + this.itemNo + '&ReturnURL=ViewCart.aspx';
    }

    /**
     * Default constructor
     */
    constructor() {
    }

    /**
     * Serializes the item values that need to be cached between page hits.
     */
    freeze() {
        const fields = [
            'itemNo',
            'description',
            'unitType',
            'image',
            'price',
            'quantity',
            'markedForDeletion',
            'textError'
        ];

        let data = {};
        for (let field of fields) {
            data[field] = this[field];
        }
        return JSON.stringify(data);
    }

    /**
     * Deserializes the cached item data, not including DOM elements.
     * @param dataString {string}
     * @returns {CartProductItem}
     */
    static thaw(dataString) {
        let data = JSON.parse(dataString);

        let item = new CartProductItem();
        for (let field in data) {
            item[field] = data[field];
        }
        return item;
    }
}

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
        if (dom.$error) {
            console.warn('Cart error: ' + dom.$error.textContent);
            cart.errorMessage = dom.$error.textContent;
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