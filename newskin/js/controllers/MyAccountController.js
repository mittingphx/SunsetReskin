import {PageControllerBase} from "./BaseControllers.js";
import {MyAccountBuilder} from "../builders/MyAccountBuilder.js";
import {MyAccountParser} from "../parsers/MyAccountParser.js";
import {DomHelper} from "../util/DomHelper.js";

/**
 * Controller for the account page.
 */
export class MyAccountController extends PageControllerBase {

    /**
     * Builds the HTML for the account page
     * @type {MyAccountBuilder}
     */
    builder = new MyAccountBuilder();

    /**
     * Parses the HTML for the account page
     * @type {MyAccountParser}
     */
    parser = new MyAccountParser();

    /**
     * Constructor takes reference to the skin to be built.
     * @param skin {SunsetSkin} the skin to build
     */
    constructor(skin) {
        super(skin);
    }

    /**
     * Builds the account page.
     */
    build() {

        let accountForm = this.parser.getMyAccountForm();
        this.builder.build(accountForm);

        // set the window title
        document.title = `Sunset Wholesale West`;
    }
}