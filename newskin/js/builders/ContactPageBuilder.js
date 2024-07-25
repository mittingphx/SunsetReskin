import {AspNetPostback} from "../util/AspNetPostback.js";
import {HtmlHelper} from "../util/HtmlHelper.js";

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

        // send the postback
        AspNetPostback.runInBackground('ContactUs.aspx?reskin=no', {elementQuery: '#MainContent_BtnSendMessage'},
            (html, $iframe) => {

                // notify user the message was sent when complete
                $iframe.remove();
                alert('Message sent!')

            }, (html) => {

                // need to add data to HTML before it is written to hidden iframe

                // inject name, company, email, phone
                html = HtmlHelper.injectTagValue(html, 'MainContent_TxtFullName', $contactForm.elements['name'].value );
                html = HtmlHelper.injectTagValue(html, 'MainContent_TxtCompany', $contactForm.elements['company'].value );
                html = HtmlHelper.injectTagValue(html, 'MainContent_TxtEmail', $contactForm.elements['email'].value );
                html = HtmlHelper.injectTagValue(html, 'MainContent_TxtPhoneNumber', $contactForm.elements['phone'].value );

                // inject message
                html = HtmlHelper.injectTagInnerHtml(html, 'MainContent_TxtMessage', $contactForm.elements['message'].value );

                // complete the postback
                console.log('sending postback', html);
                return html;
            });

    }

}
