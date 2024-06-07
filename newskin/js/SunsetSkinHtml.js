/**
 * Project: Sunset Wholesale West Website
 * File:    SunsetSkinHtml.js
 * Author:  Scott Mitting
 * Date:    2024-05-20
 * Abstract:
 *  Handles loading HTML for the new skin.
 *
 */

import {TimedMemoizer} from "./util/TimedMemoizer.js";
import {UrlHelper} from "./UrlHelper.js";

/**
 * Uses the window title to display messages for advanced users.
 */
export class WindowTitleAlert {

    /**
     * Singleton instance of this object.
     * @type {WindowTitleAlert}
     */
    static #instance = new WindowTitleAlert();

    /**
     * The title to change the window back to.
     * @type {string|null}
     */
    #oldTitle = null;

    /**
     * The handle to the timeout for the window title message.
     * @type {number|null}
     */
    #windowTitleMessageTimeout = null;

    /**
     * Changes the window title for 5 seconds to provide a confirmation to advance-level users.
     * @param msg {string} message to display
     */
    static showMessage(msg) {
        WindowTitleAlert.#instance.#showMessageInWindowTitle(msg);
    }

    /**
     * Instance method to display the message in the window title.
     * You should use the static method instead.
     * @param msg {string}
     */
    #showMessageInWindowTitle(msg) {

        console.log(msg);

        // check if we are already restoring the title message,
        // so we restore it to that one instead of another message
        // we displayed in the last 5 seconds
        if (this.#windowTitleMessageTimeout) {
            clearTimeout(this.#windowTitleMessageTimeout);
            this.#windowTitleMessageTimeout = null;
        }
        else {
            this.#oldTitle = document.title;
        }

        // set the title to the newest message but restore it in 5
        // seconds from now to whatever the original title was
        document.title = msg;
        this.#windowTitleMessageTimeout = setTimeout(_ => {
            document.title = this.#oldTitle;
            this.#oldTitle = null;
            this.#windowTitleMessageTimeout = null;
        }, 5000);
    }
}

/**
 * Stores the old and new HTML sections of the website.
 */
export class SunsetSkinHtml {

    /**
     * The <head> section before skin changes.
     * @type {HTMLDivElement | null}
     */
    oldHtmlHead = null;

    /**
     * The <body> section before skin changes.
     * @type {HTMLDivElement | null}
     */
    oldHtmlBody = null;

    /**
     * The <head> section after skin changes.
     * @type {HTMLHeadElement|null}
     */
    newHtmlHead = null;

    /**
     * The <body> section after skin changes.
     * @type {HTMLBodyElement|null}
     */
    newHtmlBody = null;

    /**
     * The entire DOM of the new template file
     * @type {Document|null}
     */
    newHtmlDocument = null;

    /**
     * Header shared across all pages, which is automatically inserted
     * into all loaded template pages.
     * @type {HTMLElement|null}
     */
    header = null;

    /**
     * Footer shared across all pages just like the header.
     * @type {HTMLElement|null}
     */
    footer = null;

    /**
     * Function that gets called when a 404 is encountered.  Can be replaced
     * by a custom handler.
     * @param response {Response}
     */
    on404 = response => { alert('Page Not Found: ' + response.url); };

    /**
     * The event handler for monitoring the page scrolling.
     * @type {null}
     */
    #scrollListener = null;

    /**
     * Enable/disable the over-shoot scrolling listener.
     * @type {boolean}
     */
    #scrollListenerEnabled = true;

    /**
     * Constructor saves copy of current webpage.
     */
    constructor() {
        this.oldHtmlBody = document.createElement('div');
        this.oldHtmlHead = document.createElement('div');
        this.oldHtmlBody.innerHTML = document.body.innerHTML;
        this.oldHtmlHead.innerHTML = document.head.innerHTML;
        this.oldHtmlBody.style.display = 'none';

    }

    /**
     * Loads a page from the old website, so we can extract data from it
     * and read the new template without actually navigating to a new page,
     * causing a bunch of flicker.
     * @param oldUrl {string}
     * @returns {Promise<boolean>}
     */
    async loadOld(oldUrl) {

        const response = await fetch(oldUrl);
        if (response.status !== 200) {
            console.error('HTTP Error ' + response.statusText + ' while loading old html: ' + oldUrl);
            this.on404(response);
            return false;
        }

        const htmlContents = await response.text();
        const parsedDocument = new DOMParser().parseFromString(htmlContents, 'text/html');
        this.oldHtmlBody.innerHTML = parsedDocument.body.innerHTML;
        this.oldHtmlHead.innerHTML = parsedDocument.head.innerHTML;
        this.oldHtmlBody.style.display = 'none';


        // hack to block white space at bottom of page from being visible
        this.addScrollListener()
        this.addKeyListener();

        return true;
    }

