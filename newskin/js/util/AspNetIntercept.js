// noinspection JSUnusedGlobalSymbols

/**
 * Tools for working with ASP.Net callbacks, with the ability to
 * intercept and redirect PostBacks from the old page and handle
 * responses in the background, allowing for automation of several
 * features on the server-side of the website.
 */
export class AspNetIntercept {

    /**
     * When set, the ASP.NET override is in use.
     * @type {boolean}
     */
    overrideInstalled = false;

    /**
     * The <form> tag used by ASP.net
     * @type {HTMLFormElement|null}
     */
    #postbackForm = null;

    /**
     * The <iframe> for submitting the <form> in the background.
     * @type {HTMLIFrameElement|null}
     */
    #hiddenIframe = null;

    /**
     * Name of windows that identifies the <iframe> as a background interceptor.
     * @type {string}
     */
    hiddenIframeName = 'hiddenAspnetForm';

    /**
     * Performs the ASP.Net click function on an element as it its
     * form had not been disconnected from the webpage.
     * @param element {HTMLElement}
     */
    serverClick(element) {
        this.overrideFormPostback();
        element.click();
    }

    /**
     * Perform the ASP.Net click function on an element in a
     * background thread, allowing for data to be loaded in the
     * background.
     * @param element {HTMLElement}
     * @param callback {function(Document)} called after the page is loaded
     * @param allowNestedPostback {boolean} allow nested post-backs (default is false)
     */
    backgroundPostback(element, callback, allowNestedPostback = false) {

        // ignore these calls on localhost as CORS freaks out
        if (window.origin.indexOf('localhost') > -1) {
            return;
        }


        // detect and cancel nested post-backs
        if (window.name === this.hiddenIframeName) {
            if (allowNestedPostback) {
                //console.log('detected nested iframe postback.  ALLOWED.', {window: window});
            }
            else {
                //console.log('detected nested iframe postback.  BLOCKED.', {window: window});
                return;
            }
        }

        this.overrideFormPostback();
        let oldTarget = this.#postbackForm.target;
        this.#createHiddenIframe();
        this.#postbackForm.target = this.#hiddenIframe.name;

        // iframe load listener waiting until readyState and then calls callback
        let iframe = this.#hiddenIframe;
        let onIframeLoaded;
        onIframeLoaded = () => {
            // restore asp.net form to its original state
            iframe.removeEventListener('load', onIframeLoaded);
            this.#postbackForm.target = oldTarget;

            // get the iframe's document
            let iframeDoc = iframe.contentDocument;
            if (!iframeDoc) {
                if (iframe.contentWindow) {
                    // a CORS error may occur here, especially on localhost
                    iframeDoc = iframe.contentWindow.document;
                }
            }

            // send back null if we couldn't load page
            if (!iframeDoc) {
                callback(null);
                return;
            }

            // wait for the page to load
            let interval = setInterval(() => {
                if (iframeDoc.readyState === 'complete') {
                    clearInterval(interval);
                    callback(iframeDoc);
                }
            }, 100);
        };

        // add reskin=no to the action url
        let actionUrl = new URL(this.#postbackForm.action);
        actionUrl.searchParams.set('reskin', 'no');
        this.#postbackForm.action = actionUrl.href;

        // alert(this.#postbackForm.action);

        // listen for load event and press the button
        iframe.addEventListener('load', onIframeLoaded);
        element.click();
    }

    /**
     * This takes over the ASP.Net forms postback system, otherwise
     * disconnected forms will get the error "Form submission canceled
     * because the form is not connected.".
     *
     * After this method is called, all post-backs will be handled
     * by the ASP.Net framework correctly by calling element.click()
     */
    overrideFormPostback() {


        // only do this override once
        if (this.overrideInstalled) {
            return;
        }
        this.overrideInstalled = true;
        //console.log('overriding __doPostBack');

        // set the form
        if (!this.#postbackForm) {
            this.#getFormReference();
        }

        // hack to avoid error: Form submission canceled because the form is not connected.
        window.__doPostBack = (eventTarget, eventArgument) => {

            if (!this.#postbackForm) {
                this.#getFormReference();
            }
            let theForm = this.#postbackForm;

            // make sure url is still correct
            let url = new URL(document.location + '')
            theForm.action = url.href;

            // submit the form the way ASP.Net expects it for post-backs.
            if (!theForm.onsubmit || (theForm.onsubmit() !== false)) {
                theForm.__EVENTTARGET.value = eventTarget;
                theForm.__EVENTARGUMENT.value = eventArgument;
                theForm.submit();
            }
        };

    }

    /**
     * Attempts to get the asp.net form.
     */
    #getFormReference() {

        // get a reference to the ASP.Net form
        this.#postbackForm = document.forms['Form1'];
        if (!this.#postbackForm) {
            // noinspection JSUnresolvedReference
            this.#postbackForm = document.Form1;
        }
    }

    /**
     * Creates an invisible <iframe> that is used to submit the
     * <form> in the background.
     *
     * @returns {string} the name of the iframe
     */
    #createHiddenIframe() {
        if (!this.#hiddenIframe) {
            this.#hiddenIframe = document.createElement('iframe');
            this.#hiddenIframe.name = this.hiddenIframeName;
            this.#hiddenIframe.style.display = 'none';
            document.body.appendChild(this.#hiddenIframe);
        }
        return this.#hiddenIframe.name;
    }
}