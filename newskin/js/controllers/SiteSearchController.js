import {ComponentControllerBase} from "./BaseControllers.js";

/**
 * Controller for managing the site search bar
 */
export class SiteSearchController extends ComponentControllerBase {

    /**
     * DOM reference to the search input text box
     * @type {HTMLInputElement|null}
     */
    $txtSearch = null;

    /**
     * DOM reference to the search button
     * @type {HTMLElement|null}
     */
    $btnSearch = null;

    /**
     * Constructor takes reference to the skin to be built.
     * @param skin {SunsetSkin} the skin to build
     */
    constructor(skin) {
        super(skin);
    }

    /**
     * Prepares the search bar for use.
     */
    build() {
        this.setupSearchControls();
    }

    /**
     * Handles forwarding to the search to the real search bar in the
     * hidden original page.
     */
    handleSearch() {

        // grab and log user input
        let searchTerm = this.getInputSearchTerm();
        console.log('handleSearch() searchTerm: ' + searchTerm);

        // example url: https://swwest.com/ItemSearch.aspx?Search=esko+leaf
        let searchUrl = 'ItemSearch.aspx?Search=' + encodeURIComponent(searchTerm);
        if (this.skin) {
            this.skin.navigateTo(searchUrl).then(_ => {});
        }
        else {
            document.location = searchUrl;
        }
    }

    /**
     * Returns the text of the search input text box.
     * @returns {string}
     */
    getInputSearchTerm() {
        return this.$txtSearch.value;
    }

    /**
     * Returns true iff the current page is showing search results.
     * @returns {boolean}
     */
    isUrlSearchResult() {
        return this.getUrlSearchTerm() !== null;
    }

    /**
     * Returns the search term from the current page's url.
     * @returns {string|null}
     */
    getUrlSearchTerm() {
        return new URL('' + document.location).searchParams.get('Search');
    }

    /**
     * Assigns event listeners to the search controls.
     */
    setupSearchControls() {

        // grab DOM references
        this.$btnSearch = document.querySelector('.search-btn button');
        if (!this.$btnSearch) {
            console.warn('Could not find search button on reskin page');
        }

        this.$txtSearch = document.querySelector('#search');
        if (!this.$txtSearch) {
            console.warn('Could not find search input on reskin page');
        }

        // assign event listeners
        if (this.$btnSearch) {
            this.$btnSearch.addEventListener('click', () => {
                this.handleSearch();
            });
        }

        if (this.$txtSearch) {
            this.$txtSearch.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }
    }
}