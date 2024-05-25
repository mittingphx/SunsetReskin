/**
 * The contents of the customer's shopping cart.
 */
export class ShoppingCart {

    /**
     * The items in the shopping cart.
     * @type {CartProductItem[]}
     */
    items = [];

    /**
     * The submit button in the shopping cart.
     * @type {HTMLInputElement}
     */
    $btnSubmit = null;

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
    }

    /**
     * Sets the DOM elements from the shopping cart in the old page
     * and presses submit button.
     *
     * TODO: need to handle the response elegantly somehow
     */
    updateAndSave() {
        for (let item of this.items) {
            item.$qty.value = item.quantity.toString();
            item.$removeCheckbox.checked = item.markedForDeletion;
        }
        this.$btnSubmit.click();
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
        let $table = this.source.querySelector('.ViewCart');
        if (!$table) {
            console.error('could not find table using selector: .ViewCart');
            return null;
        }

        let cart = new ShoppingCart()
        cart.items = this.readCartProducts($table);
        cart.$btnSubmit = $table.querySelector('input[type="submit"]');
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