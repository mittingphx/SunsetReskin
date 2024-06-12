import {BaseController} from "./BaseControllers.js";
import {LinkHandler} from "../util/LinkHandler.js";
import {UrlHelper} from "../UrlHelper.js";

/**
 * Intercept links so we can manually load new pages into the
 * skin, allowing us to show loading messages for pages that
 * take a while and to avoid seeing a flash of the old webpage
 */
export class LinkController extends BaseController {

    /**
     * Intercepts links to other pages.
     * @type {LinkHandler}
     */
    linkHandler = null;

    /**
     * Constructor takes reference to the skin to be built on.
     * @param skin
     */
    constructor(skin) {
        super(skin);
    }

    /**
     * Initializes the dynamic link routing.
     */
    build() {

        // remove old handler if needed
        if (this.linkHandler) {
            this.linkHandler.removeEventListener();
        }

        // how to handle links and which links to handle
        this.linkHandler = new LinkHandler(
            async $a => { await this.skin.navigateTo($a.href);},
            $a => { return UrlHelper.urlIsOnSameDomain($a);});
        this.linkHandler.addEventListener();

    }

}