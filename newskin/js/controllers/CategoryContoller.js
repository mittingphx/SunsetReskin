import {SiteSearch} from "../util/SiteSearch.js";
import {PageControllerBase} from "./BaseControllers.js";
import {CategoryParser} from "../parsers/CategoryParser.js";
import {ProductCategoryBreadcrumb} from "../parsers/CommonParser.js";
import {CategoryBuilder} from "../builders/CategoryBuilder.js";
import {ProductBreadcrumbBuilder} from "../builders/ProductDetailBuilder.js";
import {AspNetPostback} from "../util/AspNetPostback.js";

/**
 * Implements the product category page and the search results page.
 */
export class CategoryController extends PageControllerBase {

    /**
     * Builds the category page view.
     * @type {CategoryBuilder}
     */
    pageBuilder = null;

    /**
     * Builds the breadcrumbs for the category page.
     * @type {ProductBreadcrumbBuilder}
     */
    breadcrumbBuilder = null;

    /**
     * Constructor takes reference to the skin to be built.
     * @param skin {SunsetSkin} the skin to build
     */
    constructor(skin) {
        super(skin);
        this.pageBuilder = new CategoryBuilder(this);
        this.breadcrumbBuilder = new ProductBreadcrumbBuilder();
    }

    /**
     * Builds the category or search results.
     *
     * @param targetFrame {HTMLIFrameElement} the frame to run paging postbacks on (optional)
     */
    build(targetFrame = null) {

        let $oldBody = this.skin.html.oldHtmlBody;
        if (!$oldBody) {
            console.error('Could not find old body');
            return;
        }

        // find the table containing product data
        let $table = $oldBody.querySelector('.Items');
        if (!$table) {
            console.error('Could not find table with class "Items"');
            return;
        }

        // parse from the old to build the category grid
        let parser = new CategoryParser($oldBody);
        let category = parser.readNodesFromTable($table);
        let paging = parser.readPageControls();
        // console.log({category:category, paging: paging});

        // build the category based on the parsed data
        let $insertionPoint = document.querySelector('.insert-category');
        if (!$insertionPoint) {
            console.error('Could not find insertion point!');
            return;
        }
        this.pageBuilder.buildCategoryProducts(category, $insertionPoint);
        
        // check for and display error messages
        let $error = $oldBody.querySelector('#MainContent_LblError');
        if ($error && $error.innerHTML) {
            let $divError = this.pageBuilder.buildError($error.innerHTML);
            $insertionPoint.before($divError);
            return;
        }

        // build the subcategory list on the left, or show search terms when searching
        let $subcategoryMenu;
        if (SiteSearch.isSearchResult()) {
            // custom left pane
            let search = SiteSearch.getSearchTerm();
            $subcategoryMenu = this.pageBuilder.buildMessageAsList(
                'Search Results',
                'The results for your search <b>' + search + '</b> are now being displayed'
            );

            // custom breadcrumb
            category.name = 'Search Results';
            category.breadcrumbs = new ProductCategoryBreadcrumb();
            category.breadcrumbs.name = 'Search Results for "' + SiteSearch.getSearchTerm() + '"';
            category.breadcrumbs.parent = new ProductCategoryBreadcrumb();
            category.breadcrumbs.parent.name = 'Home';
            category.breadcrumbs.parent.link = 'Default.aspx';
        }
        else {
            $subcategoryMenu = this.pageBuilder.buildSubcategoryList(category, this.skin.menu);
        }

        // insert the subcategory list in the left panel
        if ($subcategoryMenu) {
            //console.log('inserting subcategory list at .sub-category-list', {$subcategoryMenu:$subcategoryMenu});
            document.querySelector('.sub-category-list').replaceWith($subcategoryMenu);
        }
        else {
            // no subcategory list so remove the left panel completely
            console.error('Could not build $subcategoryMenu');
            document.querySelector('.sub-category-list').remove();
        }

        // build the paging controls
        // find where we're going to insert paging
        let $pagingInsert = document.querySelector('.pagination');
        if (!$pagingInsert) {
            console.error('Could not find insertion point! for paging controls');
        }

        if ($pagingInsert) {
            $pagingInsert.replaceWith(this.pageBuilder.buildPagingControls(paging, targetFrame));
        }

        // build the breadcrumbs in the header
        let $breadcrumbs = this.breadcrumbBuilder.build(category.name, category.breadcrumbs);
        document.querySelector('.breadcrumbs').replaceWith($breadcrumbs);

        // show item count
        document.querySelector('.total-show-product span').innerText
            = '1 - ' + category.items.length + ' items';

        // slider for custom size
        this.pageBuilder.initSizeSlider();

        // implement sorting dropdown
        this.initSortDropdown(category, $insertionPoint);

        // set the window title
        document.title = `${category.name} - Sunset Wholesale West`;
    }