    /**
     * Loads the html template for the new skin from the given url.
     * @param newSkinUrl {string} the url of the new skin
     * @returns {Promise<void>}
     */
    async load(newSkinUrl) {
        let deployment = UrlHelper.getDeployment();
        console.log('load() ' + newSkinUrl + ' deployment=' + deployment);


        let headerIndex = -1;
        let footerIndex = -1;
        let templateIndex;

        // gather files to load
        let urls = [];
        if (!this.header) {
            urls.push('newskin/html/header.html');
            headerIndex = urls.length - 1;
        }
        if (!this.footer) {
            urls.push('newskin/html/footer.html');
            footerIndex = urls.length - 1;
        }
        urls.push(newSkinUrl);
        templateIndex = urls.length - 1;

        // make the relative urls be based on the root of the website
        for (let i = 0; i < urls.length; i++) {
            if (!urls[i].startsWith('http')) {
                //urls[i] = UrlHelper.makeRelativeUrl(urls[i]);
                //urls[i] = UrlHelper.makeAbsoluteUrl(urls[i]);
                urls[i] = new URL(urls[i], deployment).href;
            }
        }

        // load the template files in parallel
        const responses = await Promise.all(urls.map(url => fetch(url)));
        const htmlContents = await Promise.all(responses.map(response => response.text()));
        const documents = htmlContents.map(html => new DOMParser().parseFromString(html, 'text/html'));

        // load header if needed
        if (headerIndex >= 0) {
            this.header = documents[headerIndex].querySelector('header');
        }

        // load footer if needed
        if (footerIndex >= 0) {
            this.footer = documents[footerIndex].querySelector('footer');
        }

        // load template if needed
        if (templateIndex >= 0) {
            this.newHtmlDocument = documents[templateIndex];
        }

        // fix relative stylesheet links when in a sub-folder
        if (this.newHtmlDocument) {
            this.newHtmlDocument.querySelectorAll('link').forEach(link => {
                let originalLink = link.getAttribute('href');
                if (link.href.indexOf('cloudflare.com') >= 0) {
                    return;
                }
                link.href = UrlHelper.makeAbsoluteUrl(originalLink);
                /*
                let relativeLink = UrlHelper.makeRelativeUrl(originalLink);
                //console.log('mapping <link>: ' + originalLink + ' -> ' + relativeLink);
                if (relativeLink === originalLink) {
                    return;
                }
                link.href = relativeLink;
                 */
            });
        }

        // use new template with header inserted
        let $newHeader = this.newHtmlDocument.querySelector('header');
        if ($newHeader) {
            $newHeader.replaceWith(this.header);
        }
        let $newFooter = this.newHtmlDocument.querySelector('footer');
        if ($newFooter) {
            $newFooter.replaceWith(this.footer);
        }
        this.replaceDocument(this.newHtmlDocument);

        // if the query has mode=window then we hide the header and footer
        if (window.location.search.indexOf('mode=window') >= 0) {
            document.body.classList.add('popup-mode');
        }

        // by changing the base url to the deployment location, all the
        // references that are relative to the base continue to work even
        // when in sub-folders like login/ and admin/.
        let base = document.createElement('base');
        base.href = UrlHelper.getDeployment();
        document.head.prepend(base);

        // if we're on the dev server, add a bunch of test links
        if (UrlHelper.isLocalhost) {
            let testLinks = document.createElement('div');
            testLinks.innerHTML = `
                <a href="swwest_detail.html">test detail</a>
                <a href="swwest_category.html">test category</a>
                <a href="swwest_cart.html">test cart</a>
                <a href="swwest_copy.html">test front page</a>
                <a href="swwest_login.html">test login</a>
            `;
            document.querySelector('.nav-social').appendChild(testLinks);
            UrlHelper.mapLinks(testLinks);
        }
    }

    /**
     * Toggles between the old and new HTML.
     * @param set {string} either 'new' or 'old'
     */
    toggle(set) {
        if (set === 'new') {
            document.head.innerHTML = this.newHtmlHead.innerHTML;
            document.body.innerHTML = this.newHtmlBody.innerHTML;

            // TESTING attaching old html to keep it active

            // still getting error: Form submission canceled because the form is not connected
            // so adding header too
            //this.oldHtmlHead.setAttribute('id', 'old_html_head');
            //document.head.appendChild(this.oldHtmlHead);
            this.oldHtmlBody.setAttribute('id', 'old_html_body');
            document.body.appendChild(this.oldHtmlBody);

            //this.runScripts(this.newHtmlBody);
        }
        else if (set === 'old') {
            document.head.innerHTML = this.oldHtmlHead.innerHTML;
            document.body.innerHTML = this.oldHtmlBody.innerHTML;
        }
        else {
            console.error('unknown set: ' + set);
        }
    }

