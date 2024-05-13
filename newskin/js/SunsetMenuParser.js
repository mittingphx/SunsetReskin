/**
 * Project: Sunset Wholesale West Website
 * File:    SunsetSkin.js
 * Author:  Scott Mitting
 * Date:    2024-05-13
 * Abstract:
 *  Menu parsing methods for the website.
 */

/**
 * Helper class for parsing the menu data on the swwest website.
 */
export class SunsetMenuParser {

    /**
     * Returns The parent <table> and when relevant the hidden <div>
     * containing the submenu for this item.
     *
     * Keeps checking parents of a node until a table is found.
     * @param $node {HTMLElement} the div with class="menuNode"
     * @param [parentQuery=table] {string} the selector to find walking up parents to $node
     * @param [siblingQuery=div] {string} the selector to determine if the next sibling is the children
     * @returns {{parent: HTMLElement, children: HTMLElement}|null}
     */
    static getMenuNodeMainElements($node, parentQuery, siblingQuery) {
        let ret = {};

        // check input
        if ($node === null) {
            console.error('$node is a required parameter');
            return null;
        }
        if (parentQuery === null) {
            parentQuery = 'table';
        }
        if (siblingQuery === null) {
            siblingQuery = 'div'
        }

        // grab the root container for this element
        ret.parent = this.queryParent($node, parentQuery);
        if (ret.parent === null) {
            console.error(`getMenuNodeMainElements() did not find a parent matching the query "${parentQuery}": ${$node.outerHTML}`);
            return null;
        }

        // grab the children from the next sibling when applicable
        ret.children = null;
        const $sibling = ret.parent.nextElementSibling;
        if ($sibling !== null && $sibling.matches(siblingQuery)) {
            ret.children = $sibling;
        }

        // return main elements
        return ret;
    }


    /**
     * Keeps checking parents until the query is matched
     * @param $node {HTMLElement}
     * @param query {string}
     * @returns {*|null}
     */
    static queryParent($node, query) {
        if ($node === null) return null;
        if ($node.matches(query)) return $node;
        return this.queryParent($node.parentElement, query);
    }


}
