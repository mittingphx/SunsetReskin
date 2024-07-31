// noinspection JSUnusedGlobalSymbols

/**
 * Project: Sunset Wholesale West Website
 * File:    ProductDetailParser.js
 * Author:  Scott Mitting
 * Date:    2024-05-14
 * Abstract:
 *  Classes for reading product detail data from the old website.
 */

import {UrlHelper} from "../UrlHelper.js";
import {CommonParser} from "./CommonParser.js";
import {Format} from "../util/Format.js";
import {SunsetSkin} from "../SunsetSkin.js";

/**
 * Model class for parsed product detail data.
 */
export class ProductDetailItem {

    /**
     * The display text for this product item.
     * @type {string}
     */
    text = '';

    /**
     * Text description for this product (not currently used).
     * @type {string}
     */
    description = '';

    /**
     * Image to display for this product.
     * @type {string}
     */
    image = '';

    /**
     * Alternate images for the product.
     * @type {[string]}
     */
    images = [];

    /**
     * The list of thumbnail images for this product, at the same
     * index as the full-sized picture in this.images[]
     * @type {[string]}
     */
    thumbs = [];

    /**
     * Category this product belongs to.  The breadcrumbs can be
     * recreated by walking up the parent categories.
     * @type {ProductCategoryBreadcrumb|null}
     */
    category = null;

    /**
     * Features of this product (not currently used).
     *
     * @type {[string]}
     */
    features = [];

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
     * Price pulled from old page before processing.
     * @type {string}
     */
    priceString = '';

    /**
     * Price per unit for this product.
     * @type {number}
     */
    unitPrice = 0;

    /**
     * Price per case for this product.
     * @type {number}
     */
    casePrice = 0;

    /**
     * Price before discount is applied.
     * @type {string}
     */
    preDiscountPrice = '';

    /**
     * Shipping options (not currently used)
     * @type {[]}
     */
    shippingOptions = [];

    /**
     * Options for the product like color or size (not currently used)
     * @type {[]}
     */
    options = [];


    /**
     * Reference to the button to add this item to the shopping cart.
     * @type {HTMLInputElement|null}
     */
    $btnAddToCart = null;


    /**
     * Gets the price of the item per case with formatting, including leading $
     * @returns {string}
     */
    getCasePrice() {
        return Format.formatPrice(this.casePrice) + ' per case';
    }

    /**
     * Gets the price of the item per unit with formatting, including leading $
     * @returns {string}
     */
    getUnitPrice() {
        return Format.formatPrice(this.unitPrice) + ' per unit';
    }

}


/**
 * Parses product details from the product detail page.
 */
export class ProductDetailParser {

    /**
     * The HTML document to load the product data from.
     * @type {Document|null}
     */
    sourceDocument = null;

    /**
     * Constructor defaults source document to the current document.
     * @param source {Document|HTMLElement|null}
     */
    constructor(source) {
        this.sourceDocument = source || document;
    }


    /**
     * Loads a product detail from the source document, assuming it is
     * the product details page.
     * @returns {ProductDetailItem|null}
     */
    readProductDetail() {

        let ret = new ProductDetailItem();

        // grab the parent
        const $table = this.sourceDocument.querySelector('#MainContent_Table1')
        if (!$table) {
            console.error('could not find product detail using selector: #MainContent_Table1');
            return null;
        }

        // grab the image
        let $img = $table.querySelector('.ImgItemDetail');
        if ($img) {
            ret.image = $img.getAttribute('src');
        }
        else {
            console.error('could not find image using selector: .ImgItemDetail');
        }

        // grab alternate thumbnails
        let $tableThumbnails = $table.querySelector('#MainContent_TableImages');
        if ($tableThumbnails) {
            let $thumbs = $tableThumbnails.querySelectorAll('input[type="image"]');
            if ($thumbs.length > 0) {
                ret.images = [ ret.image ];
            }

            for (let i = 0; i < $thumbs.length; i++) {
                let src = $thumbs[i].getAttribute('src');
                if (!src) continue;

                // convert to full size image filename
                // example: Images/SunsetItems/397/1thn.jpg
                src = UrlHelper.toFullSize(src)
                ret.images.push(src);
            }

            // convert to thumb filenames
            ret.thumbs = [];
            for (let i = 0; i < ret.images.length; i++) {
                ret.thumbs.push(UrlHelper.toThumbNail(ret.images[i]));
            }

            //console.log({image:ret.image, images:ret.images, thumbs:ret.thumbs});
        }

        // detect that we're viewing an 'item added to cart' message on the old skin
        let $btnKeepShopping = $table.querySelector('#MainContent_BtnKeepShopping');
        if ($btnKeepShopping) {

            // start reloading the cart dropdown
            try {
                const skin = SunsetSkin.getInstance();
                if (skin && skin.loginController) {
                    skin.loginController.updateLoginStatus();
                } else {
                    console.warn('could not find login controller to force cart dropdown to reload');
                }
            }
            catch (e) {
                console.error('error refreshing cart', e);
            }

            // we need to display the last copy of this product when this happens.
            alert('Item added to cart');

            // we need to press the button to keep shopping
            $btnKeepShopping.click();
            return null;
        }

        // grab the detail properties
        let $detail = $table.querySelector('#MainContent_PanelQty');
        if ($detail) {
            this.#readDetailProperties(ret, $detail);
            this.#extractPrices(ret);
        }
        else {
            console.error('could not find detail properties using selector: #MainContent_PanelQty');
        }

        // grab the add to cart button
        ret.$btnAddToCart = $table.querySelector('#MainContent_BtnAddToCart');

        // grab the category breadcrumbs
        ret.category = CommonParser.getCategoryBreadcrumbs(this.sourceDocument);

        return ret;
    }

    /**
     * Reads the detail properties from #MainContent_PanelQty
     * @param item {ProductDetailItem} object to receive the properties
     * @param $detail {HTMLDivElement} the panel to read the properties from
     */
    #readDetailProperties(item, $detail) {

        // span labels that map to properties
        const propMap = {
            'ItemDesc': 'text',
            'Size': 'size',
            'Pack': 'pack',
            'ItemNo': 'itemNo',
            'UPC': 'upc',
            'Palette': 'pallet',
            'Price': 'priceString'
        };

        // check each span within the details area
        let $spans = $detail.querySelectorAll('span');
        for (let i = 0; i < $spans.length; i++) {

            // determine if this span corresponds to a property
            let key = $spans[i].getAttribute('id');
            if (!key || !key.toLowerCase().startsWith('MainContent_Lbl'.toLowerCase())) {
                continue;
            }

            // grab details by span id
            key = key.substring('MainContent_Lbl'.length);
            if (key in propMap) {
                item[propMap[key]] = $spans[i].textContent;
            }
        }
    }

    /**
     * Updates the price properties by parsing the priceString property.
     * @param item {ProductDetailItem}
     */
    #extractPrices(item) {
        if (item.priceString) {
            let hasPerCase = item.priceString.indexOf('per case') !== -1;
            let hasPerUnit = item.priceString.indexOf('per unit') !== -1;

            if (hasPerCase) {
                let end = item.priceString.indexOf('per case');
                let strPrice = item.priceString.substring(0, end);
                item.casePrice = Format.parsePrice(strPrice);
            } else {
                item.casePrice = 0;
            }

            if (hasPerUnit) {
                let start = item.priceString.indexOf('[') + 1;
                let end = item.priceString.indexOf(']');
                let strPrice = item.priceString.substring(start, end);
                item.unitPrice = Format.parsePrice(strPrice);
            } else {
                item.unitPrice = 0;
            }
        }
    }
}
