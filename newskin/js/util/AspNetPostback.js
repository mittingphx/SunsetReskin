import {PageLoadHelper} from "./PageLoadHelper.js";

/**
 * Helper classes for running ASP.net post-backs in the background.
 *
 * This class is used when you want to run a post-back that isn't
 * tied to a <form> on the page.  For <form> submission, use
 * AspNetIntercept instead.
 */
export class AspNetPostback {

    /**
     * When true the hidden iframe is visible
     * @type {boolean}
     */
    static SHOW_DEBUG = false;

    /**
     * @typedef ILinkTarget
     * @property elementQuery {string} query to find the link to press
     * An additional way to specify what link to press in the background
     * on a hidden asp.net iframe page.
     */

    /**
     * @typedef IElementTarget
     * @property elementQuery {string} query to find the HtmlElement to change
     * @property value {string} value to set the element to
     * Sets the value of an HtmlElement on a hidden asp.net iframe page,
     * with the intention of triggering a postback on that element.
     */

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
     * @param $link {HTMLAnchorElement|HTMLButtonElement|HTMLInputElement|ILinkTarget|IElementTarget} the link we want to .net ServerClick on a page in the background (optional)
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
                jsPostback = $link.getAttribute('onclick');
            } else if ($link instanceof HTMLInputElement) {
                jsPostback = $link.getAttribute('onclick');
            } else if ($link.elementQuery) {
                jsPostback = $link.elementQuery;
            } else {
                console.error('Could not determine jsPostback for $link: ' + $link);
                return;
            }
        }

        // use old site's form for editing shipping addresses
        PageLoadHelper.fetchIntoHiddenIframe(url,
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
                    } else if ($link.elementQuery) {
                        newScript = AspNetPostback.createElementQueryPostbackInjectionScript($link);
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
                    if (a.href === '${jsPostback}') {
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
                    if (i.getAttribute('onclick') === '${jsPostback}') {
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
     * Version of createAnchorPostbackInjectionScript that uses an element query
     * to find the <input> tag that has the onclick we want to run as a postback.
     * @param $target {ILinkTarget|IElementTarget} contains the element query to use
     * @return {HTMLScriptElement}
     */
    static createElementQueryPostbackInjectionScript($target) {
        let newScript = document.createElement('script');

        // make sure we've got an element query
        if (!$target.elementQuery) {
            console.error('Could not determine jsPostback for $target: ' + JSON.stringify($target));
            return null;
        }

        // handler for IElementTarget, which sets values
        if ($target.value) {
            newScript.innerHTML =` // click the link that has the postback we want to run
                let input = document.querySelector('${ $target.elementQuery }');
                if (!input) {
                    console.error("could not find the input '${ $target.elementQuery }' from the inner hidden iframe!!!");
                }
                else {
                    try {
                        input.value = '${ $target.value }';
                        if (input.tagName === 'SELECT') {
                            input.dispatchEvent(new Event('change'));
                        }
                        else if (input.tagName === 'input') {
                            input.dispatchEvent(new Event('input'));
                        }                        
                    }
                    catch (ex) {
                        console.error(ex);
                    }
                }
            `;
        }
        // handler for ILinkTarget, which clicks links
        else {
            newScript.innerHTML = ` // click the link that has the postback we want to run               
                let input = document.querySelector('${$target.elementQuery}');
                if (!input) {
                    console.error("could not find the input.button '${$target.elementQuery}' from the inner hidden iframe!!!");
                }
                else {
                    try {
                        input.click();
                    }
                    catch (ex) {
                        console.error(ex);
                    }
                }
            `;
        }
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
                    if (b.getAttribute('onclick') === '${jsPostback}') {
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