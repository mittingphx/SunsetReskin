/**
 * Project: Sunset Wholesale West Website
 * File:    SunsetMenuItem.js
 * Author:  Scott Mitting
 * Date:    2024-05-13
 * Abstract:
 *  Model classes representing the menu in memory.
 */

/**
 * Object representing one link on the Sunset Wholesale West website
 * menu, including its children.
 */
export class SunsetMenuItem {

    /**
     * The display text for this menu item.
     * @type {string}
     */
    text = '';

    /**
     * The href link for this menu item.
     * @type {string}
     */
    link = '';

    /**
     * The child menu items under this item.
     * @type {SunsetMenuItem[]}
     */
    children = [];

    /**
     * True iff this item was loaded successfully.
     * @type {boolean}
     */
    loaded = false;

    /**
     * The node this data was extracted from
     * TODO: is this needed anymore?
     * @type {HTMLElement|null}
     */
    $node = null;

    /**
     * Constructor optionally takes the DOM element to read its
     * menu data from.
     * @param [$node] {HTMLElement}
     * @param [skipLinkFromParent=false] when true we don't try to read the parent's href
     */
    constructor($node, skipLinkFromParent) {
        if ($node) {
            this.readFromNode($node, skipLinkFromParent);
        }
    }

    /**
     * Reads the data for this link from an HTML element.
     * @param $node {HTMLElement} DOM element to read from
     * @param [skipLinkFromParent=false] {boolean} when true we don't try to read the parent's href
     * @returns {boolean} returns true iff the menu item was read successfully.
     */
    readFromNode($node, skipLinkFromParent) {


        //
        // Converts https://domain.com/page to /page
        //
        function makeLinkRelative(url) {
            let protocolEnd = url.indexOf('://');
            if (protocolEnd === -1) return url;
            let domainEnd = url.indexOf('/', protocolEnd + 3);
            if (domainEnd === -1) return url;
            return url.substring(domainEnd);
        }

        let $originalNode = $node;

        // find target link if node we're looking for wasn't passed directly
        if (!$node.matches('.menuNode')) {
            $node = $node.querySelector('.menuNode');
        }

        // if the query failed, assume we're pulling from the supplied node's text directly

        // make sure we have the text of the link
        if ($node === null || !$node.matches('div.menuNode')) {
            $node = $originalNode;
        }

        // fill this record from the DOM node
        this.text = $node.innerText;
        if (!skipLinkFromParent) {
            if ($node.parentElement) {
                this.link = $node.parentElement.getAttribute('href');
                this.link = makeLinkRelative(this.link);
            }
        }
        this.children = [];
        this.$node = $node;

        this.loaded = true;
        return true;
    }
}