    /**
     * Removes references to the new skin from the html
     * @param html {string} the html to strip references from
     * @return {*|string} cleaned up html code
     */
    #stripOutNewSkin(html) {

        // search for the filename
        let nameIndex = html.indexOf('NewSkin.js');
        if (nameIndex === -1) {
            console.warn('NewSkin.js not found in html');
            return html;
        }

        // search for the start of the script tag
        let scriptStartIndex = html.lastIndexOf('<script', nameIndex);
        if (scriptStartIndex === -1) {
            console.warn('could not find script tag for NewSkin in html');
            return html;
        }

        // search for the closing script tag
        let scriptEndIndex = html.indexOf('</script>', scriptStartIndex);
        if (scriptEndIndex === -1) {
            console.warn('could not find script closing tag for NewSkin in html');
            return html;
        }

        // remove the tag
        html = html.substring(0, scriptStartIndex) + html.substring(scriptEndIndex);
       // console.log('new skin removed from html');
        return html;
    }

    /**
     * Handles the click event of a paging button, causing the page to
     * reload.  Optionally accepts a frame to run the postback on, in
     * the event that the paging button came from another postback result.
     *
     * @param page {PageControlLink}
     * @param targetFrame {HTMLIFrameElement} the frame to run the postback on (optional)
     */
    pageButtonHandler(page, targetFrame = null) {

        let url = new URL(document.location + '')
        url.searchParams.set('reskin', 'no');

        const onPreWrite = (html) => {
            // make sure the new skin doesn't run.
            html = this.#stripOutNewSkin(html);
            return html;
        };
        const onDocumentLoaded = (loadedDocument, loadedDocumentFrame) => {
            //console.log('onDocumentLoaded', loadedDocument);
            //alert('onDocumentLoaded');

            // reprocess the current page with the new old page data set
            this.skin.html.replaceOldDocument(loadedDocument.document);
            this.build(loadedDocumentFrame);
        }

        // TODO: fix this paging bug
        // selecting the page button seems to always run against the buttons on
        // page 1 of the old skin, but we need to run it against the page we read
        // the available buttons from... otherwise the button we want to press
        // may be missing

        // if this link came from the result of a postback, run it within those results
        if (targetFrame) {
            AspNetPostback.dynamicAnchorPostbackInLoadedFrame(
                targetFrame,
                page.$dom,
                onDocumentLoaded
            );
        }
        // otherwise run it against the current page
        else {
            AspNetPostback.runInBackground(
                url.href,
                page.$dom,
                onDocumentLoaded,
                onPreWrite
            );
        }
    }

    /**
     * Implements the event handlers to perform
     * @param category {ProductCategoryItem}
     * @param $insertionPoint {HTMLElement}
     */
    initSortDropdown(category, $insertionPoint) {

        let $ddlSort = document.querySelector('#sorting');
        $ddlSort.addEventListener('change', _ => {
            let sortOrder = $ddlSort.value;
            if (sortOrder === 'name-asc') {
                category.items.sort(function(a, b) { return a.text.localeCompare(b.text); });
            }
            else if (sortOrder === 'name-desc') {
                category.items.sort(function(a, b) { return b.text.localeCompare(a.text); });
            }
            else if (sortOrder === 'price-asc') {
                category.items.sort(function(a, b) { return a.casePrice.localeCompare(b.casePrice); });
            }
            else if (sortOrder === 'price-desc') {
                category.items.sort(function(a, b) { return b.casePrice.localeCompare(a.casePrice); });
            }
            else if (sortOrder === 'item-no') {
                category.items.sort(function(a, b) { return a.itemNo.localeCompare(b.itemNo); });
            }
            this.pageBuilder.buildCategoryProducts(category, $insertionPoint);
        });
    }

}