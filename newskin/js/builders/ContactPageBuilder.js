import {AspNetPostback} from "../util/AspNetPostback.js";

/**
 * Builds the HTML for the contact us page.
 */
export class ContactPageBuilder {

    /**
     * Fills the contact page when the user is logged in.
     * @param loginStatus {LoginStatus}
     * @param $contactForm {HTMLFormElement}
     */
    build(loginStatus, $contactForm) {

        // TODO: submit needs to be tied to the old form

        // tie form to the postback on the old page
        //$contactForm.action = 'javascript:WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions(&quot;ctl00$MainContent$BtnSendMessage&quot;, &quot;&quot;, true, &quot;VlgContactUs&quot;, &quot;&quot;, false, false))';
        let $submit = $contactForm.querySelector('button')
        if ($submit) {
            //$submit.setAttribute('onclick', 'WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions("ctl00$MainContent$BtnSendMessage", "", true, "VlgContactUs", "", false, false))');
            $submit.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.doSubmitMessagePostback($contactForm);
            });
        }
        else {
            console.error('could not find submit button');
        }


        // don't fill out form if not logged in
        if (!loginStatus.loggedIn) {
            $contactForm.elements['name'].focus();
            return;
        }

        // automatically set most of the form fields
        $contactForm.elements['name'].value = loginStatus.name;
        $contactForm.elements['email'].value = loginStatus.email;
        $contactForm.elements['company'].value = loginStatus.company;
        $contactForm.elements['phone'].value = loginStatus.phone;

        // focus on the message
        if (!loginStatus.name){
            $contactForm.elements['name'].focus();
        }
        else {
            $contactForm.elements['message'].focus();
        }
    }

    /**
     * Submits the message using the old form.
     * @param $contactForm {HTMLFormElement} form with user input
     */
    doSubmitMessagePostback($contactForm) {
/*
        let postback = 'javascript:WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions(&quot;ctl00$MainContent$BtnSendMessage&quot;, &quot;&quot;, true, &quot;VlgContactUs&quot;, &quot;&quot;, false, false))';
        //let postback = '\'WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions("ctl00$MainContent$BtnSendMessage", "", true, "VlgContactUs", "", false, false))\');'

        // create a button that has the javascript of the button we're wanting to click in the background
        let $button = document.createElement('input');
        $button.setAttribute('type', 'submit');
        $button.setAttribute('onclick', postback);
*/
        // send the postback
        AspNetPostback.runInBackground('ContactUs.aspx?reskin=no', {elementQuery: '#MainContent_BtnSendMessage'},
            (html, $iframe) => {
                $iframe.remove();
                alert('Message sent!')
            }, (html) => {

                // inject name, company, email, phone
                html = this.#injectTagValue(html, 'MainContent_TxtFullName', $contactForm.elements['name'].value );
                html = this.#injectTagValue(html, 'MainContent_TxtCompany', $contactForm.elements['company'].value );
                html = this.#injectTagValue(html, 'MainContent_TxtEmail', $contactForm.elements['email'].value );
                html = this.#injectTagValue(html, 'MainContent_TxtPhoneNumber', $contactForm.elements['phone'].value );

                // inject message
                html = this.#injectTagInnerHtml(html, 'MainContent_TxtMessage', $contactForm.elements['message'].value );

                // complete the postback
                console.log('sending postback', html);
                return html;
            });

    }

    /**
     * Finds an <input> tag in unparsed html that has a specific id
     * and then replaces its value.
     * @param html {string} unparsed html
     * @param searchId {string} id of field to find
     * @param newValue {string} new value to replace existing value with
     * @returns {string}
     */
    #injectTagValue(html, searchId, newValue) {

        // find the id attribute matching the searchId
        let idIndex = html.indexOf('id="' + searchId + '"');
        if (idIndex < 0) {
            console.error('Could not find id: ' + searchId);
            return html;
        }

        // find start of the tag that attribute is within
        let tagStartIndex = html.lastIndexOf('<input', idIndex);
        if (tagStartIndex < 0) {
            console.error('malformed html @ ' + idIndex + ': ' + html);
            return html;
        }

        // find the end of that tag
        let tagEndIndex = html.indexOf('>', tagStartIndex);
        if (tagEndIndex < 0) {
            console.error('malformed html @ ' + tagStartIndex + ': ' + html);
            return html;
        }
        else if (html[tagEndIndex - 1] === '/') {
            tagEndIndex--;
        }

        // look for a value attribute within that tag
        let valueStartIndex = html.indexOf('value="', tagStartIndex);
        if (valueStartIndex < 0 || valueStartIndex > tagEndIndex) { // no value attribute, add it
            valueStartIndex = tagEndIndex;
            return html.substring(0, valueStartIndex) + ' value="' + newValue + '"' + html.substring(valueStartIndex);
        }
        else { // replace existing value attribute
            let valueEndIndex = html.indexOf('"', valueStartIndex + 7);
            return html.substring(0, valueStartIndex + 7) + newValue + html.substring(valueEndIndex);
        }
    }


    /**
     * Replaces the innerHTML of a tag in unparsed html that has a
     * specific id.  This is meant for <textarea> tags.
     * @param html {string} unparsed html
     * @param searchId {string} id of field to find
     * @param newValue {string} new value to replace existing value with
     * @returns {string}
     */
    #injectTagInnerHtml(html, searchId, newValue) {
        let idIndex = html.indexOf('id="' + searchId + '"');
        if (idIndex < 0) {
            console.error('Could not find id: ' + searchId);
            return html;
        }
        let tagStartIndex = html.lastIndexOf('<textarea', idIndex);
        if (tagStartIndex < 0) {
            console.error('malformed html @ ' + idIndex + ': ' + html);
            return html;
        }
        let tagEndIndex = html.indexOf('>', tagStartIndex);
        let endTagStartIndex = html.indexOf('</textarea>', tagEndIndex);
        if (endTagStartIndex < 0) {
            console.error('malformed html @ ' + tagStartIndex + ': ' + html);
            return html;
        }

        return html.substring(0, tagEndIndex + 1) + encodeURIComponent(newValue) + html.substring(endTagStartIndex);
    }
}
