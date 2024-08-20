import {fixUrl} from "../UrlHelper.js";
import {IProductBase} from "../models/BaseModels.js";

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
     * @param source {Document|HTMLElement}
     * @returns {ProductCategoryBreadcrumb|null}
     */
    static getCategoryBreadcrumbs(source) {

        // grab the category breadcrumbs
        let $categories = source.querySelectorAll('.Categories > a');
        if ($categories.length > 0) {
            let category = new ProductCategoryBreadcrumb();
            category.name = $categories[0].textContent;
            category.link = fixUrl($categories[0].getAttribute('href'));

            for (let i = 1; i < $categories.length; i++) {
                let cat = new ProductCategoryBreadcrumb();
                cat.name = $categories[i].textContent;
                cat.link = fixUrl($categories[i].getAttribute('href'));
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
     * @param propMap {Object<string, string>}
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

        //obj.text = CommonParser.stripWhitespace($a.textContent);

        obj.text = $a.innerHTML;
        obj.altText = CommonParser.stripWhitespace($a.textContent);
        CommonParser.separateProductTextAndDescription(obj);


        //obj.link = $a.href; //.getAttribute('href');
        //obj.link = UrlHelper.makeRelativeUrl($a.href);
        obj.link = fixUrl($a.href);
        obj.image = CommonParser.getImageFromStyle($a.querySelector('.divImage'));
        return true;
    }

    /**
     * Looks for a <br> in the text property of the given item and separates out
     * the rest into the description property.
     * @param item {object}
     */
    static separateProductTextAndDescription(item) {
        if (item.text) {
            let text = item.text;
            const divider = '<br>';
            let firstLineEnd = text.indexOf(divider);
            if (firstLineEnd > 0) {
                item.text = text.substring(0, firstLineEnd);
                item.description = text.substring(firstLineEnd + divider.length);
            }
        }
    }


    /**
     * @typedef {Object} SpanMapItem
     * One item in a SpanMap
     * @property {string} field - The name of the field to assign in an object
     * @property {string} type - The type of the field within a <span>
     */

    /**
     * @typedef {Object.<string, SpanMapItem>} SpanMap
     * Maps the DOM id of a field to an item describing the field within an
     * object to map the value to, and what type of data is expected within
     * the <span>.
     */

    /**
     * Maps the content of all <span> elements within a given parent element using a mapping object.
     *
     * @param {object} obj - The object to map the content of the <span> elements to.
     * @param {HTMLElement} $parent - The parent element containing the <span> elements to be mapped.
     * @param {SpanMap} spanMap - The mapping object used to map the content of the <span> elements.
     * @return {void}
     */
    static mapSpanContent(obj, $parent, spanMap) {

        // find each <span> in the parent
        let $spans = $parent.querySelectorAll('span');
        for (let i = 0; i < $spans.length; i++) {

            // determine if this span corresponds to a property
            let key = $spans[i].getAttribute('id');
            if (!key) continue;

            // grab details by span id if defined in the map
            if (key in spanMap) {
                let map = spanMap[key];
                if (map.type === 'text') {
                    obj[map.field] = $spans[i].textContent;
                }
                else if (map.type === 'number') {
                    obj[map.field] = parseFloat($spans[i].textContent);
                }
                else if (map.type === 'html') {
                    obj[map.field] = $spans[i].innerHTML;
                }
            }
        }
    }
}
