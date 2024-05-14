/**
 * Project: Sunset Wholesale West Website
 * File:    FrontPageSpecialsParser.js
 * Author:  Scott Mitting
 * Date:    2024-05-13
 * Abstract:
 *  P 3arsing the items displayed as specials on the bottom of the front
 *  page of the website.
 */


/**
 * Record class for all data about one product displayed in the specials
 * section on the front page of the website.
 */
export class SpecialProductItem {

    /**
     * The display text for this product item.
     * @type {string}
     */
    text = '';

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
}

/**
 *  Record class for all data about one section of specials.
 */
export class SpecialSectionItem {
    /**
     * The name of the section
     * @type {string}
     */
    name = '';

    /**
     *  The href link for this group of products.
     * @type {string}
     */
    link = '';

    /**
     * Products belonging to this section
     * @type {SpecialProductItem[]}
     */
    products = [];
}

/**
 * Helper function for parsing specials
 */
class ParseHelper {

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
        return ParseHelper.stripQuotes(image);
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
}

/**
 * Helper class for parsing specials on the front page.
 */
export class FrontPageSpecialsParser {

    /**
     * Creates a new FrontPageSpecialsParser
     */
    constructor() {

    }

    /**
     * Reads all the nodes within the given table.
     * @param $table
     * @returns {SpecialSectionItem[]}
     */
    readNodesFromTable($table) {
        let sections = [];

        let currentSection = null;
        let $nodes = $table.querySelectorAll('td');

        for (let i = 0; i < $nodes.length; i++) {
            let $node = $nodes[i];
            let nodeType = this.getNodeType($node);
            if (nodeType === '') continue;

            if (nodeType === 'header') {
                // keep track of which section we're in
                currentSection = this.readFromHeaderNode($node);
                sections.push(currentSection)
                continue;
            }
            else if (nodeType === 'arrow') {
                // TODO: get link to request paging through specials
                /*
                <td class="arrow" rowspan="2"><input type="image" name="ctl00$MainContent$imgPrevItemsonSpecial" id="MainContent_imgPrevItemsonSpecial" disabled="disabled" class="aspNetDisabled" src="Images/previousArrowDisabled.png"></td>
                 */
                continue;
            }
            else if (nodeType === 'product') {
                if (currentSection == null) {
                    console.warn('Found product node without header: ' + $node.outerHTML);
                    continue;
                }

                let product = this.readFromDataNode($node);
                currentSection.products.push(product);
            }
            else if (nodeType === 'qty') {
                // TODO: tie this to the product by item number
                /*
                <td class="CenterQty"><span id="MainContent_LblQtyPopularItems...2918">Qty:</span><input name="ctl00$MainContent$txtQtyPopularItems...2918" type="text" maxlength="4" id="MainContent_txtQtyPopularItems...2918" style="width:30px;"><input type="submit" name="ctl00$MainContent$btnPopularItems...2918" value="Buy" id="MainContent_btnPopularItems...2918" class="ButtonBuy"></td>
                 */
            }
        }
        return sections;
    }

    /**
     * Returns the type of node this is within the specials area.
     * @param $node {HTMLElement}
     * @returns {string} type of node
     */
    getNodeType($node) {
        if ($node.classList.contains('Header')) return 'header';
        if ($node.classList.contains('Center')) return 'product';
        if ($node.classList.contains('CenterQty')) return 'qty';
        if ($node.classList.contains('arrow')) return 'arrow';

        console.warn('Unexpected node type: ' + $node.classList.toString());
        return '';
    }

    /**
     * Reads the data for one special from an HTML element.
     * @param $node {HTMLElement} DOM element to read from
     * @returns {SpecialProductItem|null} returns true iff the special was read successfully.
     */
    readFromDataNode($node) {

        let ret = new SpecialProductItem();

        // a <td> is expected for the special
        if (!$node.matches('td')) {
            console.warn('Attempted to read special from non-special node: ' + $node.outerHTML);
            return null;
        }

        // parse link and image
        let $a = $node.querySelector('a');
        if ($a) {
            ret.text = ParseHelper.stripWhitespace($a.textContent);
            ret.link = $a.getAttribute('href');
            ret.image = ParseHelper.getImageFromStyle($a.querySelector('.divImage'));
        }
        else {
            console.warn('No <a> found for special: ' + $node.outerHTML);
            return null;
        }

        // map text labels to object properties
        let propMap = {
            'Item No': 'itemNo',
            'Price': 'price',
            'Case Price': 'casePrice',
            'Pallet': 'pallet',
            'Size': 'size',
            'Pack': 'pack'
        }

        // parse text below link and image
        let spans = ParseHelper.getSpanProductData($node);
        for (let key in spans) {
            let readKey = key;
            let writeKey = key;
            if (readKey in propMap) writeKey = propMap[readKey];

            if (ret.hasOwnProperty(writeKey) === false) {
                console.warn('Unexpected key in special: ' + writeKey);
                continue;
            }
            ret[writeKey] = spans[readKey];
        }

        // make sure we have certain fields
        if (!ret.itemNo) {
            console.warn('No item number for special: ' + $node.outerHTML);
        }
        if (!ret.link) {
            console.warn('No link for special: ' + $node.outerHTML);
        }

        return ret;
    }

    /**
     *  Reads the name and link of the section from a header node
     * @param $node
     * @returns {null}
     */
    readFromHeaderNode($node) {

        // a <td> is expected for the special
        if (!$node.matches('td')) {
            console.warn('Attempted to read header from non-header node: ' + $node.outerHTML);
            return null;
        }

        let ret = new SpecialSectionItem()
        let $a = $node.querySelector('a');
        if ($a) {
            ret.name = ParseHelper.stripWhitespace($a.textContent);
            ret.link = $a.getAttribute('href');
        }
        else {
            console.warn('No <a> found for header: ' + $node.outerHTML);
            return null;
        }

        return ret;
    }

}