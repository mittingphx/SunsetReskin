
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
