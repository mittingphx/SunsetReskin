import {WishListItem} from "./WishListItem.js";
import {WishListBuilder} from "../builders/WishListBuilder.js";

/**
 * Class that manages the wish list within the browser's localStorage.
 */
export class WishListData {

    /**
     * List of items in the wish list.
     * @type {WishListItem[]}
     */
    wishList = null;


    /**
     * Clears the wish list.
     */
    clear() {
        this.wishList = [];
        this.save();
    }

    /**
     * Adds an item to the wish list.
     * @param item {Object}
     */
    add(item) {
        this.load();
        item.timestamp = new Date().getDate();
        this.wishList.push(new WishListItem(item));
        this.save();
    }

    /**
     * Removes an item from the wish list.
     * @param item {Object}
     */
    remove(item) {
        this.load();
        let index = this.indexOf(item);
        if (index > -1) {
            this.wishList.splice(index, 1);
        }
        this.save();
    }

    /**
     * Returns true iff the item is in the wish list.
     * @param item {Object}
     * @returns {boolean}
     */
    has(item) {
        return this.indexOf(item) > -1;
    }

    /**
     * Returns the index of a given item or -1 if not found
     * @param item {Object}
     * @returns {number}
     */
    indexOf(item) {
        this.load();
        let search = new WishListItem(item);
        for (let i = 0; i < this.wishList.length; i++) {
            if (this.wishList[i].text === search.text) {
                return i;
            }
        }
        return -1;
    }

    toggle(item) {
        if (this.has(item)) {
            this.remove(item);
        }
        else {
            this.add(item);
        }
    }

    /**
     * Restores the wish list from localStorage.
     */
    load() {

        // skip if already loaded
        if (this.wishList) {
            return;
        }

        let wishList = localStorage.getItem('wishList');
        wishList = wishList ? JSON.parse(wishList) : [];
        this.wishList = [];
        for (let i = 0; i < wishList.length; i++) {
            this.wishList.push(new WishListItem(wishList[i]));
        }
    }

    /**
     * Persists the wish list in localStorage.
     */
    save() {
        let serialized = JSON.stringify(this.wishList || []);
        console.log(serialized);
        localStorage.setItem('wishList', serialized);
    }

    /**
     * Returns the number of wish list items.
     * @returns {number}
     */
    count() {
        this.load();
        return this.wishList.length;
    }


    /**
     * Rebuilds the wish list view whenever the list changes.
     */
    rebuild() {
        let $wishList = new WishListBuilder().build();
        if (!$wishList) {
            console.error('could not generate wish list');
            return;
        }

        let $insertion = document.querySelector('.ddl-wishlist');
        if (!$insertion) {
            console.error('could not find insertion point! (.ddl-wishlist)');
            return;
        }
        $insertion.replaceWith($wishList);
    }

}