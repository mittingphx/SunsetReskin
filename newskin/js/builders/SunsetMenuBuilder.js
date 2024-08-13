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
        'inner-sub-1-category',
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

        // build the menu
        let $menu = this.buildMenuNode(this.menu.items, 0);

        // add event handlers to highlight top-level menus when children are hovered
        this.#highlightTopLevelOnChildHover($menu);

        // return the menu
        return $menu;
    }

    /**
     * Applies the hover effect to the top level menu items when the
     * nested sub-menu is hovered.
     * @param $menu {HTMLElement} the menu html
     */
    #highlightTopLevelOnChildHover($menu) {
        // find all top-level menus items
        $menu.querySelectorAll('li').forEach($li => {
            if ($li.parentElement !== $menu) {
                return;
            }

            // grab the top-level menu and the link to highlight
            let $topLevel = $li;
            let $topLevelLink = $topLevel.querySelector('a');

            // all child lists need to highlight the top level when hovered
            $topLevel.querySelectorAll('ul').forEach($childUl => {
                $childUl.addEventListener('mouseover', (_) => {
                    $topLevelLink.classList.add('hover');
                });
                $childUl.addEventListener('mouseout', (_) => {
                    $topLevelLink.classList.remove('hover');
                })
            });
        });
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
        if (childDepth > 0) {
            $ul.classList.add('inner-sub-category');
        }

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

        // return the menu
        return $ul;
    }

    /**
     * Builds the HTML for the mobile menu.
     * @returns {HTMLUListElement|null}
     */
    buildMobileMenu() {
        if (!this.menu) {
            return null;
        }
        return this.buildMobileMenuNode(this.menu.items, 0);
    }

    /**
     * Recursively builds the HTML for the mobile menu.
     * @param itemList {SunsetMenuItem[]} the list of menu items
     * @param childDepth {number} how many levels of children deep
     */
    buildMobileMenuNode(itemList, childDepth) {

        // keep child depth within bounds
        childDepth = this.#clampChildDepth(childDepth);

        // build the menu
        let $ul = document.createElement('ul');
        $ul.classList.add('sub-menu', 'collapse');
        for (let i = 0; i < itemList.length; i++) {
            let $li = document.createElement('li');
            $li.classList.add('nav-item', 'collapsed')
            if (itemList[i].children.length <= 0) {
                $li.innerHTML = `<a href="${itemList[i].link}">${itemList[i].text}</a>`;
            }
            else {
                let $subUl = this.buildMobileMenuNode(itemList[i].children, childDepth + 1);
                $li.innerHTML = `<a href="javascript:void(0)" class="dd-menu collapsed">${itemList[i].text}</a>`;
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