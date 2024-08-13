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
     * Returns the <td> directly underneath a given <td> in a table.
     * @param $td {HTMLTableCellElement}
     * @return {HTMLTableCellElement|null} the cell or null if not found
     */
    static findCellOnNextRow($td) {

        // get parent row
        const $tr = $td.parentElement;
        if (!$tr || $tr.tagName !== 'TR') {
            console.warn('Parent of TD was expected to be a TR', $td, $tr);
            return null;
        }

        // grab the next row
        const $nextRow = $tr.nextElementSibling;
        if (!$nextRow || $nextRow.tagName !== 'TR') {
            console.warn('Next sibling of TR was expected to a TR', $tr, $nextRow);
            return null;
        }

        // find the cell in the next row with the same cellIndex
        const $nextRowCells = $nextRow.querySelectorAll('td');
        for (let i = 0; i < $nextRowCells.length; i++) {
            let $cell = $nextRowCells[i];
            if ($cell.cellIndex === $td.cellIndex) {
                return $cell;
            }
        }

        // we didn't find the cell
        console.warn('Could not find a cell in the next row with cellIndex=' + $td.cellIndex);
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
        // console.log('itemsPerPage=' + itemsPerPage);

        // set the value on the visible page
        const $itemsPerPage = document.querySelector('#itemsPerPage');
        $itemsPerPage.value = itemsPerPage;

        // create event to trigger a postback when the value changes
        $itemsPerPage.addEventListener('change', (event) => {

            // start showing a progress bar, this might take a while
            let progress = new ProgressBar()
            progress.anim(20, 2);
            progress.setVisible(true);

            // get url to send postback on
            const url = new URL('' + document.location);
            url.searchParams.set('reskin', 'no');

            // setup postback target parameters
            const target = {elementQuery: '#MainContent_DropPerPage', value:  event.target.value};
            // console.log('AspNetPostback target', target);

            // send postback, reloading the page once sent
            AspNetPostback.runInBackground(url.toString(), target,
                (_, __) => {
                    //alert('post back sent... reloading page');
                    progress.anim(100, 15);
                    // reload page to see the change
                    setTimeout(() => {
                        document.location = '' + document.location;
                    }, 10);
                }, (html) => {
                    //console.log('post back html', html);
                    //alert('got post back html');
                    progress.anim(50, 2);
                    return html;
                });
        });
    }
}

