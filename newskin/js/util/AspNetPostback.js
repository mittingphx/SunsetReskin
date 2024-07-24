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
     * @param $link {HTMLAnchorElement|HTMLButtonElement|HTMLInputElement} the link we want to .net ServerClick on a page in the background (optional)
     * @param callback {WindowProxy, HTMLIFrameElement, function(*)} called when the postback is done
     * @param preWriteHtml {function(string)} optional function to modify the html before it is written (optional)
     */
    static runInBackground(url, $link, callback, preWriteHtml = null) {

        // get postback call
        let jsPostback = null;
        if ($link) {
            if ($link instanceof HTMLAnchorElement) {
                jsPostback = $link.href;
            } else if ($link instanceof HTMLButtonElement) {
                jsPostback = $link.onclick;
            } else if ($link instanceof HTMLInputElement) {
                jsPostback = $link.onclick;
            }
        }

        // use old site's form for editing shipping addresses
        PageLoadHelper.fetchIntoHiddenIframe('Login/MyAccount.aspx?reskin=no',
            (wnd, html, iframe) => {

                // inject a script to run the postback statement on this hidden iframe
                if (jsPostback) {
                    let newScript = null;
                    if ($link instanceof HTMLAnchorElement) {
                        newScript = AspNetPostback.createAnchorPostbackInjectionScript(jsPostback);
                    } else if ($link instanceof HTMLButtonElement) {
                        newScript = AspNetPostback.createButtonPostbackInjectionScript(jsPostback);
                    } else if ($link instanceof HTMLInputElement) {
                        newScript = AspNetPostback.createInputPostbackInjectionScript(jsPostback);
                    }
                    if (newScript) {
                        html = html.replace('</body>', newScript.outerHTML + "</body>");
                    }
                }
                html = PageLoadHelper.removeNewSkinScripts(html);

                // modify the html before it is written if callback is supplied
                if (preWriteHtml) {
                    html = preWriteHtml(html);
                }

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

    /**
     * Version of createAnchorPostbackInjectionScript that creates
     * a <script> tag that clicks the <input> tag that has
     * the onclick exactly equal to jsPostback.
     * @param jsPostback
     * @return {HTMLScriptElement}
     */
    static createInputPostbackInjectionScript(jsPostback) {
        let newScript = document.createElement('script');
        newScript.innerHTML =` // click the link that has the postback we want to run
                let inputList = document.querySelectorAll('input');
                let found = false;
                for (let i of inputList) {
                    if (i.onclick === "${jsPostback}") {
                        try {
                            found = true;
                            i.click();
                        }
                        catch (ex) {
                            console.error(ex);
                        }
                    }
                }
                if (!found) {
                    console.error("could not find the input.button from the inner hidden iframe!!!");
                }
            `;
        return newScript;
    }

    /**
     * Version of createAnchorPostbackInjectionScript that creates
     * a <script> tag that clicks the <button> tag that has
     * the onclick exactly equal to jsPostback.
     * @param jsPostback
     * @return {HTMLScriptElement}
     */
    static createButtonPostbackInjectionScript(jsPostback) {
        let newScript = document.createElement('script');
        newScript.innerHTML =` // click the link that has the postback we want to run
                let buttonList = document.querySelectorAll('button');
                let found = false;
                for (let b of buttonList) {
                    if (b.onclick === "${jsPostback}") {
                        try {
                            found = true;
                            b.click();
                        }
                        catch (ex) {
                            console.error(ex);
                        }
                    }
                }
                if (!found) {
                    console.error("could not find the button tag from the inner hidden iframe!!!");
                }
            `;
        return newScript;
    }
}