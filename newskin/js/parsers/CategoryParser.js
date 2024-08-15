import {CommonParser} from "./CommonParser.js";
import {ProductCategoryItem} from "../models/ProductCategoryItem.js";
import {CategoryProductItem} from "../models/CategoryProductItem.js";
import {PageControls, PageControlLink} from "../models/PageControls.js";
import {AspNetPostback} from "../util/AspNetPostback.js";
import {ProgressBar} from "../util/ProgressBar.js";

/**
 * Parses the category and search products views.
 */
export class CategoryParser {

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
     * Reads all the nodes within the given <table>.
     * @param $table {HTMLTableElement}
     * @returns {ProductCategoryItem}
     */
    readNodesFromTable($table) {

        // make sure the items per page is set to its maximum value
        this.#initItemsPerPage();

        // grab category hierarchy which contains the name
        let ret = new ProductCategoryItem()
        ret.breadcrumbs = CommonParser.getCategoryBreadcrumbs(this.sourceDocument)
        ret.name = ret.breadcrumbs ? ret.breadcrumbs.name : '';

        let $nodes = $table.querySelectorAll('td');

        for (let i = 0; i < $nodes.length; i++) {
            let $node = $nodes[i];
            let nodeType = this.#getNodeType($node);
            if (nodeType === '') continue;

            if (nodeType === 'product') {
                let product = this.#readFromDataNode($node);
                ret.items.push(product);

                // grab the cell in the next row and make sure it's qty
                let $qtyNode = CategoryParser.findCellOnNextRow($node);
                if (!$qtyNode) {
                    console.warn('could not find qty cell for product node', $node);
                    continue;
                }
                if (this.#getNodeType($qtyNode) !== 'qty') {
                    console.warn('skipping qty cell of wrong type');
                    continue;
                }

                // grab the mini-form within it
                CategoryParser.readProductAddToCartForm($qtyNode, product);
            }
        }

        return ret;
    }

    /**
     * Fills the product.$txtAdd and product.$btnAdd fields from the
     * inputs within a given node.
     * @param $node {HTMLTableCellElement} cell with form elements to find
     * @param product {CategoryProductItem|SpecialProductItem}
     */
    static readProductAddToCartForm($node, product) {

        // grab the mini-form within it
        const $qtyInputs = $node.querySelectorAll('input');
        for (let j = 0; j < $qtyInputs.length; j++) {
            let type = $qtyInputs[j].type;
            if (type === 'text') {
                product.$txtAdd = $qtyInputs[j];
            }
            else if (type === 'submit') {
                product.$btnAdd = $qtyInputs[j];
            }
        }

        // check that we found the fields in the old page
        if (!product.$txtAdd) {
            console.warn('could not find add to cart text box', $node);
        }
        if (!product.$btnAdd) {
            console.warn('could not find add to cart button', $node);
        }
    }

    /**
     * @typedef {Object} FindCellOptions
     * @property {string} thisRowClass class name on the current row to count toward cell index
     * @property {string} nextRowClass class name on the next row to count toward cell index.
     *
     * This is needed because in some situations there are extra cells at the start and end of
     * each row that aren't in the rows we want to search in.
     */

    /**
     * Returns the <td> directly underneath a given <td> in a table.
     * @param $td {HTMLTableCellElement}
     * @param options {FindCellOptions|null} optional settings for finding the cell
     * @return {HTMLTableCellElement|null} the cell or null if not found
     */
    static findCellOnNextRow($td, options = null) {

        // default options
        options = options || {
            thisRowClass: null,
            nextRowClass: null
        };

        // get parent row
        const $tr = $td.parentElement;
        if (!$tr || $tr.tagName !== 'TR') {
            console.warn('Parent of TD was expected to be a TR', $td, $tr);
            return null;
        }

        // determine cell index
        let cellIndex;
        if (options.thisRowClass) {
            // if using a class name manually count the cell index
            cellIndex = 0;
            for (let i = 0; i < $tr.children.length; i++) {
                let $siblingTD = $tr.children[i];
                if ($siblingTD === $td) {
                    break;
                }
                if ($siblingTD.classList.contains(options.thisRowClass)) {
                    cellIndex++;
                }
            }
        }
        else {
            // otherwise, use the cellIndex of the current cell
            cellIndex = $td.cellIndex;
        }

        // grab the next row
        const $nextRow = $tr.nextElementSibling;
        if (!$nextRow || $nextRow.tagName !== 'TR') {
            console.warn('Next sibling of TR was expected to a TR', $tr, $nextRow);
            return null;
        }

        // find the cell in the next row with the same cellIndex
        let nextRowCellIndex = 0;
        for (let i = 0; i < $nextRow.children.length; i++) {
            let $nextRowTD = $nextRow.children[i];

            // skip if class doesn't match (if specified)
            if (options.nextRowClass) {
                if (!$nextRowTD.classList.contains(options.nextRowClass)) {
                    continue;
                }
            }

            // return if we found the cell
            if (nextRowCellIndex === cellIndex) {
                return $nextRowTD;
            }

            // otherwise increment cell index
            nextRowCellIndex++;
        }

        // we didn't find the cell
        console.warn('Could not find a cell in the next row with cellIndex=' + cellIndex);
        return null;
    }

