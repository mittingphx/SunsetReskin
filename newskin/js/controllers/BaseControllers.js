/**
 * Project: Sunset Wholesale West Website
 * File:    PageControllerBase.js
 * Author:  Scott Mitting
 * Date:    2024-06-10
 * Abstract:
 *  Base class for controllers.
 *
 */


/**
 * Lowest level base class for all controllers.
 */
export class BaseController {

    /**
     * Reference to the current skin.
     * @type {SunsetSkin}
     */
    skin = null;

    /**
     * Constructor takes reference to the skin to be built.
     * @param skin {SunsetSkin} the skin to build
     */
    constructor(skin) {
        this.skin = skin;
    }

    /**
     * Performs the parsing and building steps.
     */
    build() {
        alert('Do not call build() on BaseController');
    }
}

/**
 * Base class for controllers that build a reusable component on one
 * or more pages of the website.
 */
export class ComponentControllerBase extends BaseController {

    /**
     * Constructor takes reference to the skin to be built.
     * @param skin {SunsetSkin} the skin to build
     */
    constructor(skin) {
        super(skin);
    }

    /**
     * Builds the component.  Must be implemented by
     * the calls that inherits ComponentControllerBase.
     */
    build() {
        alert('Do not call build() on ComponentControllerBase');
    }
}


/**
 * Base class for controllers that build the page from the old site.
 */
export class PageControllerBase extends BaseController {

    /**
     * Constructor takes reference to the skin to be built.
     * @param skin {SunsetSkin} the skin to build
     */
    constructor(skin) {
        super(skin);
    }

    /**
     * Builds the page from the old site.  Must be implemented by
     * the calls that inherits PageControllerBase.
     */
    build() {
        alert('Do not call build() on PageControllerBase');
    }
}
