// noinspection JSUnusedGlobalSymbols

import {IProductBase} from "./BaseModels.js";

/**
 * Record class for all data about one product displayed in a category
 * or search view on the website.
 */
export class CategoryProductItem extends IProductBase {
    // extends Classes([IHasPrices, IHasLinkAndImage])

    /**
     * The display text for this product item.  (can have html)
     * @type {string}
     */
    text = '';

    /**
     * The display text for the image for this product. (cannot have html)
     * @type {string}
     */
    altText = '';

    /**
     * The href link for this product.
     * @type {string}
     */
    link = '';

    /**
     * Image to display for this product.
     * @type {string}
     */
    image = '';

    /**
     * Size to display for this product.
     * @type {string}
     */
    size = '';

    /**
     * How many items make up this product.
     * @type {string}
     */
    pack = '';

    /**
     * The unique item number to show for this product.
     * @type {string}
     */
    itemNo = '';

    /**
     * Pallet number for this product.
     * @type {string}
     */
    pallet = '';

    /**
     * Price for this product.
     * @type {string}
     */
    price = '';

    /**
     * Price per case for this product.
     * @type {string}
     */
    casePrice = '';

    /**
     * Price per unit for this product.
     * @type {string}
     */
    unitPrice = '';

    /**
     * Price before discount is applied.
     * @type {string}
     */
    preDiscountPrice = '';

    /**
     * Sale percent to show for this product.
     * @type {string}
     */
    salePercent = '';

    /**
     * True when we should show a new product badge.
     * @type {boolean}
     */
    isNew = false;

    /**
     * Input box on the old page to specify a qty to add.
     * @type HTMLInputElement
     */
    $txtAdd;

    /**
     * Button on the old page to add an item to the cart from a list.
     * @type HTMLInputElement
     */
    $btnAdd;


}
