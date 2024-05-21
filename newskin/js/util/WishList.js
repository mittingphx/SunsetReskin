
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
     * When the product was added to the wish list
     * @type {number}
     */
    timestamp = 0;

    /**
     * Constructor accepts optional set of properties
     * @param props {Object}
     */
    constructor(props) {
        this.text = props.text;
        this.image = props.image;
        if (!props.price && props.casePrice) {
            this.price = props.casePrice;
        }
        else {
            this.price = props.price;
        }
        this.timestamp = props.timestamp;
    }

}

/**
 * Maintains the list of wish list items in localStorage.
 */
export class WishList {

    /**
     * List of items in the wish list.
     * @type {WishListItem[]}
     */
    static wishList = null;

    /**
     * Clears the wish list.
     */
    static clear() {
        WishList.wishList = [];
        WishList.save();
    }

    /**
     * Adds an item to the wish list.
     * @param item {Object}
     */
    static add(item) {
        WishList.load();
        item.timestamp = new Date().getDate();
        WishList.wishList.push(new WishListItem(item));
        WishList.save();
    }

    /**
     * Removes an item from the wish list.
     * @param item {Object}
     */
    static remove(item) {
        WishList.load();
        let index = WishList.indexOf(item);
        if (index > -1) {
            WishList.wishList.splice(index, 1);
        }
        WishList.save();
    }

    /**
     * Returns true iff the item is in the wish list.
     * @param item {Object}
     * @returns {boolean}
     */
    static has(item) {
        return WishList.indexOf(item) > -1;
    }

    /**
     * Returns the index of a given item or -1 if not found
     * @param item {Object}
     * @returns {number}
     */
    static indexOf(item) {
        WishList.load();
        let search = new WishListItem(item);
        for (let i = 0; i < WishList.wishList.length; i++) {
            if (WishList.wishList[i].itemNo === search.itemNo) {
                return i;
            }
        }
        return -1;
    }

    static toggle(item) {
        if (WishList.has(item)) {
            WishList.remove(item);
        }
        else {
            WishList.add(item);
        }
    }

    /**
     * Restores the wish list from localStorage.
     */
    static load() {

        // skip if already loaded
        if (WishList.wishList) {
            return;
        }

        let wishList = localStorage.getItem('wishList');
        wishList = wishList ? JSON.parse(wishList) : [];
        WishList.wishList = [];
        for (let i = 0; i < wishList.length; i++) {
            WishList.wishList.push(new WishListItem(wishList[i]));
        }
    }

    /**
     * Persists the wish list in localStorage.
     */
    static save() {
        let serialized = JSON.stringify(WishList.wishList || []);
        console.log(serialized);
        localStorage.setItem('wishList', serialized);
    }

    /**
     * Returns the number of wish list items.
     * @returns {number}
     */
    static count() {
        this.load();
        return WishList.wishList.length;
    }
}