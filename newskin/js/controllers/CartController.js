import {PageControllerBase} from "./BaseControllers.js";
import {ViewCartParser} from "../parsers/ViewCartParser.js";
import {ViewCartBuilder} from "../builders/ViewCartBuilder.js";
import {ProductBreadcrumbBuilder} from "../builders/ProductDetailBuilder.js";
import {ShoppingCart} from "../models/ShoppingCart.js";

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
            let $cartHtml = this.cartBuilder.build(cart, loginStatus);
            $insertionPoint.replaceWith($cartHtml);

            console.log('getLoginStatus() completed');
            console.log({loginStatus:loginStatus, $insertionPoint:$insertionPoint, $cartHtml:$cartHtml});

            // build the breadcrumbs in the header
            let $breadcrumbs = this.breadcrumbBuilder.build('Shopping Cart', this.cartBuilder.buildBreadCrumbs());
            let breadcrumbInsert = document.querySelector('.breadcrumbs');
            if (breadcrumbInsert) {
                breadcrumbInsert.replaceWith($breadcrumbs);
            }

            // look for commands on the url
            let urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('remove')) {
                let itemId = parseInt(urlParams.get('remove'));
                if (itemId) {

                    // wait until cart is displayed to start confirming the remove process
                    let startTime = new Date().getTime();
                    let waitInterval = setTimeout(_ => {

                        // give up after 15 seconds
                        if (new Date().getTime() - startTime > 15000) {
                            clearInterval(waitInterval);
                            return;
                        }

                        // confirm cart has been displayed
                        if (!this.#cartIsDisplayingItem(itemId)) {
                            return;
                        }

                        // confirm remove process
                        clearInterval(waitInterval);
                        cart.confirmRemove(itemId);
                    }, 250);
                }
            }

        })

        // set the window title
        document.title = `Checkout - Sunset Wholesale West`;
    }

    /**
     * Returns true if the shopping cart is displaying the item
     * @param itemId {number} the id of the item
     * @returns {boolean}
     */
    #cartIsDisplayingItem(itemId) {

        // confirm cart has been displayed
        let $cart = document.querySelector('.shopping-cart');
        if (!$cart) {
            console.error('Could not find cart! (.shopping-cart)');
            return false;
        }

        let $name = $cart.querySelector('.product-name');
        if (!$name) {
            console.error('Could not find product description! (.shopping-cart > .product-name)');
            return false;
        }

        let $aList = $name.querySelectorAll('a');
        if (!$aList) {
            console.error('Could not find product link! (.shopping-cart > a)');
            return false;
        }

        for (let i = 0; i < $aList.length; i++) {
            let $a = $aList[i];
            if ($a.href.indexOf(itemId)) {
                return true;
            }
        }

        console.error('Could not find product #' + itemId + '! (.shopping-cart > a)');
        return false;
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