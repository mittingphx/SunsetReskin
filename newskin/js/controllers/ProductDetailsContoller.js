import {PageControllerBase} from "./BaseControllers.js";
import {ProductDetailParser} from "../parsers/ProductDetailParser.js";
import {ProductBreadcrumbBuilder, ProductDetailBuilder} from "../builders/ProductDetailBuilder.js";


/**
 * Controller for the product detail page.
 */
export class ProductDetailsController extends PageControllerBase {

    // noinspection JSCheckFunctionSignatures
    /**
     * Builds the product detail area of the page.
     * @type {ProductDetailBuilder}
     */
    detailBuilder = new ProductDetailBuilder(this);

    /**
     * Builds the breadcrumb area of the page.
     * @type {ProductBreadcrumbBuilder}
     */
    breadcrumbBuilder = new ProductBreadcrumbBuilder();

    /**
     * Constructor takes reference to the skin to be built.
     * @param skin {SunsetSkin} the skin to build
     */
    constructor(skin) {
        super(skin);
    }

    /**
     * Builds the product detail page.
     */
    build() {

        let $oldBody = this.skin.html.oldHtmlBody;
        if (!$oldBody) {
            console.error('Could not find old body');
            return;
        }

        // find where we're going to insert the product details
        let $insertionPoint = document.querySelector('.insert-product-details');
        if (!$insertionPoint) {
            console.error('Could not find insertion point!');
            return;
        }

        // parse product details from the old webpage
        let parser = new ProductDetailParser($oldBody);
        let productItem = parser.readProductDetail();
        //console.log({productItem:productItem});

        // build the main product details area
        $insertionPoint.after(this.detailBuilder.build(productItem));

        // build the breadcrumbs in the header
        let $breadcrumbs = this.breadcrumbBuilder.build(productItem.text, productItem.category);
        document.querySelector('.breadcrumbs').replaceWith($breadcrumbs);

        // set the window title
        document.title = `${productItem.text} - Sunset Wholesale West`;
    }
}