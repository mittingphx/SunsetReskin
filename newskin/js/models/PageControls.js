
/**
 * All available pages controls from the old page.
 */
export class PageControls {

    /**
     * Link to the previous page
     * @type {PageControlLink|null}
     */
    prevLink = null;

    /**
     * Link to the next page
     * @type {PageControlLink|null}
     */
    nextLink = null;

    /**
     * Link to the current page
     * @type {PageControlLink|null}
     */
    currentLink = null;

    /**
     * Links to specific pages
     * @type {PageControlLink[]}
     */
    pages = [];

    /**
     * Returns the last link of type page.
     * @return {PageControlLink|null}
     */
    getLastPageLink() {
        let ret = null;
        for (let i = 0; i < this.pages.length; i++) {
            if (this.pages[i].type === 'page') {
                ret = this.pages[i];
            }
        }
        return ret;
    }

    /**
     * Returns the link of type current
     * @return {PageControlLink|null}
     */
    getCurrentPageLink() {
        for (let i = 0; i < this.pages.length; i++) {
            if (this.pages[i].type === 'current') {
                return this.pages[i];
            }
        }
        return null;
    }

    /**
     * Returns the current items per page setting.
     * @return {number}
     */
    getItemsPerPage() {
        let $ddl = document.querySelector('#itemsPerPage');
        return $ddl ? parseInt($ddl.value) : 108;
    }
}

/**
 * One link within the set of paging controls.
 */
export class PageControlLink {

    /**
     * The reference to the DOM element
     * @type {HTMLAnchorElement|null}
     */
    $dom = null;

    /**
     * The page number this link refers to.
     * @type {number}
     */
    pageNumber = 0;

    /**
     * The text of the link
     * @type {string}
     */
    text = '';

    /**
     * The type of page link.  Allowed values are 'prev', 'next', 'current', 'page'
     * @type {string}
     */
    type = 'page';

    /**
     * @param $dom {HTMLAnchorElement}
     */
    constructor($dom) {
        this.$dom = $dom;
        this.parse();
    }

    /**
     * Parses the properties from the DOM element.
     */
    parse() {
        if (this.$dom.classList.contains('aspNetDisabled')) {
            this.type = 'current';
        }
        else if (this.$dom.id.indexOf('Prev') > -1) {
            this.type = 'prev';
        }
        else if (this.$dom.id.indexOf('Next') > -1) {
            this.type = 'next';
        }
        else {
            this.type = 'page';
        }
        this.text = this.$dom.textContent;

        if (this.type === 'page' || this.type === 'current') {
            this.pageNumber = parseInt(this.$dom.textContent);
        }
    }
}
