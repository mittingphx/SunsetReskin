/**
 * Project: Sunset Wholesale West Website
 * File:    BaseModels.js
 * Author:  Scott Mitting
 * Date:    2024-06-10
 * Abstract:
 *  Base classes for model objects.
 *
 */

/**
 * Interface for any class that represents a product.
 */
export class IProductBase {


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
     * Extra information about the product
     * @type {string}
     */
    description = '';

    /**
     * The link to use for this product
     * @type {string}
     */
    link = '';

    /**
     * The image to use for this product
     * @type {string}
     */
    image = '';

    /**
     * The price of the product per case.
     * @type {string}
     */
    casePrice = '';

    /**
     * The price of the product per unit.
     * @type {string}
     */
    unitPrice = '';
}
