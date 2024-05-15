/**
 * Project: Sunset Wholesale West Website
 * File:    SunsetSkin.js
 * Author:  Scott Mitting
 * Date:    2024-05-13
 * Abstract:
 *  Menu parsing methods for the website.
 */

import {SunsetMenuItem} from "../SunsetMenuItem.js";

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
     */
    menu = [];

    /**
     * The HTML document to load the menu data from.
     * @type {Document|null}
     */
    sourceDocument = null;

    /**
     * Constructor defaults source document to the current document.
     * @param source {Document|null}
     */
    constructor(source) {
        this.sourceDocument = source || document;
    }

    /**
     * Reads the menu from the old website.
     * See swwest_menu.html for a copy of the structure from the old website.
     */
    readMenu() {

        // allow this to be called once
        if (this.#menuRead) return;
        this.#menuRead = true;

        console.log('readMenu()');
        //this.log = [];

        // grab the parent
        const $menu = this.sourceDocument.querySelector('#Menu')
        if (!$menu) {
            console.error('could not find menu using selector: #Menu');
            return;
        }

        // find each top-level menu section
        const $topLevelMenus = $menu.querySelectorAll('.accordionHeader');
        if ($topLevelMenus.length === 0) {
            console.error('menu contained 0 elements');
            return;
        }

        this.menu = [];

        for (let i = 0; i < $topLevelMenus.length; i++) {
            //this.log.push('parsing menu #' + i);
            const $thisSubmenu = $topLevelMenus[i];

            const $thisSubmenuLink = $thisSubmenu.querySelector('.link');
            if (!$thisSubmenuLink) {
                console.log('WARNING: Could not find ".link" inside of menu.');
                console.log($thisSubmenu);
                continue;
            }

            // init top-level
            let topMenuItem = new SunsetMenuItem($thisSubmenuLink, true);

            // new approach:
            // search include to find the first table, then use the parent of that table
            // and find all tables that are direct children of that.

            const $newParent = $thisSubmenu.nextElementSibling.querySelector('table').parentElement;
            const $nodes = $newParent.querySelectorAll(':scope > table');

            for (let k = 0; k < $nodes.length; k++) {
                let child = new SunsetMenuItem($nodes[k]);
                topMenuItem.children.push(child);
                if (!child.loaded) {
                    continue;
                }
                let nodeParents = this.getMenuNodeMainElements(child.$node, 'table', 'div');
                if (nodeParents.children === null) {
                    continue;
                }
                const $parentChildren = nodeParents.children.querySelectorAll(':scope > table');
                child.$parentChildren = $parentChildren;
                for (let j = 0; j < $parentChildren.length; j++) {
                    let grandChild = new SunsetMenuItem($parentChildren[j]);
                    child.children.push(grandChild);
                    if (!grandChild.loaded) {
                        continue;
                    }
                    let childNodeParents = this.getMenuNodeMainElements(grandChild.$node, 'table', 'div');
                    if (childNodeParents.children === null) {
                        continue;
                    }
                    const $parentGrandChildren = childNodeParents.children.querySelectorAll(':scope > table');
                    for (let m = 0; m < $parentGrandChildren.length; m++) {
                        let greatGrandChild = new SunsetMenuItem($parentGrandChildren[m]);
                        grandChild.children.push(greatGrandChild);
                        if (!greatGrandChild.loaded) {
                            continue;
                        }
                        let grandChildNodeParents = this.getMenuNodeMainElements(greatGrandChild.$node, 'table', 'div');
                        if (grandChildNodeParents.children === null) {
                            continue;
                        }
                        const $parentGreatGrandChildren = grandChildNodeParents.children.querySelectorAll(':scope > table');
                        for (let n = 0; n < $parentGreatGrandChildren.length; n++) {

                            // TODO: continue recursively
                            // BUG: this only handles a certain hard-coded depth and if
                            // the menu goes deeper it'll be ignored


                            /*
                            // START CODEIUM SUGGESTION

                            const parseMenuItem = ($menuElement) => {
                                // Parse the current menu item
                                // Your existing parsing logic here

                                // Check if the current menu item has nested submenus
                                const $subMenus = $menuElement.querySelectorAll('.submenu');
                                if ($subMenus.length > 0) {
                                    // Recursively parse each nested submenu
                                    $subMenus.forEach($submenu => {
                                        parseMenuItem($submenu);
                                    });
                                }
                            };

                            // Call the parsing logic for each top-level menu item
                            $topLevelMenus.forEach($menu => {
                                parseMenuItem($menu);
                            });

                            // END CODEIUM SUGGESTION
                             */
                        }
                    }
                }
            }

            /*
            const escapeHtml = (unsafe) => {
                return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
            }

            this.log.push('<b>thisSubMenu</b>:<br><pre>' + escapeHtml($thisSubmenu.outerHTML) + '</pre>');
            this.log.push('<b>nextElementSibling</b>:<br><pre>' +escapeHtml($thisSubmenu.nextElementSibling.outerHTML) + '</pre>');
            this.log.push('<hr>');
*/

            this.menu.push(topMenuItem);
        }

    }


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
    getMenuNodeMainElements($node, parentQuery, siblingQuery) {
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
    queryParent($node, query) {
        if ($node === null) return null;
        if ($node.matches(query)) return $node;
        return this.queryParent($node.parentElement, query);
    }


}
