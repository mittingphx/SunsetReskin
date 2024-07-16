import {PageLoadHelper} from "./PageLoadHelper.js";

/**
 * Helper classes for running ASP.net post-backs in the background.
 */
export class AspNetPostback {

    /**
     * When true the hidden iframe is visible
     * @type {boolean}
     */
    static SHOW_DEBUG = true;

    /**
     * Loads a page from the old site into a hidden iframe in the
     * background and searches for the <a> link we passed in then does
     * an ASP.net ServerClick on it, sending the callback references
     * to the WindowProxy that executed the ServerClick and the hidden
     * <iframe> it is executing on.
     *
     * If no link is passed in, then the initial page load is sent to the callback
     *
     * @param url {string} url that has the postback to run
     * @param $link {HTMLAnchorElement} the link we want to .net ServerClick on a page in the background (optional)
     * @param callback {WindowProxy, HTMLIFrameElement, function(*)} called when the postback is done
     */
    static runInBackground(url, $link, callback) {

        // get postback call
        let jsPostback = $link && $link.href;

        // use old site's form for editing shipping addresses
        PageLoadHelper.fetchIntoHiddenIframe('Login/MyAccount.aspx?reskin=no',
            (wnd, html, iframe) => {

                // inject a script to run the postback statement on this hidden iframe
                if (jsPostback) {
                    let newScript = AspNetPostback.createAnchorPostbackInjectionScript(jsPostback);
                    html = html.replace('</body>', newScript.outerHTML + "</body>");
                }
                html = PageLoadHelper.removeNewSkinScripts(html);

                // write to the new window
                wnd.document.open();
                wnd.document.write(html);
                wnd.document.close();

                // for debugging, uncomment to show hidden iframe
                iframe.style.display = AspNetPostback.SHOW_DEBUG ? 'block' : 'none';

                // callback immediately if no postback
                if (!jsPostback) {
                    callback(wnd, iframe);
                    return;
                }

                // wait until page loads after postback
                PageLoadHelper.waitUntilPageChange(wnd, async _ => {
                    // inputs we want are missing if we don't wait long enough
                    setTimeout(() => { callback(wnd, iframe); }, 250);
                });
            });
    }

    /**
     * Creates a <script> tag that clicks the <a> tag that has
     * the href exactly equal to jsPostback, which should be a
     * postback known to exist on that page.
     * @param jsPostback {string} a .net postback string, e.g. javascript:__doPostBack('ctl00$MainContent$GridShipToAddresses','CustomEdit$0')
     * @return {HTMLScriptElement}
     */
    static createAnchorPostbackInjectionScript(jsPostback) {
        let newScript = document.createElement('script');
        newScript.innerHTML =` // click the link that has the postback we want to run
                let aList = document.querySelectorAll('a');
                let found = false;
                for (let a of aList) {
                    if (a.href === "${jsPostback}") {
                        try {
                            found = true;
                            a.click();
                        }
                        catch (ex) {
                            console.error(ex);
                        }
                    }
                }
                if (!found) {
                    console.error("could not find the link from the inner hidden iframe!!!");
                }
            `;
        return newScript;
    }

}