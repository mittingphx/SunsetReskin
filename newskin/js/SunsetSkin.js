/**
 * Project: Sunset Wholesale West Website
 * File:    SunsetSkin.js
 * Author:  Scott Mitting
 * Date:    2024-05-13
 * Abstract:
 *  Top level classes for parsing and rewriting the website.
 *
 */

import {SunsetMenuItem} from "./SunsetMenuItem.js";
import {SunsetMenuParser} from "./parsers/SunsetMenuParser.js";
import {SunsetPreload} from "./SunsetPreload.js";
import {FileDetector} from "./FileDetector.js";

// launch preloader as soon as possible
let sunsetPreloader = new SunsetPreload();

/**
 * Analyzes the original HTML to figure out the contents of the menu
 * and to build a new website over top of it with a modern look-and-
 * feel.
 */
export class SunsetSkin {

    /**
     * The loaded menu data.
     * @type {SunsetMenuItem[]}
     */
    menu = [];

    /**
     * Gets set to true once the CSS styles used for this object
     * are added to the page.
     * @type {boolean}
     */
    //#styleAdded = false;

    /**
     * True iff the original menu data has been loaded into this.menu
     * @type {boolean}
     */
    #menuRead = false;

    /**
     * Constructor
     */
    constructor() {
        let fileType = FileDetector.getPageType();
        alert('fileType=' + fileType);
    }

    /**
     * Starts monitoring the page for its data and launches the
     * process to build the new webpage as soon as the data is
     * available.
     */
    apply() {
        console.log('apply()');
        this.#initEvents();
    }

    /**
     * Sets up document loading events.
     */
    #initEvents() {

        // trigger event when document.body is available
        let bodyCallback = this.onDocumentBodyReady.bind(this);
        let initInterval = setInterval(function() {
            if (document.body) {
                clearInterval(initInterval);
                bodyCallback();
            }
        }, 1);

