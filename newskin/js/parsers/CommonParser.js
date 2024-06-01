import {UrlHelper} from "../UrlHelper";


/**
 * Interface for any class that represents a product.
 */
export class IProductBase {

    /**
     * The text to display for this product
     * @type {string}
     */
    text = '';

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

/**
 * Represents the category a product belongs to, with a reference to
 * its parents to maintain a hierarchy.
 */
export class ProductCategoryBreadcrumb {

    /**
     * The text to display for this category
     * @type {string}
     */
    name = '';

    /**
     * The link to use for this category
     * @type {string}
     */
    link = '';

    /**
     * The parent of this category
     * @type {ProductCategoryBreadcrumb|null}
     */
    parent = null;

    /**
     * Returns each of the parents of this breadcrumb in order from
     * the top level menus to the specific item.
     *
     * @returns {ProductCategoryBreadcrumb[]}
     */
    getParentHierarchy() {
        let parents = [];
        let item = this
        while (item.parent != null) {
            parents.push(item);
            item = item.parent;
        }
        parents = parents.reverse();
        return parents;
    }
}


/**
 * Shared helper methods for parsing.
 */
export class CommonParser {

    /**
     * Removes the quotes from the start and end of a string.
     * @param s {string}
     * @returns {string}
     */
    static stripQuotes(s) {
        if (s[0] === '"' && s[s.length - 1] === '"'){
            return s.substring(1, s.length - 1);
        }
        if (s[0] === "'" && s[s.length - 1] === "'"){
            return s.substring(1, s.length - 1);
        }
        return s;
    }

    /**
     * Returns the image URL from the style attribute of the given node.
     * @param node {HTMLElement}
     * @returns {string}
     */
    static getImageFromStyle(node) {
        let style = node.getAttribute('style');
        let startIndex = style.indexOf('url(');
        let endIndex = style.indexOf(')');
        if (startIndex === -1 || endIndex === -1) return '';
        let image = style.substring(startIndex + 4, endIndex);
        return CommonParser.stripQuotes(image);
    }


    /**
     * Extracts the product data from the given node.
     * @param node {HTMLElement}
     * @returns {{string:string}}
     */
    static getSpanProductData(node) {
        let ret = {};
        let $spans = node.querySelectorAll('.TextSmallDark');
        for (let i = 0; i < $spans.length; i++) {
            let text = $spans[i].textContent;
            let splitIndex = text.indexOf(':');
            if (splitIndex === -1) continue;
            let key = text.substring(0, splitIndex).trim();
            ret[key] = text.substring(splitIndex + 1).trim();
        }
        return ret;
    }

    /**
     * Removes all whitespace from the front and back of the given text,
     * including new lines.
     * @param text
     * @returns {string}
     */
    static stripWhitespace(text) {
        // replace new lines with spaces
        text = text.replace(/\n/g, ' ');

        // replace double spaces with single spaces
        text = text.replace(/  +/g, ' ');

        // strip leading and trailing whitespace
        text = text.trim();

        return text;
    }

    /**
     * Extracts the category breadcrumbs from the given document.
     * @param source {Document}
     * @returns {ProductCategoryBreadcrumb|null}
     */
    static getCategoryBreadcrumbs(source) {

        // grab the category breadcrumbs
        let $categories = source.querySelectorAll('.Categories > a');
        if ($categories.length > 0) {
            let category = new ProductCategoryBreadcrumb();
            category.name = $categories[0].textContent;
            category.link = $categories[0].getAttribute('href');

            for (let i = 1; i < $categories.length; i++) {
                let cat = new ProductCategoryBreadcrumb();
                cat.name = $categories[i].textContent;
                cat.link = $categories[i].getAttribute('href');
                cat.parent = category;
                category = cat;
            }
            return category
        }

        return null;
    }

    /**
     * Takes the data read by getSpanProductData() and assigns the
     * values to properties of the given object, using the propMap
     * hash to map the text labels to object properties.
     * @param $node {HTMLElement}
     * @param obj {*} reference to the object to update
     * @param propMap {*}
     */
    static applySpanProductData($node, obj, propMap) {

        let spans = CommonParser.getSpanProductData($node);
        for (let key in spans) {
            let readKey = key;
            let writeKey = key;
            if (readKey in propMap) writeKey = propMap[readKey];

            if (obj.hasOwnProperty(writeKey) === false) {
                console.warn('Unexpected key in propMap: ' + writeKey);
                continue;
            }
            obj[writeKey] = spans[readKey];
        }
    }

    /**
     * Takes an object with casePrice and unitPrice properties
     * and splits out the values from casePrice, which are combined
     * in the website data.
     * @param obj {IProductBase} object to update
     */
    static splitUnitPriceFromCasePrice(obj) {

        if (obj.casePrice && obj.casePrice.indexOf('per unit') !== -1) {
            let start = obj.casePrice.indexOf('[') + 1;
            let end = obj.casePrice.indexOf(']');
            obj.unitPrice = obj.casePrice.substring(start, end);
            obj.casePrice = obj.casePrice.substring(0, start - 1);
        }
    }

    /**
     * Gets the product's image and link from the first <a> tag
     * found in the given node, which gets assigned to the
     * IHasLinkAndImage interface.
     * @param $node {HTMLElement} node to search for a link within
     * @param obj {IProductBase} object to update
     * @returns {boolean} true iff the properties were assigned
     */
    static getProductImageAndLinkFromNode($node, obj) {
        let $a = $node.querySelector('a');
        if (!$a) return false;
        obj.text = CommonParser.stripWhitespace($a.textContent);
        //obj.link = $a.href; //.getAttribute('href');
        obj.link = UrlHelper.makeRelativeUrl($a.href);
        obj.image = CommonParser.getImageFromStyle($a.querySelector('.divImage'));
        return true;
    }
}
