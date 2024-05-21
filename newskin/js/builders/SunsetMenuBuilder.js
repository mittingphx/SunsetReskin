/**
 * Project: Sunset Wholesale West Website
 * File:    SunsetMenuBuilder.js
 * Author:  Scott Mitting
 * Date:    2024-05-13
 * Abstract:
 *  HTML building methods for the menu on the swwest website.
 */

import {SunsetMenu,SunsetMenuItem} from "../SunsetMenuItem.js";

/**
 * Builds the HTML for the menu on the swwest website.
 */
export class SunsetMenuBuilder {

    /**
     * The menu being built.
     * @type {SunsetMenu}
     */
    menu = null;

    /**
     * Class names for each depth level
     * @type {string[]}
     * @private
     */
    #depthClasses = [
        'sub-category',
        'inner-sub-category',
        'inner-sub-2-category',
        'inner-sub-3-category',
        'inner-sub-4-category'
    ];

    /**
     * Constructor optionally takes the menu to be built.
     * @param menu {SunsetMenu|null}
     */
    constructor(menu) {
        this.menu = menu;
    }

    /**
     * Builds the HTML for the category dropdown menu.
     * @returns {HTMLUListElement|null}
     */
    build() {
        if (!this.menu) {
            return null;
        }
        return this.buildMenuNode(this.menu.items, 0);
    }

    /**
     * Recursively builds the HTML for the menu.
     * @param itemList {SunsetMenuItem[]}
     * @param childDepth {number} how many levels of children deep
     * @returns {HTMLUListElement}
     */
    buildMenuNode(itemList, childDepth) {

        // keep child depth within bounds
        childDepth = this.#clampChildDepth(childDepth);

        // build the menu
        let $ul = document.createElement('ul');
        $ul.classList.add(this.#depthClasses[childDepth]);
        for (let i = 0; i < itemList.length; i++) {
            let $li = document.createElement('li');
            if (itemList[i].children.length <= 0) {
                $li.innerHTML = `<a href="${itemList[i].link}">${itemList[i].text}</a>`;
            }
            else {
                let $subUl = this.buildMenuNode(itemList[i].children, childDepth + 1);
                $li.innerHTML = `<a href="${itemList[i].link}">${itemList[i].text} <i class="lni lni-chevron-right"></i></a>`;
                $li.appendChild($subUl);
            }
            $ul.appendChild($li);
        }
        return $ul;
    }

    /**
     * Clamps a number between min and max
     * @param num {number}
     * @param min {number}
     * @param max {number}
     * @returns {number}
     */
    #clamp = (num, min, max) => Math.min(Math.max(num || 0, min), max);

    /**
     * Clamps a child depth to be within the bounds of the depth classes
     * @param childDepth
     * @returns {number}
     */
    #clampChildDepth = (childDepth) => this.#clamp(childDepth, 0, this.#depthClasses.length - 1);

}