import {Format} from "../util/Format.js";

/**
 * An item stored in the wish list data.
 */
export class WishListItem {

    /**
     * Product name
     * @type {string}
     */
    text = '';

    /**
     * The unique identifier of the product
     * @type {string}
     */
    itemNo = '';

    /**
     * Product image
     * @type {string}
     */
    image = '';

    /**
     * Price of the product
     * @type {number}
     */
    price = 0;

    /**
     * Whether the product has a price, set to false if price is 'Login to View'
     * @type {boolean}
     */
    hasPrice = true;

    /**
     * When the product was added to the wish list
     * @type {number}
     */
    timestamp = 0;

    /**
     * Constructor accepts optional set of properties
     * @param props {Object}
     */
    constructor(props) {
        this.itemNo = props.itemNo;
        this.text = props.text;
        this.image = props.image;

        let price;
        if (props.casePrice) {
            price = props.casePrice;
        }
        else if (props.unitPrice) {
            price = props.unitPrice;
        }
        else {
            price = props.price;
        }

        if (price === 'Login to View' || props.price === 'Login to View' || props.priceString === 'Login to View') {
            this.price = 0;
            this.hasPrice = false;
        }
        else {
            this.price = price;
            this.hasPrice = true;
        }

        this.timestamp = props.timestamp;
    }

    /**
     * Returns the link to the item detail page.
     * @returns {string}
     */
    get link() {
        return 'ItemDetail.aspx?ItemNo=' + this.itemNo + '&ReturnURL=ViewCart.aspx';
    }

    /**
     * Returns the price of the item with formatting, including leading $
     * @returns {string}
     */
    getPrice() {
        return Format.formatPrice(this.price);
    }

}
