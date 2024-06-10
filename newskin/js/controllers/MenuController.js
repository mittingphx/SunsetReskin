import {ComponentControllerBase} from "./BaseControllers.js";
import {SunsetMenuParser} from "../parsers/SunsetMenuParser.js";
import {SunsetMenuBuilder} from "../builders/SunsetMenuBuilder.js";

/**
 * Parses site menu from the old site and builds the new dropdown.
 */
export class MenuController extends ComponentControllerBase {

    /**
     * Constructor takes reference to the skin to be built.
     * @param skin {SunsetSkin} the skin to build
     */
    constructor(skin) {
        super(skin);
    }

    /**
     * Builds the menu from the old website.
     */
    build() {

        let $oldBody = this.skin.html.oldHtmlBody;
        if (!$oldBody) {
            console.error('Could not find old body');
            return;
        }

        // find insertion point
        let $megaMenu = document.querySelector('.mega-category-menu');
        if (!$megaMenu) {
            console.error('Could not load .mega-category-menu to fill menu data');
            return;
        }

        // parse the menu from the old website
        let parser = new SunsetMenuParser($oldBody);
        parser.readMenu();
        this.skin.menu = parser.menu;

        // build the menu into the new website
        let builder = new SunsetMenuBuilder(this.skin.menu);
        $megaMenu.append(builder.build());
    }
}