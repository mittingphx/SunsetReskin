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
        console.log('itemsPerPage=' + itemsPerPage);

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
            console.log('AspNetPostback target', target);

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
        ret.name = ret.breadcrumbs.name;

        let $nodes = $table.querySelectorAll('td');

        for (let i = 0; i < $nodes.length; i++) {
            let $node = $nodes[i];
            let nodeType = this.getNodeType($node);
            if (nodeType === '') continue;

            if (nodeType === 'product') {
                let product = this.readFromDataNode($node);
                ret.items.push(product);
            }
            else if (nodeType === 'qty') {
                // TODO: tie this to the product by item number
                /*
                <td class="CenterQty"><span id="MainContent_LblQtyPopularItems...2918">Qty:</span><input name="ctl00$MainContent$txtQtyPopularItems...2918" type="text" maxlength="4" id="MainContent_txtQtyPopularItems...2918" style="width:30px;"><input type="submit" name="ctl00$MainContent$btnPopularItems...2918" value="Buy" id="MainContent_btnPopularItems...2918" class="ButtonBuy"></td>
                 */
            }
        }

        return ret;
    }

    /**
     * Returns the type of data within this node
     * @param $node
     * @returns {null|string}
     */
    getNodeType($node) {
        if ($node.classList.contains('Item')) return 'product';
        if ($node.classList.contains('Qty')) return 'qty';
        return null;
    }


    /**
     * Reads the data for one protect from an HTML element.
     * @param $node {HTMLElement} DOM element to read from
     * @returns {CategoryProductItem} the product data read
     */
    readFromDataNode($node) {

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
}

