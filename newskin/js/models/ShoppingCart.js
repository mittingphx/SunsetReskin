import {UrlHelper} from "../UrlHelper.js";
import {ViewCartParser} from "../parsers/ViewCartParser.js";
import {CartProductItem} from "./CartProductItem.js";
import {SunsetSkin} from "../SunsetSkin.js";

/**
 * The contents of the customer's shopping cart.
 */
export class ShoppingCart {


    /**
     * When set to true the next call to get the shopping cart will
     * ignore the cache and reload it from the server.
     * @type {boolean}
     */
    static invalidateCache = false;

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
        //console.log('Call to getInstanceAsync()');

        // check for singleton instance first
        if (!ShoppingCart.invalidateCache) {
            if (ShoppingCart.#instance) {
                fnCallback(ShoppingCart.#instance);
                return;
            }
        }

        // attempt a cache read
        let cart  = new ShoppingCart();
        if (ShoppingCart.invalidateCache) {
            ShoppingCart.invalidateCache = false;
        }
        else {
            loaded = cart.readFromCache();
            if (loaded) {
                fnCallback(cart);
                return;
            }
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
     * Scans the rows in the cart and marks any that matches a given itemNo
     * as being marked for deletion.
     * @param itemNo {number} item to be deleted
     * @returns {string|null} the description of the item to be deleted or null if not found
     */
    #markRowForDelete(itemNo) {
        let $cartRows = document.querySelectorAll('.cart-single-list');
        for (let $row of $cartRows) {

            // grab the item number of the row
            let $aList = $row.querySelectorAll('a');
            let $name = $row.querySelector('.product-name a');
            let url = new URL($name.href);
            let itemNumber = parseInt(url.searchParams.get('ItemNo'));

            // if we got a match, check the remove checkbox
            if (itemNumber === itemNo) {
                // toggle the checkbox
                let $toggle = $aList[$aList.length - 1];
                $toggle.click();
                return $name.innerText;
            }
        }

        return null;
    }

    /**
     * Called when the url contains ?remove=id.  Asks the user if they
     * are sure they want to remove the item from their cart before
     * continuing.  If the user is logged it, this parameter is ignored.
     * If it is missing from the cart, it is ignored as well.
     *
     * @param itemNo {number} the item number to remove
     */
    confirmRemove(itemNo) {

        //console.log('ShoppingCart.remove(' + itemNo + ')');

        // read each row on the screen
        let productDesc = this.#markRowForDelete(itemNo);
        if (!productDesc) {
            // row not found to delete, probably already deleted... we can ignore
            console.warn('Could not find item #' + itemNo + ' to delete');
            return;
        }

        // ask user for confirmation and click the update cart button, if we found the button
        let $btnUpdateCart = document.querySelector('.btn-update-cart');
        if ($btnUpdateCart) {
            if (confirm('Are you sure you want to remove item #' + itemNo + ' (' + productDesc + ') from your cart?')) {
                $btnUpdateCart.click();
            }
        } else {
            console.error('Could not find update cart button! (.btn-update-cart)');
        }
    }

    /**
     * Handles the removal of an item from the shopping cart.
     * This involves loading the cart view, checking the delete option,
     * and clicking the update cart button.
     * @param item {CartProductItem}
     */
    remove(item) {

        // go to the cart with a remove parameter to ask the user if they want to remove the item
        let skin = SunsetSkin.getInstance();
        skin.navigateTo('ViewCart.aspx?remove=' + item.itemNo).then(() => {
            //console.log('navigateTo(ViewCart.aspx) completed');
        });
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

        //console.log('loadCartFromServer()');

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
            //console.log({cartDocument: cartDocument})

            // parse and cache
            let parser = new ViewCartParser(cartDocument.body, null);
            cart = parser.readCart();
            //console.log({cart: cart});
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
