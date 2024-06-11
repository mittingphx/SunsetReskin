import {PageControllerBase} from "./BaseControllers.js";
import {ContactPageBuilder} from "../builders/ContactPageBuilder.js";
import {DomHelper} from "../util/DomHelper.js";

/**
 * Controller for the contact us page.
 */
export class ContactPageController extends PageControllerBase {

    /**
     * Builds the HTML for the contact us form.
     * @type {ContactPageBuilder}
     */
    builder = new ContactPageBuilder();

    /**
     * Constructor takes reference to the skin to be built.
     * @param skin {SunsetSkin} the skin to build
     */
    constructor(skin) {
        super(skin);
    }

    /**
     * Builds the contact page.
     */
    build() {

        let dom = {};
        if (!DomHelper.addElementsByQuery(dom, {
            $contactForm: 'form#Form1'
        })) return;

        // build the contact page
        this.builder.build(this.skin.loginController.status, dom.$contactForm);

        // set the window title
        document.title = `Sunset Wholesale West`;
    }
}