    /**
     * Executes all javascript <script> tags within the given element.
     *
     * In order to get this to work, we will be loading each of the
     * <script> tags with src using fetch and then eval()ing the content.
     * Embedded javascript content will be executed directly as well and
     * both will be executed in the order it appears.  The source will
     * not contain any <script> tags.
     *
     * @param element {HTMLElement}
     */
    async runScripts(element) {
        // NOTE: this is currently disabled

        // get all the javascript that needs loaded
        let loadPlan = [];
        let references = [];
        let scripts = element.querySelectorAll('script');
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].src) {
                let obj = {url: scripts[i].src};
                loadPlan.push(obj);
                references.push(obj);
            }
            else {
                loadPlan.push({content: scripts[i].innerHTML});
            }
        }

        // fetch each of the javascript files asynchronously
        await Promise.all(
            references.map(script => fetch(script.url)
                .then(response => response.text())
                .then(text => script.content = text))
            );

        // execute the javascript in the order it appears
        for (let i = 0; i < loadPlan.length; i++) {
            if (loadPlan[i].content) {
                try {
                    if (loadPlan[i].url) {
                        console.log('running src=' + loadPlan[i].url);
                    }
                    else {
                        console.log('running inline script');
                    }
                    eval(loadPlan[i].content);
                }
                catch (ex) {
                    console.error('failed to run script\nexception: ' + ex + '\nscript: ' + loadPlan[i].content);
                }
            }
        }

    }

    /**
     * Replaces the head and body of the current document with a new one.
     * @param doc {Document}
     */
    replaceDocument(doc) {

        // remove base tag from head, which is used for relative links
        // within the templates so the IDE works correctly
        let baseTag = doc.querySelector('base');
        if (baseTag) {
            baseTag.remove();
        }

        // grab head and body from loaded document
        this.newHtmlBody = doc.querySelector('body');
        this.newHtmlHead = doc.querySelector('head');

        // replace old document with new
        this.toggle('new');

        // hack to block white space at bottom of page from being visible
        this.addScrollListener();
        this.addKeyListener();
    }

    /**
     * Adds scroll listener to prevent over-scrolling and a hot-key to disable it.
     */
    addScrollListener() {

        // last element of the page
        const $footer = document.querySelector('footer');
        if (!$footer) {
            console.error('Could not find footer to add scroll listener to');
            return;
        }

        // how far down to scroll, automatically updated when the
        // window's dimensions or body's content changes
        let maxScroll = new TimedMemoizer(() => {
            const windowHeight = window.innerHeight;
            const bodyHeight = $footer.offsetTop + $footer.offsetHeight
            return bodyHeight - windowHeight;
        }, 100);

        // remove old handler if needed
        if (this.#scrollListener) {
            window.removeEventListener('scroll', this.#scrollListener);
            this.#scrollListener = null;
        }

        // scrolling event handler
        this.#scrollListenerEnabled = true;
        this.#scrollListener = () => {
            if (!this.#scrollListenerEnabled) return;
            if (window.scrollY > maxScroll.get()) {
                window.scrollTo({
                    top: maxScroll.get(),
                    behavior: 'instant'
                });
            }
        };
        window.addEventListener('scroll', this.#scrollListener);

    }

    /**
     * Adds keyboard event handlers.
     */
    addKeyListener() {

        let lastKey = null;
        let $hiddenDiv = this.#findHiddenOldBody();
        window.addEventListener('keydown', (e) => {
            // toggle over-scroll checking enabled with hot-key
            if (e.key === 'Escape' && e.key === lastKey) {
                lastKey = null;
                this.#scrollListenerEnabled = !this.#scrollListenerEnabled;
                WindowTitleAlert.showMessage('Over-scroll check ' + (this.#scrollListenerEnabled ? 'enabled' : 'disabled'));
            }
            // toggle making the old page visible
            else if (e.key === '`' && e.key === lastKey) {
                lastKey = null;
                if ($hiddenDiv) {
                    $hiddenDiv.style.display = $hiddenDiv.style.display === 'none' ? 'block' : 'none';
                    WindowTitleAlert.showMessage('Old page: ' + ($hiddenDiv.style.display === 'none' ? 'hidden' : 'visible'));
                }
            }
            else {
                lastKey = e.key;
            }
        });
    }

    /**
     * Returns the old page's hidden element by searching the DOM
     * rather than relying on a reference from a previous page loud.
     * @returns {HTMLDivElement|null}
     */
    #findHiddenOldBody() {
        let $body = document.body;
        let children = $body.children;
        for (let i = children.length - 1; i >= 0; i--) {
            if (children[i].tagName !== 'DIV') continue;
            if (!children[i].style) continue;
            if (children[i].style.display !== 'none') continue;
            return children[i];
        }
        return null;
    }


    /**
     * Removes HTML elements from the old document.
     * @param selector {any}
     */
    removeElementsFromOld(selector) {
        let results = this.oldHtmlBody.querySelectorAll(selector);
        for (let i = 0; i < results.length; i++) {
            results[i].remove();
        }
    }
}
