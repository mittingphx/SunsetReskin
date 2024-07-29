/**
 * Project: Sunset Wholesale West Website
 * File:    FrontPageSpecialsParser.js
 * Author:  Scott Mitting
 * Date:    2024-05-13
 * Abstract:
 *  Parsing the items displayed as specials on the bottom of the front
 *  page of the website.
 */


import {CommonParser} from "./CommonParser.js";
import {SpecialProductItem} from "../models/SpecialProductItem.js";
import {SpecialSectionItem} from "../models/SpecialSectionItem.js";

/**
 * Helper class for parsing specials on the front page.
 */
export class FrontPageSpecialsParser {

    /**
     * The current product section of the front page being parsed.
     * @type {SpecialSectionItem|null}
     */
    currentSection = null;

    /**
     * Creates a new FrontPageSpecialsParser
     */
    constructor() {

    }

    /**
     * Reads all the nodes within the given table.
     * @param $table {HTMLTableElement}
     * @returns {SpecialSectionItem[]}
     */
    readNodesFromTable($table) {
        let sections = [];

        this.currentSection = null;
        let $nodes = $table.querySelectorAll('td');

        for (let i = 0; i < $nodes.length; i++) {
            let $node = $nodes[i];
            let nodeType = this.getNodeType($node);
            if (nodeType === '') continue;

            if (nodeType === 'header') {
                // keep track of which section we're in
                this.currentSection = this.readFromHeaderNode($node);
                sections.push(this.currentSection)
                //continue;
            }
            else if (nodeType === 'arrow') {
                // TODO: get link to request paging through specials
                /*
                <td class="arrow" rowspan="2"><input type="image" name="ctl00$MainContent$imgPrevItemsonSpecial" id="MainContent_imgPrevItemsonSpecial" disabled="disabled" class="aspNetDisabled" src="Images/previousArrowDisabled.png"></td>
                 */
                //continue;
            }
            else if (nodeType === 'product') {
                if (this.currentSection == null) {
                    console.warn('Found product node without header: ' + $node.outerHTML);
                    continue;
                }

                let product = this.readFromDataNode($node);
                this.currentSection.products.push(product);
            }
            else if (nodeType === 'qty') {
                // Note: this is where you would implement the QTY input
                // box if we decided to add it to the new skin
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
        if (!CommonParser.getProductImageAndLinkFromNode($node, ret))
        {
            console.warn('No <a> found for special: ' + $node.outerHTML);
            return null;
        }


        // product is new if it's in the new products section
        if (this.currentSection && this.currentSection.name === 'New Products') ret.isNew = true;


        // parse text labels below image and link using this map
        // from text label to object properties
        let propMap = {
            'Item No': 'itemNo',
            'Price': 'price',
            'Case Price': 'casePrice',
            'Pallet': 'pallet',
            'Size': 'size',
            'Pack': 'pack'
        }
        CommonParser.applySpanProductData($node, ret, propMap);

        // parse out certain hybrid fields further
        CommonParser.splitUnitPriceFromCasePrice(ret);

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
            ret.name = CommonParser.stripWhitespace($a.textContent);
            ret.link = $a.getAttribute('href');
        }
        else {
            console.warn('No <a> found for header: ' + $node.outerHTML);
            return null;
        }

        return ret;
    }

}