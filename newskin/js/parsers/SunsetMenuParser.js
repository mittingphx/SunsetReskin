/**
 * Project: Sunset Wholesale West Website
 * File:    SunsetSkin.js
 * Author:  Scott Mitting
 * Date:    2024-05-13
 * Abstract:
 *  Menu parsing methods for the website.
 */

import {SunsetMenu,SunsetMenuItem} from "../SunsetMenuItem.js";

/**
 * Helper class for parsing the menu data on the swwest website.
 */
export class SunsetMenuParser {

    /**
     * True iff the original menu data has been loaded into this.menu
     * @type {boolean}
     */
    #menuRead = false;

    /**
     * Stores the loaded menu elements from the original website.
     * @type {SunsetMenu}
     */
    menu = null;

    /**
     * The HTML document to load the menu data from.
     * @type {Document|HTMLElement|null}
     */
    sourceDocument = null;

    /**
     * Constructor defaults source document to the current document.
     * @param source {Document|HTMLElement|null}
     */
    constructor(source) {
        this.sourceDocument = source || document;
    }

    /**
     * Reads the menu from the old website.  See swwest_menu.html
     * for a copy of the structure from the old website.  This
     * version of the code is recursive and can read a menu of
     * arbitrary depth.
     */
    readMenu() {

        // allow this to be called once
        if (this.#menuRead) return;
        this.#menuRead = true;

        // grab and parse the parent menu
        const $menu = this.sourceDocument.querySelector('#Menu')
        if ($menu) {
            this.menu = this.#readMenuProcessMenu($menu);
        }
        else {
            console.error('could not find menu using selector: #Menu');
        }
    }

    /**
     * Parses the old site's menu into a SunsetMenu object.
     * Is able to parse menus of arbitrary depth.
     * @param $menu {HTMLElement}
     * @return {SunsetMenu}
     */
    #readMenuProcessMenu($menu) {

        let menu = new SunsetMenu(null);

        // find each top-level menu section
        const $topLevelMenus = $menu.querySelectorAll('.accordionHeader,.accordionHeaderSelected');
        if ($topLevelMenus.length === 0) {
            console.error('menu contained 0 elements');
            return menu;
        }

        // process top-level menu items
        for (let i = 0; i < $topLevelMenus.length; i++) {
            let topMenuItem = this.#readMenuProcessTopLevelNode($topLevelMenus[i]);
            if (topMenuItem) {
                menu.addMenuItem(topMenuItem);
            }
        }

        return menu;
    }

    /**
     * Processes a top-level menu item calling processNodes() to
     * add children at an arbitrary depth.
     * @param $submenu {HTMLElement}
     * @return {SunsetMenuItem}
     */
    #readMenuProcessTopLevelNode($submenu) {

        // find link within menu
        const $link = $submenu.querySelector('.link');
        if (!$link) {
            console.log('WARNING: Could not find ".link" inside of menu.', $submenu);
            return null;
        }

        // process top-level menu item
        let topMenuItem = new SunsetMenuItem($link, true);
        const $newParent = $submenu.nextElementSibling.querySelector('table').parentElement;
        this.#readMenuProcessNodes($newParent, topMenuItem);
        return topMenuItem;
    }


    /**
     * Recursively adds children to the parentItem
     * @param $newParent {HTMLElement} element to parse
     * @param parentItem {SunsetMenuItem} the parent to add children to
     */
    #readMenuProcessNodes($newParent, parentItem) {
        const $nodes = $newParent.querySelectorAll(':scope > table');
        for (let nodeIndex = 0; nodeIndex < $nodes.length; nodeIndex++) {
            let child = new SunsetMenuItem($nodes[nodeIndex]);
            parentItem.addChild(child);
            if (!child.loaded) continue;

            let nodeParents = this.#getMenuNodeMainElements(child.$node);
            if (nodeParents.children !== null) {
                this.#readMenuProcessNodes(nodeParents.children, child);
            }
        }
    }

    /**
     * Returns The parent <table> and when relevant the hidden <div>
     * containing the submenu for this item.
     *
     * Keeps checking parents of a node until a table is found.
     * @param $node {HTMLElement} the div with class="menuNode"
     * @returns {{parent: HTMLElement, children: HTMLElement}|null}
     */
    #getMenuNodeMainElements($node) {
        let ret = {};

        // grab the root container for this element
        ret.parent = this.#queryParent($node, 'table');
        if (ret.parent === null) {
            console.error(`getMenuNodeMainElements() did not find a parent matching the query "table": ${$node.outerHTML}`);
            return null;
        }

        // grab the children from the next sibling when applicable
        ret.children = null;
        const $sibling = ret.parent.nextElementSibling;
        if ($sibling !== null && $sibling.matches('div')) {
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
    #queryParent($node, query) {
        if ($node === null) return null;
        if ($node.matches(query)) return $node;
        return this.#queryParent($node.parentElement, query);
    }
}
