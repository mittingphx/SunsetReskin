// noinspection JSUnusedLocalSymbols

/**
 * Adds event handlers that intercepts link click on every link
 * on the page, including dynamically generated links.
 *
 * Also, any HtmlElement that has the attribute "href" will be
 * treated as a link.
 */
export class LinkHandler {

    /**
     * The link callback function, which is called when a link is clicked
     * and intercepted.
     * @param $a {HTMLAnchorElement}
     */
    fnLinkCallback = ($a) => {};

    /**
     * The link filter function.  By default, all links that are not
     * javascript or a hashtag are allowed.
     * @param $a {HTMLAnchorElement}
     * @returns {boolean}
     */
    fnLinkFilter = ($a) => true;

    /**
     * The event listener currently installed, kept so that we can remove it.
     * @type {function(MouseEvent)}
     */
    #eventListener = null;

    /**
     * Constructor optionally accepts the callback and filter functions/
     * @param callback {function(HTMLAnchorElement)|null}
     * @param filter {function(HTMLAnchorElement)|null}
     */
    constructor(callback = null, filter= null) {
        if (callback) {
            this.setLinkCallback(callback);
        }
        if (filter) {
            this.setLinkFilter(filter);
        }
    }

    /**
     * Assigns the link filter function.
     *
     * The default filter is set if none is provided.
     * @param fn {function(HTMLAnchorElement)|null}
     */
    setLinkFilter(fn) {
        if (!fn) {
            fn = ($a) => true;
        }
        this.fnLinkFilter = fn;
    }

    /**
     * Assigns the link callback function, which is called with the
     * href of the clicked link when it is intercepted.
     *
     * The default callback is set if none is provided.
     * @param fn {function(HTMLAnchorElement)|null}
     */
    setLinkCallback(fn) {
        if (!fn) {
            fn = ($a) => {};
        }
        this.fnLinkCallback = fn;
    }

    /**
     * Adds an event listener to the document that intercepts link
     * clicks across the entire page, including dynamic links created
     * after this call.
     */
    addEventListener() {
        // skip if already installed
        if (this.#eventListener) {
            return;
        }

        // add the event listener
        this.#eventListener = e => {
            this.#interceptClickEvent(e);
        }
        document.addEventListener('click', this.#eventListener);
    }

    /**
     * Removes the event listener from the document.
     */
    removeEventListener() {
        // skip if not installed
        if (!this.#eventListener) {
            return;
        }

        // remove the event listener
        document.removeEventListener('click', this.#eventListener);
        this.#eventListener = null;
    }

    /**
     * Returns true if the href is a link to another webpage,
     * i.e. not javascript or a hashtag.
     * @param href {string|HTMLAnchorElement}
     * @returns {boolean}
     */
    static isPageLink(href) {
        if (href instanceof HTMLAnchorElement) {
            href = href.href;
        }
        if (typeof href !== 'string') {
            return false;
        }
        return href && !href.startsWith('javascript') && !href.startsWith('#');
    }

    /**
     * Blocks any link clicks on a page that would normally
     * go to other pages.  If the href is javascript or a
     * hashtag, it will be ignored by this handler.
     * @param e
     */
    #interceptClickEvent(e) {
        let href;
        let target = e.target;

        // exit if no target
        if (!target) {
            return;
        }

        // handle tags embedded within anchors
        if (!target.hasAttribute('href')) {
            if (target.tagName !== 'A') {
                target = target.closest('a');
            }
        }

        // exit if no link found to target
        if (!target) {
            return;
        }

        // intercept any link to another page
        if (target.tagName === 'A' || target.hasAttribute('href')) {
            href = target.getAttribute('href');
            if (LinkHandler.isPageLink(href)) {
                // if the link is not filtered out, then send it to
                // the callback instead of the browser's default.
                if (this.fnLinkFilter(target)) {
                    e.preventDefault();
                    this.fnLinkCallback(target);
                }
            }
        }
    }

}