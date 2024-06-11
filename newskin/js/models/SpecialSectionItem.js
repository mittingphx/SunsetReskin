
/**
 *  Record class for all data about one section of specials.
 */
export class SpecialSectionItem {
    /**
     * The name of the section
     * @type {string}
     */
    name = '';

    /**
     *  The href link for this group of products.
     * @type {string}
     */
    link = '';

    /**
     * Products belonging to this section
     * @type {SpecialProductItem[]}
     */
    products = [];
}