    /**
     * Reads the paging controls from the source document.
     * @returns {PageControls}
     */
    readPageControls() {

        let $parent = this.sourceDocument.querySelector('#MainContent_PanelPages');
        if (!$parent) {
            console.error('could not find paging controls using selector: #MainContent_PanelPages');
            return null;
        }
        let $links = $parent.querySelectorAll('a')

        let pageControls = new PageControls();
        for (let i = 0; i < $links.length; i++) {
            let page = new PageControlLink($links[i]);
            if (page.type === 'prev') {
                pageControls.prevLink = page;
            }
            else if (page.type === 'next') {
                pageControls.nextLink = page;
            }
            else if (page.type === 'current') {
                pageControls.currentLink = page;
            }
            pageControls.pages.push(page);
        }

        return pageControls;
    }


    /**
     * Returns the type of data within this node
     * @param $node
     * @returns {null|string}
     */
    #getNodeType($node) {
        if ($node.classList.contains('Item')) return 'product';
        if ($node.classList.contains('Qty')) return 'qty';
        return null;
    }

    /**
     * Reads the data for one protect from an HTML element.
     * @param $node {HTMLElement} DOM element to read from
     * @returns {CategoryProductItem} the product data read
     */
    #readFromDataNode($node) {

        let ret = new CategoryProductItem();

        // a <td> is expected for the special
        if (!$node.matches('td')) {
            console.warn('Attempted to read product item from non-product node: ' + $node.outerHTML);
            return null;
        }

        // parse link and image
        if (!CommonParser.getProductImageAndLinkFromNode($node, ret))
        {
            console.warn('No <a> found for product: ' + $node.outerHTML);
            return null;
        }

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
            console.warn('No item number for product: ' + $node.outerHTML);
        }
        if (!ret.link) {
            console.warn('No link for product: ' + $node.outerHTML);
        }

        return ret;

    }

    /**
     * Sets up handlers for the items per page dropdown to match the
     * settings from the old page and to trigger a post-back if the
     * user changes the value.
     */
    #initItemsPerPage() {

        // get the current page size of the old page
        const $ddlPerPage = this.sourceDocument.querySelector('#MainContent_DropPerPage');
        let itemsPerPage = null;
        if ($ddlPerPage) {
            itemsPerPage = Number($ddlPerPage.value);
        }

        // set the value on the visible page
        const $itemsPerPage = document.querySelector('#itemsPerPage');
        $itemsPerPage.value = itemsPerPage;

        // create event to trigger a postback when the value changes
        $itemsPerPage.addEventListener('change', CategoryParser.onItemsPerPageChanged);

        // check if user has a saved default items per page in local storage.  otherwise use 108.
        const savedItemsPerPageString = localStorage.getItem('itemsPerPage');
        let savedItemsPerPage;
        if (savedItemsPerPageString !== null) {
            savedItemsPerPage = Number(savedItemsPerPageString);
        }
        else {
            savedItemsPerPage = 108;
        }

        // change the value of the dropdown if needed to match
        if (savedItemsPerPage !== itemsPerPage) {
            CategoryParser.onItemsPerPageChanged(null, savedItemsPerPage);
        }
    }

    /**
     * Called when the dropdown for items per page changes, or can be called directly
     * with the new number to set (but it must match a value within the dropdown).
     * @param event {Event|null} the change event
     * @param itemsPerPage {number|null} the optional value to force the value to (only valid when event is null)
     */
    static onItemsPerPageChanged(event, itemsPerPage = null) {

        // check input
        if (!event) {
            if (!itemsPerPage) {
                console.error('onItemsPerPageChanged called with no event and no itemsPerPage');
                return;
            }
        }
        else {
            if (!event.target) {
                console.error('onItemsPerPageChanged called with event but no event.target');
                return;
            }
            itemsPerPage = Number(event.target.value);
        }

        if (itemsPerPage === 0) {
            console.error('onItemsPerPageChanged called with 0 items per page');
            return;
        }

        // store that the user changed it from the default of 108 to save for later
        localStorage.setItem('itemsPerPage', itemsPerPage.toString());

        // start showing a progress bar, this might take a while
        let progress = new ProgressBar()
        progress.anim(20, 2);
        progress.setVisible(true);

        // get url old page url to send postback on
        const url = new URL('' + document.location);
        url.searchParams.set('reskin', 'no');

        // setup postback target parameters
        const target = {
            elementQuery: '#MainContent_DropPerPage',
            value: itemsPerPage
        };

        // send postback, reloading the page once sent
        AspNetPostback.runInBackground( {
            url: url.toString(),
            target: target,
            onPreWriteHtml: (html) => {
                progress.anim(50, 2);
                return html;
            },
            onPostbackComplete: (_, __) => {
                progress.anim(100, 15);
                setTimeout(() => { document.location = '' + document.location;}, 10);
            },
        });
    }
}

