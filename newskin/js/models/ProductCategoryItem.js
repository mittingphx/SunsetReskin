
import {CategoryProductItem} from "./CategoryProductItem.js";

/**
 * Information about the category or search terms displayed.
 * This is different from the ProductCategory class which is
 * a reference to the breadcrumbs.
 */
export class ProductCategoryItem {

    /**
     * The display text for this category.
     * @type {string}
     */
    name = '';

    /**
     * Products to display
     * @type {CategoryProductItem[]}
     */
    items = [];

    /**
     * The category hierarchy read from the breadcrumbs.
     * @type {ProductCategoryBreadcrumb|null}
     */
    breadcrumbs = null;
}
