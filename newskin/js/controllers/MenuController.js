import {ComponentControllerBase} from "./BaseControllers.js";
import {SunsetMenuParser} from "../parsers/SunsetMenuParser.js";
import {SunsetMenuBuilder} from "../builders/SunsetMenuBuilder.js";

/**
 * Parses site menu from the old site and builds the new dropdown.
 */
export class MenuController extends ComponentControllerBase {

    /**
     * Object that builds the menus' HTML.
     * @type {SunsetMenuBuilder|null}
     */
    builder = null;

    /**
     * Constructor takes reference to the skin to be built.
     * @param skin {SunsetSkin} the skin to build
     */
    constructor(skin) {
        super(skin);
    }

    /**
     * Builds the menu from the old website.
     */
    build() {

        let $oldBody = this.skin.html.oldHtmlBody;
        if (!$oldBody) {
            console.error('Could not find old body');
            return;
        }

        // find insertion point
        let $megaMenu = document.querySelector('.mega-category-menu');
        if (!$megaMenu) {
            console.error('Could not load .mega-category-menu to fill menu data');
            return;
        }

        // parse the menu from the old website
        let parser = new SunsetMenuParser($oldBody);
        parser.readMenu();
        this.skin.menu = parser.menu;

        // build the menu into the new website
        let builder = this.#getBuilder()
        if (builder) {
            $megaMenu.append(builder.build());
        }
    }

    /**
     * Builds the menu for the mobile users.
     */
    buildMobileMenu() {

        //console.log('building mobile menu');

        let $menuButton = document.querySelector('.mobile-menu-btn');
        if (!$menuButton) {
            console.error('Could not find mobile menu button');
            return;
        }

        let $menu = document.querySelector('#navbarSupportedContent');
        if (!$menu) {
            console.error('Could not find mobile menu');
            return;
        }

        // build the menu html and attach it under the Categories submenu
        let builder = this.#getBuilder();
        if (!builder) {
            console.error('Could not get builder for mobile menu');
            return;
        }

        // grab insertion point.  changed to allow a different menu on mobile and desktop
        let $categorySubmenu = document.querySelector('.mobile-menu ul');
        if (!$categorySubmenu) {
            console.error('Could not find .mobile-menu ul (category mobile submenu)');
            return;
        }
/*
        let $categorySubmenu = document.querySelector('#submenu-1-3');
        if (!$categorySubmenu) {
            console.error('Could not find #submenu-1-3 (category mobile submenu)');
            return;
        }*/
        $categorySubmenu.replaceWith(builder.buildMobileMenu());

        // make mobile menu toggle when desktop toggles (css will only display one at a time)
        const $desktopMenu = document.querySelector('.desktop-menu');
        const $mobileMenuWrapper = document.querySelector('.mobile-menu');
        const $mobileMenu = $mobileMenuWrapper.querySelector('ul');
        const observer = new MutationObserver((_, __) => {
            if ($desktopMenu.classList.contains('collapse')) {
                $mobileMenu.classList.add('collapse');
            }
            else {
                $mobileMenu.classList.remove('collapse');
            }
        });
        observer.observe($desktopMenu, {attributes: true, attributeFilter: ['class']});

        // show menu with hamburger button
        $menuButton.addEventListener('click', () => {
            $menu.classList.toggle('open');
        });

        // show submenus when clicking on menu items that have submenus
        $menu.querySelectorAll('.dd-menu').forEach((element) => {
            let $submenu = element.parentElement.querySelector('.sub-menu');
            if (!$submenu) return; // ignore if no submenu
            element.addEventListener('click', () => {
                if (element.classList.contains('collapsed')) {
                    $submenu.classList.remove('collapse');
                    element.classList.remove('collapsed');
                }
                else {
                    $submenu.classList.add('collapse');
                    element.classList.add('collapsed');
                }
            });
        })
    }

    /**
     * Gets a references to the builder for the current menu data set.
     * @returns {SunsetMenuBuilder|null}
     */
    #getBuilder() {
        if (this.skin === null || this.skin.menu === null) {
            console.error('Cannot use SunsetMenuBuilder without menu data stored in this.skin.menu');
            return null;
        }

        if (!this.builder) {
            this.builder = new SunsetMenuBuilder(this.skin.menu);
        }
        return this.builder;
    }
}