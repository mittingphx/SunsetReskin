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


        // don't fill out form if not logged in
        if (!loginStatus.loggedIn) {
            $contactForm.elements['name'].focus();
            return;
        }

        // automatically set most of the form fields
        $contactForm.elements['name'].value = loginStatus.name;
        $contactForm.elements['email'].value = loginStatus.email;
        $contactForm.elements['subject'].value = 'Message from ' + (loginStatus.company || 'customer');
        $contactForm.elements['phone'].value = loginStatus.phone;

        // focus on the message
        if (!loginStatus.name){
            $contactForm.elements['name'].focus();
        }
        else {
            $contactForm.elements['message'].focus();
        }
    }
}
