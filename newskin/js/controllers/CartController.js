import {PageControllerBase} from "./BaseControllers.js";
import {ShoppingCart, ViewCartParser} from "../parsers/ViewCartParser.js";
import {ViewCartBuilder} from "../builders/ViewCartBuilder.js";
import {ProductBreadcrumbBuilder} from "../builders/ProductDetailBuilder.js";


/**
 * Controller for the shopping cart page and dropdown view.
 */
export class CartController extends PageControllerBase {

    /**
     * Builder for the shopping cart view.
     * @type {ViewCartBuilder}
     */
    cartBuilder = new ViewCartBuilder();

    /**
     * Builder for the product breadcrumbs
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
     * Builds the cart page.
     */
    build() {

        let $oldBody = this.skin.html.oldHtmlBody;
        if (!$oldBody) {
            console.error('Could not find old body');
            return;
        }

        // find where we're going to insert the product details
        let $insertionPoint = document.querySelector('.shopping-cart');
        if (!$insertionPoint) {
            console.error('Could not find insertion point! (.shopping-cart)');
            return;
        }

        // parse product details from the old webpage
        let parser = new ViewCartParser($oldBody, null);
        let cart = parser.readCart();
        console.log({cart:cart});

        // grab login status
        this.skin.getLoginStatus(loginStatus => {
            // build the main product details area
            $insertionPoint.replaceWith(this.cartBuilder.build(cart, loginStatus));

            // build the breadcrumbs in the header
            let $breadcrumbs = this.breadcrumbBuilder.build('Shopping Cart', this.cartBuilder.buildBreadCrumbs());
            document.querySelector('.breadcrumbs').replaceWith($breadcrumbs);
        })

        // set the window title
        document.title = `Checkout - Sunset Wholesale West`;
    }

    /**
     * Builds the cart preview dropdown from the upper-right corner of the page.
     * @param loginStatus {LoginStatus}
     */
    buildCartDropdown(loginStatus) {

        // show a spinner while the cart is being loaded
        let $insertionPoint = document.querySelector('.ddl-cart');
        if (!$insertionPoint) {
            console.error('Could not find insertion point! (.ddl-cart)');
            return;
        }
        $insertionPoint.innerHTML = '<i class="fa fa-spinner fa-spin fa-2x"></i>';

        // load cart in the background
        ShoppingCart.getInstanceAsync(cart => {
            $insertionPoint.replaceWith(
                this.cartBuilder.buildCartDropdown(cart, loginStatus)
            );
        })
    }
}