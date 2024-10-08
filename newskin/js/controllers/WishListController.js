import {ComponentControllerBase} from "./BaseControllers.js";
import {WishListBuilder} from "../builders/WishListBuilder.js";

/**
 * Controller that both maintains the list of wishlist items in the
 * browser cache and builds the wish list dropdown HTML.
 */
export class WishListController extends ComponentControllerBase {

    /**
     * Object that builds the wishlist dropdown.
     * @type {WishListBuilder}
     */
    builder = new WishListBuilder();



    /**
     * Constructor takes reference to the skin to be built.
     * @param skin {SunsetSkin} the skin to build
     */
    constructor(skin) {
        super(skin);
    }

    /**
     * Builds the wishlist dropdown.
     */
    build() {

        let $insertionPoint = document.querySelector('.ddl-wishlist');
        if (!$insertionPoint) {
            console.error('Could not find insertion point!');
            return;
        }

        $insertionPoint.replaceWith(this.builder.build());
    }

}
