import {SiteSearch} from "../util/SiteSearch.js";
import {PageControllerBase} from "./BaseControllers.js";
import {CategoryParser} from "../parsers/CategoryParser.js";
import {ProductCategoryBreadcrumb} from "../parsers/CommonParser.js";
import {CategoryBuilder} from "../builders/CategoryBuilder.js";
import {ProductBreadcrumbBuilder} from "../builders/ProductDetailBuilder.js";

/**
 * Implements the product category page and the search results page.
 */
export class CategoryController extends PageControllerBase {

    /**
     * Builds the category page view.
     * @type {CategoryBuilder}
     */
    pageBuilder = new CategoryBuilder();

    /**
     * Builds the breadcrumbs for the category page.
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
     * Builds the category or search results.
     */
    build() {

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

        // find where we're going to insert the category
        let $insertionPoint = document.querySelector('.insert-category');
        if (!$insertionPoint) {
            console.error('Could not find insertion point!');
            return;
        }


        // parse from the old to build the category grid
        let parser = new CategoryParser($oldBody);
        let category = parser.readNodesFromTable($table);
        let paging = parser.readPageControls();

        console.log({category:category, paging: paging});

        this.pageBuilder.buildCategoryProducts(category, $insertionPoint);

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
            $pagingInsert.replaceWith(this.pageBuilder.buildPagingControls(paging));
        }

        // build the breadcrumbs in the header
        let $breadcrumbs = this.breadcrumbBuilder.build(category.name, category.breadcrumbs);
        document.querySelector('.breadcrumbs').replaceWith($breadcrumbs);

        // show item count
        document.querySelector('.total-show-product span').innerText
            = '1 - ' + category.items.length + ' items';

        // slider for custom size
        this.initSizeSlider();

        // implement sorting dropdown
        this.initSortDropdown(category, $insertionPoint);

        // set the window title
        document.title = `${category.name} - Sunset Wholesale West`;
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

    /**
     * Creates an HTML range slider for customizing the grid size similar
     * to many photo apps.
     * @param $parent {HTMLElement} the HTML containing the product list
     */
    initSizeSlider($parent) {

        // TODO: I would like to change the width property of the CSS class 'category-cell'
        // instead of setting each of the element's custom styles


        let $range = document.querySelector('#nav-size-range');
        if ($range) {
            $range.addEventListener('input', _ => {
                let value = $range.value; // TODO: make this logarithmic

                // default settings at value = 0.5
                // width: 33%
                // font-size: 1.78em;
                document.querySelectorAll('.category-cell').forEach(cell => {
                    console.log({
                        value: value,
                        width: (50 * value) + '%',
                        fontSize: (2.70*value)+'em',
                        fontSize2: (21*value)+'px',
                    });
                    cell.style.width = (50 * value) + '%';
                    cell.querySelector('h4').style.fontSize = (2.70*value)+'em';
                    cell.querySelector('a').style.fontSize = (21*value)+'px';
                });
            });
        }
    }
}