        // trigger document.ready event
        document.addEventListener("DOMContentLoaded", this.onWebPageLoaded.bind(this));
    }

    /**
     * Triggered once document.body is available
     */
    onDocumentBodyReady() {
        this.showLoading();

    }



    /**
     * Triggered once the webpage has finished loading
     */
    onWebPageLoaded() {
        this.readMenu();
        this.buildMenuHtml();
        this.loadNewSkinPage().then(_ => {
            console.log('load webpage completed');
            sunsetPreloader.ready();
        });
    }

    /**
     * Loads the webpage index.html and replaces there current
     * page's head and body with the loaded head and body, while
     * inserting data from the old page.
     *
     * @returns {Promise<void>}
     */
    async loadNewSkinPage() {

        const response = await fetch('newskin/html/NewSkin.html');
        const html = await response.text();

        let parser = new DOMParser();
        let doc = parser.parseFromString(html, 'text/html');
        let loadedBody = doc.querySelector('body');
        let loadedHead = doc.querySelector('head');

        let oldBody = document.createElement('div');
        oldBody.innerHTML = document.body.innerHTML;
        let oldHead = document.createElement('div');
        oldHead.innerHTML = document.head.innerHTML;

        sunsetPreloader.transfer(loadedBody);

        document.head.innerHTML = loadedHead.innerHTML;
        document.body.innerHTML = loadedBody.innerHTML;//+ document.body.innerHTML;
        //if (sunsetPreloader) {
        //  sunsetPreloader.preload(); // prevent blink
        //}

        function query(el, selector, fn) {
            let results = el.querySelectorAll(selector);
            for (let i = 0; i < results.length; i++) {
                fn(results[i]);
            }
        }

        // remove preloader from old view
        query(oldBody,'#divSunsetPreloader', function(div) {
            div.remove();
        });
        query(oldBody,'.preloader', function(div) {
            div.remove();
        });


        //document.body.appendChild(loadedBody);

        //alert('hiding load');
        this.finishedLoaded = true;


        // the html for the menu should already be created by now so display oit


        // insert new menu data into menu html
        let $megaMenu = document.querySelector('.mega-category-menu');
        if (!$megaMenu) {
            console.error('Could not load .mega-category-menu to fill menu data');
        }
        else {
            $megaMenu.append(this.$menuHtml);
        }


        // show toggle so we can switch back and forth between
        // the new skin and the old skin
        const $newSkinPanel = document.querySelector('.newskin-toggle');
        const $newSkinIcon = $newSkinPanel.querySelector('i');
        const $newSkinLabel = $newSkinPanel.querySelector('b');
        let newSkinEnabled = true;

        // toggle new skin
        $newSkinPanel.addEventListener('click', function() {
            if (newSkinEnabled) {
                newSkinEnabled = false;
                $newSkinIcon.classList.remove('fa-toggle-on');
                $newSkinIcon.classList.add('fa-toggle-off');
                $newSkinLabel.innerText = 'Classic Look';

                document.head.innerHTML = oldHead.innerHTML;
                document.body.innerHTML = oldBody.innerHTML;//+ document.body.innerHTML;
            }
            else {
                newSkinEnabled = true;
                $newSkinIcon.classList.remove('fa-toggle-off');
                $newSkinIcon.classList.add('fa-toggle-on');
                $newSkinLabel.innerText = 'New Skin Enabled';

                document.head.innerHTML = loadedHead.innerHTML;
                document.body.innerHTML = loadedBody.innerHTML;//+ document.body.innerHTML;
            }
        });
    }

    /**
     * Shows the loading message.
     */
    showLoading() {

        // don't show load screen if we've already finished
        if (this.finishedLoaded) return;

        // show the preloader's loading screen
        if (sunsetPreloader) {
            sunsetPreloader.preload();
        }
    }


    /**
     * Builds the HTML menu from the menu data loaded from the old
     * webpage html.
     */
    buildMenuHtml() {
        console.log('buildMenuHtml()');
        this.$menuHtml = this.#buildMenuNode(this.menu);
    }

    /**
     * Recursively builds the HTML for the menu.
     * @param itemList {SunsetMenuItem[]}
     * @param childDepth {number} how many levels of children deep
     * @returns {HTMLUListElement}
     */
    #buildMenuNode(itemList, childDepth) {

        // TODO: this needs to have multiple-levels of
        // depth so the menus popup at each depth

        //console.log({ itemList: itemList, isChild: isChild, depth: depth});

        // default depth is zero
        if (!childDepth) {
            childDepth = 0;
        }

        // determine class to use at this depth
        if (!this._depthClasses) {
            this._depthClasses = [
                'sub-category',
                'inner-sub-category',
                'inner-sub-2-category',
                'inner-sub-3-category',
                'inner-sub-4-category'
            ];
        }
        if (childDepth >= this._depthClasses.length) {
            childDepth = this._depthClasses.length - 1;
        }
        //console.log('depth=' + depth + ' class=' + this._depthClasses[depth]);
        let cssClass = this._depthClasses[childDepth];



        let $ul = document.createElement('ul');
        //$ul.classList.add(isChild ? 'inner-sub-category' : 'sub-category');
        $ul.classList.add(cssClass);
        for (let i = 0; i < itemList.length; i++) {
            let $li = document.createElement('li');
            if (itemList[i].children.length <= 0) {
                $li.innerHTML = `<a href="${itemList[i].link}">${itemList[i].text}</a>`;
            }
            else {
                let $subUl = this.#buildMenuNode(itemList[i].children, childDepth + 1);
                $li.innerHTML = `<a href="${itemList[i].link}">${itemList[i].text} <i class="lni lni-chevron-right"></i></a>`;
                $li.appendChild($subUl);
            }
            $ul.appendChild($li);
        }
        return $ul;
    }

    /**
     * See swwest_menu.html for a copy of the structure from the old website.
     */
    readMenu() {

        // allow this to be called once
        if (this.#menuRead) return;
        this.#menuRead = true;

        console.log('readMenu()');




        this.log = [];

        // grab the parent
        const $menu = document.querySelector('#Menu')
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
            this.log.push('parsing menu #' + i);
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
                let nodeParents = SunsetMenuParser.getMenuNodeMainElements(child.$node, 'table', 'div');
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
                    let childNodeParents = SunsetMenuParser.getMenuNodeMainElements(grandChild.$node, 'table', 'div');
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
                        let grandChildNodeParents = SunsetMenuParser.getMenuNodeMainElements(greatGrandChild.$node, 'table', 'div');
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

            const escapeHtml = (unsafe) => {
                return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
            }

            this.log.push('<b>thisSubMenu</b>:<br><pre>' + escapeHtml($thisSubmenu.outerHTML) + '</pre>');
            this.log.push('<b>nextElementSibling</b>:<br><pre>' +escapeHtml($thisSubmenu.nextElementSibling.outerHTML) + '</pre>');
            this.log.push('<hr>');

            this.menu.push(topMenuItem);
        }

    }
}
