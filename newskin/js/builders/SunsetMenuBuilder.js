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


        /*
        <ul id="nav" class="navbar-nav ms-auto">
                  <li class="nav-item">
                    <a href="index.html" class="active" aria-label="Toggle navigation">Home</a>
                  </li>
                  <li class="nav-item">
                    <a class="dd-menu collapsed" href="javascript:void(0)" data-bs-toggle="collapse" data-bs-target="#submenu-1-2" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">Pages</a>
                    <ul class="sub-menu collapse" id="submenu-1-2">
                      <li class="nav-item"><a href="Default.aspx"><i class="fa fa-home"></i>Home</a></li>
                      <li class="nav-item"><a href="ContactUs.aspx"><i class="fa fa-envelope"></i>Contact Us</a></li>
                      <li class="nav-item"><a href="https://sunsetwholesalewest.com/Vendors/" target="_blank"><i class="fa fa-id-card"></i>Vendor Showcases</a></li>
                      <li class="nav-item"><hr></li>
                      <li class="nav-item"><a href="Login/MyAccount.aspx"><i class="fa fa-user-plus"></i>Register</a></li>
                      <li class="nav-item"><a href="Login/Login.aspx"><i class="fa fa-sign-in"></i>Sign In</a></li>
                      <li class="nav-item"><a href="ViewCart.aspx"><i class="fa fa-shopping-cart"></i>Cart</a></li>
                    </ul>
                  </li>
                  <li class="nav-item">
                    <a class="dd-menu" href="javascript:void(0)" data-bs-toggle="collapse"
                    data-bs-target="#submenu-1-3" aria-controls="navbarSupportedContent"
                    aria-expanded="false" aria-label="Toggle navigation">Categories</a>
                    <ul class="sub-menu" id="submenu-1-3">
                      <li class="nav-item"><a href="ItemSearch.aspx?WebCatID=CBDProds">CBD Products</a></li>
                      <li class="nav-item"><a href="ItemSearch.aspx?WebCatID=CreamWhip">Cream Whips</a></li>
                      <li class="nav-item"><a href="ItemSearch.aspx?WebCatID=Hookah">Hookah</a></li>
                      <li class="nav-item"><a href="ItemSearch.aspx?WebCatID=PipesGlass">Pipes &amp; Glass</a></li>
                      <li class="nav-item"><a href="ItemSearch.aspx?WebCatID=Tobacco_Cigs">Cigarettes</a></li>
                    </ul>
                  </li>
                  <li class="nav-item">
                    <a href="ContactUs.aspx" aria-label="Toggle navigation">Contact Us</a>
                  </li>
                </ul>
         */

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