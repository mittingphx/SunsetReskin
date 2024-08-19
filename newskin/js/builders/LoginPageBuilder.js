// noinspection HtmlUnknownTarget,JSUnusedLocalSymbols

import {DomHelper} from "../util/DomHelper.js";
import {Format} from "../util/Format.js";
import {SunsetSkin} from "../SunsetSkin.js";
import {PageLoadHelper} from "../util/PageLoadHelper.js";
import {LoginPageForm} from "../models/LoginPageForm.js";

/**
 * Connects the new skin's login page to the old skin's functionality.
 */
export class LoginPageBuilder {

    /**
     * Builds the login page.
     * @param loginForm {LoginPageForm} the key DOM references on the old skin
     * @param $loginForm {HTMLFormElement} the login form on the new skin
     * @param $registerForm {HTMLFormElement} the register new account form on the new skin
     */
    build(loginForm, $loginForm, $registerForm) {
        let data = {};

        // grab login form elements
        if (!DomHelper.addElementsByQuery(data, $loginForm, {
            $newUsername: '#reg-email',
            $newPassword: '#reg-pass',
            $newRememberMe: '#reg-remember',
            $newSubmit: '#reg-submit',
            $newForgot: '#reg-forgot',
            $newRegister: '#reg-register',
            $newError: '#login-error',
        })) return;

        // grab registration form elements
        if (!DomHelper.addElementsByQuery(data, $registerForm, {
            $newLogin: '#reg-login',
            $regEmail: '#reg-new-email',
            $regPass: '#reg-new-pass',
            $regPassConfirm: '#reg-pass-confirm',
            $regFirstName: '#reg-fn',
            $regLastName: '#reg-ln',
            $regCompany: '#reg-company',
            $regAccount: '#reg-acctNo',
            $regMessage: '#reg-message',
            $btnRegister: '.btn-register',
        })) {}

        // show the error message if there is one
        if (loginForm.errorMessage) {
            data.$newError.innerText = loginForm.errorMessage;
            data.$newError.style.display = 'block';
        }
        if (loginForm.regMessage) {
            data.$regMessage.innerText = loginForm.regMessage;
            data.$regMessage.style.display = 'block';
        }

        // bind input elements on new skin to original form fields
        DomHelper.bindAllFormInputs([
            // login form bindings
            {from: data.$newUsername, to: loginForm.$username},
            {from: data.$newPassword, to: loginForm.$password},
            {from: data.$newRememberMe, to: loginForm.$chkRememberMe},

            // registration form bindings
            {from: data.$regEmail, to: loginForm.$regEmail},
            {from: data.$regPass, to: loginForm.$regPassword},
            {from: data.$regPassConfirm, to: loginForm.$regConfirmPassword},
            {from: data.$regFirstName, to: loginForm.$regFirstName},
            {from: data.$regLastName, to: loginForm.$regLastName},
            {from: data.$regCompany, to: loginForm.$regCompany},
            {from: data.$regAccount, to: loginForm.$regAcctNo}
        ]);

        // login button
        data.$newSubmit.addEventListener('click', (event) => {
            event.preventDefault();

            // make sure there's an email address entered
            if (!data.$newUsername.value) {
                alert('Please enter an email address before pressing Login');
                return;
            }
            if (!Format.isEmail(data.$newUsername)) {
                alert('The value "' + data.$newUsername.value + '" is not a valid email.');
                return;
            }

            // make sure there's a password entered
            if (!data.$newPassword.value) {
                alert('Please enter a password before pressing Login');
                return;
            }

            // attempt the login in a hidden iframe
            this.#doLoginInBackground(data);

        });

        // forgot password button
        data.$newForgot.addEventListener('click', _ => {

            // make sure there's an email address entered
            if (!data.$newUsername.value) {
                alert('Please enter an email address before pressing forgot password.');
                return;
            }
            if (!Format.isEmail(data.$newUsername)) {
                alert('The value "' + data.$newUsername.value + '" is not a valid email.');
                return;
            }

            // press the forgot button
            loginForm.$btnForgotPassword.click();
        });

        // register account button
        data.$btnRegister.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            // make sure there's an email address entered
            if (!data.$regEmail.value) {
                alert('Please enter an email address before pressing Register');
                return;
            }
            if (!Format.isEmail(data.$regEmail)) {
                alert('The value "' + data.$regEmail.value + '" is not a valid email.');
                return;
            }

            // make sure there's a password entered
            if (!data.$regPass.value) {
                alert('Please enter a password before pressing Register');
                return;
            }
            if (data.$regPass.value !== data.$regPassConfirm.value) {
                alert('The passwords do not match');
                return;
            }

            // click the register button
            //data.$regBtnSubmit.click();

            // TODO: this is a two step process, need to make sure the form
            // submits and then show the 2nd page of the form.


            // make sure we have a link to the registration submit button
            let skin = SunsetSkin.getInstance();
            if (!data.$regBtnSubmit) {
                data.$regBtnSubmit = document.querySelector('#MainContent_BtnContinue');
            }

            // perform the button postback action in the background
            skin.aspNet.backgroundPostback(data.$regBtnSubmit, (iframeDoc) => {

                // show an error if we got one
                let $submitError = iframeDoc.querySelector('.failureNotification');
                if ($submitError) {
                    // show in form
                    data.$regMessage.innerHTML = $submitError.innerHTML;
                    data.$regMessage.style.display = 'block';
                    // show as notification
                    skin.alertNotification('Registration Error', $submitError.innerHTML, 10);
                    return;
                }

                // show the 2nd page
                alert('TODO: show page 2 of registration here');


                console.log('got to page 2 of registration');
                console.log(iframeDoc);

            });

        })

        // show registration form from login
        data.$newRegister.addEventListener('click', _ => {
            this.#showRegistrationForm();
        });

        // show login form from registration
        data.$newLogin.addEventListener('click', _ => {
            this.#showLoginForm();
        });

        // show registration form if url contains ?register=1
        let url = new URL(window.location.href);
        if (url.searchParams.get('register') === '1') {
            this.#showRegistrationForm();
            //data.$regEmail.focus(); // focus was hiding red warning block
        }
        else {
            data.$newUsername.focus();
        }
    }

    /**
     * Displays the new account registration form.
     */
    #showRegistrationForm() {
        document.querySelector('.page-title').innerHTML = 'Register';
        document.querySelector('#panel-register').style.display = 'block';
        document.querySelector('#panel-login').style.display = 'none';
        //setTimeout(_ => { window.scrollTo({top: 0, behavior: 'smooth'}); }, 250);
    }

    /**
     * Displays the user login form.
     */
    #showLoginForm() {
        document.querySelector('.page-title').innerHTML = 'Login';
        document.querySelector('#panel-register').style.display = 'none';
        document.querySelector('#panel-login').style.display = 'block';
        //setTimeout(_ => { window.scrollTo({top: 0, behavior: 'smooth'}); }, 250);
    }

    /**
     * Attempts to open the login page in a hidden iframe in the background.
     * @param data {*} data object containing login form elements
     */
    #doLoginInBackground(data) {

        let user = data.$newUsername.value;
        let pass = data.$newPassword.value;

        PageLoadHelper.fetchIntoHiddenIframe('Login/Login.aspx?reskin=0', (wnd, html) => {

            let newScript = this.#getLoginInjectionScript(user, pass);
            html = html.replace('</body>', newScript.outerHTML + "</body>");
            html = PageLoadHelper.removeNewSkinScripts(html);

            // write to the new window
            wnd.document.open();
            wnd.document.write(html);
            wnd.document.close();

            // close hidden page and redirect once login is complete
            PageLoadHelper.waitUntilPageChange(wnd, async _ => {
                await SunsetSkin.navigateToAsync('Login/MyAccount.aspx');
            });
        });

    }

    /**
     * Gets the javascript to inject into the hidden login page
     * to perform the login process.
     * @param username {string} username to log in with
     * @param password {string} password to log in with
     * @returns {HTMLScriptElement}
     */
    #getLoginInjectionScript(username, password) {

        // code to inject into new window
        function injectScript() {
            let $email = document.querySelector('#MainContent_TxtReturningEmail');
            let $password = document.querySelector('#MainContent_TxtReturningPassword');
            let $button = document.querySelector('#MainContent_BtnLogin');
            //console.log({body: document.body});

            let allGood = true;
            if (!$email) {
                console.error('could not find email field! (#MainContent_TxtReturningEmail)');
                allGood = false;
            }
            if (!$password) {
                console.error('could not find password field! (#MainContent_TxtReturningPassword)');
                allGood = false;
            }
            if (!$button) {
                console.error('could not find login button! (#MainContent_BtnLogin)');
                allGood = false;
            }

            if (allGood) {
                //console.log('attempting to login...');
                $email.value = '%%USERNAME%%';
                $password.value = '%%PASSWORD%%';
                $button.click();
                setTimeout(_ => {
                    //wnd.close();
                    window.close();
                }, 1000);
            } else {
                console.warn('could not access login form... already logged in?')
                setTimeout(_ => {
                    document.location = '/sunset/Login/Login.aspx?reskin=0';
                }, 1000);
            }
        }

        // inject code into new window
        let newScript = document.createElement('script');
        let js = injectScript.toString();
        js = js.replace('%%USERNAME%%', username);
        js = js.replace('%%PASSWORD%%', password);
        newScript.innerHTML = js + ' injectScript();';

        return newScript;
    }
}