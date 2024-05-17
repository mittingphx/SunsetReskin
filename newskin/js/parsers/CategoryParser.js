import {CommonParser, ProductCategoryBreadcrumb, IProductBase} from "./CommonParser.js";

/**
 * Information about the category or search terms displayed.
 * This is different from the ProductCategory class which is
 * a reference to the breadcrumbs.
 */
export class ProductCategoryItem {

    /**
     * The display text for this category.
     * @type {string}
     */
    name = '';

    /**
     * Products to display
     * @type {CategoryProductItem[]}
     */
    items = [];

    /**
     * The category hierarchy read from the breadcrumbs.
     * @type {ProductCategoryBreadcrumb|null}
     */
    breadcrumbs = null;
}

/**
 * Record class for all data about one product displayed in a category
 * or search view on the website.
 */
export class CategoryProductItem extends IProductBase {
    // extends Classes([IHasPrices, IHasLinkAndImage])

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

}


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
     * @param source {Document|null}
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

}