// noinspection JSUnusedGlobalSymbols

/**
 * Helper methods for dealing with searches on the website.
 */
export class SiteSearch {

    /**
     * Handles forwarding to the search to the real search bar in the
     * hidden original page.
     */
    static handleSearch() {

        let searchTerm = document.querySelector('#search').value;
        console.log('handleSearch() searchTerm: ' + searchTerm);

        // https://swwest.com/ItemSearch.aspx?Search=esko+leaf
        document.location = 'ItemSearch.aspx?Search=' + encodeURIComponent(searchTerm);
    }

    /**
     * Returns true iff the current page is showing search results.
     * @returns {boolean}
     */
    static isSearchResult() {
        let url = '' + document.location;
        return url.indexOf('?Search=') !== -1;
    }

    /**
     * Returns the search term from the current page's url.
     * @returns {string|null}
     */
    static getSearchTerm() {
        let url = '' + document.location;
        let searchStart = url.indexOf('?Search=');
        if (searchStart === -1) return null;
        searchStart += '?Search='.length;
        let searchEnd = url.indexOf('&', searchStart);
        if (searchEnd === -1) {
            searchEnd = url.length;
        }
        return url.substring(searchStart, searchEnd);
    }

    /**
     * Assigns event listeners to the search controls.
     */
    static setupSearchControls() {

        let $searchBtn = document.querySelector('.search-btn button');
        if ($searchBtn) {
            $searchBtn.addEventListener('click', () => {
                SiteSearch.handleSearch();
            });
        }
        else {
            console.warn('Could not find search button on reskin page');
        }

        let $searchInput = document.querySelector('#search');
        if ($searchInput) {
            $searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    SiteSearch.handleSearch();
                }
            });
        }
        else {
            console.warn('Could not find search input on reskin page');
        }
    }
}