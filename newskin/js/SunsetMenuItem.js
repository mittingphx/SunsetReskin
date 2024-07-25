/**
 * Project: Sunset Wholesale West Website
 * File:    SunsetMenuItem.js
 * Author:  Scott Mitting
 * Date:    2024-05-13
 * Abstract:
 *  Model classes representing the menu in memory.
 */


/**
 * Top level menu for the website, containing all the categories
 * displayed from the mega menu, organized in a form to allow it
 * to be queried efficiently.
 */
export class SunsetMenu {

    /**
     * The top-level menu items in the menu.  The children form a hierarchy.
     * @type {SunsetMenuItem[]}
     */
    items = [];

    /**
     * Constructor optionally takes an array of items
     * @param items {SunsetMenuItem[]}
     */
    constructor(items) {
        this.items = items || [];
    }

    /**
     * Adds a menu item to this object.
     * @param item {SunsetMenuItem}
     */
    addMenuItem(item) {
        this.items.push(item);
    }


    /**
     * Finds an item using the breadcrumbs as a guide on how to walk
     * directly to the item instead of scanning thousands of items
     * over a mixed-depth hierarchy.
     * @param breadcrumbs {ProductCategoryBreadcrumb}
     * @returns {SunsetMenuItem|null}
     */
    findItem(breadcrumbs) {

        // get parents as array from top-level to specific children
        let parents = breadcrumbs.getParentHierarchy();
        if (parents.length < 1) return null;

        // search the top-level items with the first breadcrumb
        let searchScope = this.items;
        let parentIndex = 0;
        while (searchScope) {
            let searchItem = parents[parentIndex];
            if (!searchItem) return null;

            let found = searchScope.find(item => item.text === searchItem.name);
            if (found) {
                searchScope = found.children;
                if (++parentIndex >= parents.length) {
                    return found;
                }
            }
            else {
                searchScope = null;
            }
        }

        return null;
    }

    /**
     * Searches for a top-level item by its display text.
     * @param text {string}
     * @returns {SunsetMenuItem|null}
     */
    findItemByText(text) {
        for (let item of this.items) {
            if (item.text === text) {
                return item;
            }
        }
        return null;
    }

    /**
     * Does a recursive search for an item by display text.
     * @param text {string}
     * @returns {SunsetMenuItem|null}
     */
    findItemRecursive(text) {
        for (let item of this.items) {
            let found = item.findItemRecursive(text);
            if (found) {
                return found;
            }
        }
        return null;
    }
}

/**
 * Object representing one link on the Sunset Wholesale West website
 * menu, including its children.
 */
export class SunsetMenuItem {

    /**
     * The display text for this menu item.
     * @type {string}
     */
    text = '';

    /**
     * The href link for this menu item.
     * @type {string}
     */
    link = '';

    /**
     * The number of products within this menu item.
     * Not used yet.
     * @type {number}
     */
    count = 0;

    /**
     * The child menu items under this item.
     * @type {SunsetMenuItem[]}
     */
    children = [];

    /**
     * The parent item in the menu hierarchy.
     * @type {SunsetMenuItem|null}
     */
    parent = null;

    /**
     * True iff this item was loaded successfully.
     * @type {boolean}
     */
    loaded = false;

    /**
     * The node this data was extracted from
     * @type {HTMLElement|null}
     */
    $node = null;

    /**
     * Constructor optionally takes the DOM element to read its
     * menu data from.
     * @param [$node] {HTMLElement}
     * @param [skipLinkFromParent=false] when true we don't try to read the parent's href
     */
    constructor($node, skipLinkFromParent) {
        if ($node) {
            this.readFromNode($node, skipLinkFromParent);
        }
    }

    /**
     * Adds a child to this menu item.  This is recommended for adding
     * children instead of access the array directly because it maintains
     * the parent relationship for later querying.
     * @param child {SunsetMenuItem}
     */
    addChild(child) {
        child.parent = this;
        this.children.push(child);
    }

    /**
     * Searches for an item by display text in only this object and
     * its immediate children.
     * @param text {string}
     * @returns {SunsetMenuItem|null}
     */
    findItemByText(text) {
        if (this.text === text) {
            return this;
        }
        for (let child of this.children) {
            if (child.text === text) {
                return child;
            }
        }
        return null;
    }

    /**
     * Searches for a menu item by display text recursively through
     * all the children.
     * @param text
     * @returns {SunsetMenuItem|null}
     */
    findItemRecursive(text) {
        if (this.text === text) {
            return this;
        }
        for (let child of this.children) {
            let found = child.findItemRecursive(text);
            if (found) {
                return found;
            }
        }
        return null;
    }

    /**
     * Reads the data for this link from an HTML element.
     * @param $node {HTMLElement} DOM element to read from
     * @param [skipLinkFromParent=false] {boolean} when true we don't try to read the parent's href
     * @returns {boolean} returns true iff the menu item was read successfully.
     */
    readFromNode($node, skipLinkFromParent) {


        //
        // Converts https://domain.com/page to /page
        //
        function makeLinkRelative(url) {
            let protocolEnd = url.indexOf('://');
            if (protocolEnd === -1) return url;
            let domainEnd = url.indexOf('/', protocolEnd + 3);
            if (domainEnd === -1) return url;
            return url.substring(domainEnd);
        }

        let $originalNode = $node;

        // find target link if node we're looking for wasn't passed directly
        if (!$node.matches('.menuNode')) {
            $node = $node.querySelector('.menuNode');
        }

        // if the query failed, assume we're pulling from the supplied node's text directly

        // make sure we have the text of the link
        if ($node === null || !$node.matches('div.menuNode')) {
            $node = $originalNode;
        }

        // fill this record from the DOM node
        this.text = $node.innerText;
        if (!skipLinkFromParent) {
            if ($node.parentElement) {
                this.link = $node.parentElement.getAttribute('href');
                this.link = makeLinkRelative(this.link);
            }
        }
        this.children = [];
        this.$node = $node;

        this.loaded = true;
        return true;
    }

}
