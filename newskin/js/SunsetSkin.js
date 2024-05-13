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
import {SunsetMenuParser} from "./SunsetMenuParser.js";
import {SunsetPreload} from "./SunsetPreload.js";

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
        // TODO: add event handler to detect the end of page load
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

        const response = await fetch('NewSkin.html');
        const html = await response.text();

        //alert(html);
        //console.log(html);


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

        /*


                // hide this loaded page's preloader
                // THIS COULD SHOULD BE REENABLED IF WE BRING BACK THE PRELOADER
                // FROM THE ShopGrid TEMPLATE
                setTimeout(function () {
                    let $preloader = document.querySelector('.preloader');
                    if ($preloader) $preloader.remove();
                }, 50);
        */


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

        // TESTING: making copy of toggle
        //oldBody.appendChild($newSkinPanel);

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
     * Resets all flags so the page data can be loaded again.
     */
    /*
    clearFlags() {
        this.#menuRead = false;
        this.#styleAdded = false;
    }
    */

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


        // read the menus within each section
        //this.#printStats();
    }

    /**
     * Draws the panel in the top right that display debugging
     * information.
     */
    /*
    #printStats() {
        //console.log(this.menu);

        function toggleDiv($div) {
            if ($div.style.display === 'none') {
                $div.style.display = 'block';
            }
            else {
                $div.style.display = 'none';
            }
        }

        this.#addStyles();

        // grab where to shove content
        const $body = document.querySelector('body');

        // create debug container
        const $debug = document.createElement('div');
        $debug.classList.add('debugNote');
        $body.appendChild($debug);

        // add close button in a toolbar
        const $toolbar = document.createElement('div');
        $toolbar.classList.add('debugToolbar');
        $debug.appendChild($toolbar)

        let me = this;

        const $link2 = document.createElement('a');
        $link2.innerText = 'Menu Log'
        $link2.addEventListener('click', function(_) {
            toggleDiv(me.$menuLog);
        });
        $toolbar.appendChild($link2);

        const $link3 = document.createElement('a');
        $link3.innerText = 'Menu List'
        $link3.addEventListener('click', function(_) {
            toggleDiv(me.$menuListData);
        });
        $toolbar.appendChild($link3);


        const $btnClose = document.createElement('button');
        $btnClose.classList.add('debugButton', 'closeButton');
        $btnClose.innerText = 'x';
        $btnClose.onclick = (_) => {
          $debug.style.display = 'none';
        };
        $toolbar.appendChild($btnClose);

        const $txtTitle = document.createElement('p');
        $txtTitle.innerText = 'New Skin Log';
        $toolbar.appendChild($txtTitle);

        const $divClear = document.createElement('div')
        $divClear.classList.add('clear');
        $toolbar.appendChild($divClear);

        const $code2 = document.createElement('pre');
        $debug.appendChild($code2);
        $code2.innerHTML = this.toMenuList(this.menu);
        this.$menuListData = $code2;

        // separator
        $debug.appendChild(document.createElement('hr'));

        // print out debug log
        const $log = document.createElement('div');
        $debug.appendChild($log);
        $log.innerHTML = this.log.join();
        this.$menuLog = $log;
    }
    */


    /**
     * Prints out the menu in hunan readable format.
     * @param menu
     */
    /*
    toMenuList(menu) {


         // Returns a new string with a repeating character.
         // @param char {string} character to repeat
         // @param count {number} how many times to repeat char
         // @returns {string} the new string
        function repeat(char, count) {
            let ret = '';
            for (let i = 0; i < count; i++) {
                ret += char;
            }
            return ret;
        }


         // Outputs the contents of the menu, looking at the text and
         // link fields, and then recursively lists the children
         // property.
         // @param menuArray the array data to show
         // @param depth how many tabs to show before each line
         // @returns {string} a multi-line string showing the array's data

        function recurseMenu(menuArray, depth) {
            if (depth === null) depth = 0;
            let tabs = repeat('\t', depth);
            let ret = '';
            for (let i = 0; i < menuArray.length; i++) {
                let item = menuArray[i];
                ret += `${tabs}${item.text} [${item.link}]\n`;
                if (item.children.length > 0) {
                    ret += recurseMenu(item.children, depth + 1);
                }
            }
            return ret;
        }

        let ret = 'menu:\n';
        ret += recurseMenu(menu, 1);
        ret = ret.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
        ret = ret.replace(/\n/g, '<br>\n');
        return ret;
    }
*/

    /**
     * Adds CSS classes used by this object to the head.
     */
    /*
    #addStyles() {

        // allow this to be called once
        if (this.#styleAdded) return;
        this.#styleAdded = true;

        // create the CSS classes
        let style = document.createElement('style');
        style.innerHTML = `
            .debugNote {
                background: #ffcc44;
                color: black;
                border: 2px solid #886622;
                border-bottom-style: none;
                position: fixed;
                right: 25px; bottom: 0;
                width: 35%; height: 25%;
                max-width: 1000px; max-height: 800px;
                overflow: auto;
                z-index: 1000;
            }

            .debugButton {
                background: black;
                border: 1px solid white;
                margin: 3px;
                color: white;
                padding: 5px;
                border-radius: 5px;
            }

            .closeButton {
                float: right;
            }

            .debugButton:hover {
                background: white;
                border: 1px solid black;
                margin: 3px;
                color: black;
                padding: 3px;
            }

            .debugToolbar {
                background: rgba(50,50,50, 45%);
                color: white;
                padding 5px;
            }

            .debugToolbar p {
                padding: 3px;
                font-size: 15pt;
                font-weight: bold;
                font-family: arial;
                margin: 0;
                padding-left: 10px;
            }

            .debugToolbar a {
                color: black;
                margin: 5px;
                font-weight: bold;

                cursor: pointer;
            }

            .debugToolbar a:hover {
                background-color: yellow;
            }

            .clear {
                clear:both;
            }


            .loading-screen {
                position: fixed;
                left: 0; top: 0;
                width: 100%; height: 100%;
                color: black;
                background: rgba(0,0,0,0.5);
                z-index: 500;
            }

            .loading-screen p {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 75pt;
                font-family: serif;
                color: white;
                text-shadow: rgb(0,0,255,0.8) 2px 2px 5px;
            }
        `;
        document.getElementsByTagName('head')[0].appendChild(style);
    }

     */
}
