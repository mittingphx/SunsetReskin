// noinspection HtmlUnknownTarget,JSUnusedGlobalSymbols

import {UrlHelper} from "../UrlHelper.js";

/**
 * Utility functions for detecting when the hidden page is ready to be used.
 */
export class PageLoadHelper {

    /**
     * @typedef {function} HiddenIframeCallback
     * @param wnd {WindowProxy} the new window
     * @param html {string} the loaded contents for the new window
     * @param iframe {HTMLIFrameElement} the new iframe containing the window
     */

    /**
     * Loads url using fetch and opens a hidden iframe so the callback can
     * modify the page before it is inserted.
     * @param url {string} relative url under the current deployment
     * @param callback {HiddenIframeCallback} callback to call once the page is ready
     */
    static fetchIntoHiddenIframe(url, callback) {

        // clean up the url
        let fetchUrl = new URL(url, UrlHelper.getDeployment()).href

        // loading page into window using fetch instead of iframe src
        fetch(fetchUrl)
            .then(response => response.text())
            .then(html => {

                // open a new hidden iframe for the request
                let iframe = document.createElement('iframe');
                iframe.classList.add('login-iframe');
                document.body.appendChild(iframe);

                // pass the window and html to the callback
                callback(iframe.contentWindow, html, iframe);
            });
    }

    /**
     * Removes all <script> tags pointing to NewSkin.js
     * @param html {string} page html
     * @return {string}
     */
    static removeNewSkinScripts(html) {
        html = html.replace('<script type="module" src="/reskin/NewSkin.js"></script>', '');
        html = html.replace('<script type="module" src="NewSkin.js"></script>', '');
        return html;
    }

    /**
     * Sets an interval that keeps checking if a page has loaded
     * and calls a callback once it's ready.
     * @param wnd {Window} window to wait for
     * @param callback {function} callback to call once the page is ready
     */
    static waitUntilPageReady = (wnd, callback) => {

        // wait until window can receive an injected script
        let interval = setInterval(_ => {

            // wait for window to load
            if (!wnd || !wnd.document || !wnd.document.body) {
                return;
            }

            // wait until there's actually something in the body;
            if (wnd.document.body.innerText.length === 0) {
                return;
            }

            // stop waiting
            clearInterval(interval);

            // do callback
            callback(wnd);
        });
    };

    /**
     * Waits until the page changes and calls a callback when it does.
     * @param wnd {Window} window to wait for
     * @param callback {function} callback to call once the page is ready
     */
    static waitUntilPageChange(wnd, callback) {

        let oldUrl = wnd.location.href;
        let oldTitle = wnd.document.title;

        let interval = setInterval(async _ => {
            if (wnd.location.href === oldUrl) {
                return;
            }
            console.log('window title = ' + wnd.document.title
                + ' location=' + wnd.location.href
                + ' old=' + oldUrl
                + ' oldTitle=' + oldTitle
            );
            clearInterval(interval);

            // close the temporary window
            if (wnd) {
                wnd.close();
            }

            // do callback
            callback(wnd);

        });

    }
}