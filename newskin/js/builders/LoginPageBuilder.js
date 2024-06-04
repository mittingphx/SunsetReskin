import { LoginPageForm} from "../parsers/LoginPageParser.js";
import {DomHelper} from "../util/DomHelper.js";
import {Format} from "../util/Format.js";

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
            $newError: '.error'
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
        }))

        /*
        let $newUsername = $loginForm.querySelector('#reg-email');
        let $newPassword = $loginForm.querySelector('#reg-pass');
        let $newRememberMe = $loginForm.querySelector('#reg-remember');
        if (!$newUsername || !$newPassword || !$newRememberMe) {
            console.error('Could not find all login form elements!');
            return;
        }

        // grab new form buttons
        let $newSubmit = $loginForm.querySelector('#reg-submit');
        let $newForgot = $loginForm.querySelector('#reg-forgot');
        let $newRegister = $loginForm.querySelector('#reg-register');
        if (!$newSubmit || !$newForgot || !$newRegister) {
            console.error('Could not find all login form buttons!');
            return;
        }

        let $newError = $loginForm.querySelector('.error');
        if (!$newError) {
            console.error('Could not find login form error message!');
            return;
        }
*/
        // show the error message if there is one
        if (loginForm.errorMessage) {
            data.$newError.innerText = loginForm.errorMessage;
        }

        // login form binding
        DomHelper.bindFormInputs( data.$newUsername, loginForm.$username);
        DomHelper.bindFormInputs( data.$newPassword, loginForm.$password);
        DomHelper.bindFormInputs( data.$newRememberMe, loginForm.$chkRememberMe);

        // registration form binding
        DomHelper.bindFormInputs( data.$regEmail, loginForm.$regEmail);
        DomHelper.bindFormInputs( data.$regPass, loginForm.$regPassword);
        DomHelper.bindFormInputs( data.$regPassConfirm, loginForm.$regConfirmPassword);
        DomHelper.bindFormInputs( data.$regFirstName, loginForm.$regFirstName);
        DomHelper.bindFormInputs( data.$regLastName, loginForm.$regLastName);
        DomHelper.bindFormInputs( data.$regCompany, loginForm.$regCompany);
        DomHelper.bindFormInputs( data.$regAccount, loginForm.$regAcctNo);

        // add event listeners for buttons
        data.$newSubmit.addEventListener('click', _ => {

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


            // press the login button
            loginForm.$btnSubmit.click();
        });

        // show forgot password
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

        // show registration form
        data.$newRegister.addEventListener('click', _ => {
            document.querySelector('#panel-register').style.display = 'block';
            document.querySelector('#panel-login').style.display = 'none';
            setTimeout(_ => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 250);
        });

        // show login form
        data.$newLogin.addEventListener('click', _ => {
            document.querySelector('#panel-register').style.display = 'none';
            document.querySelector('#panel-login').style.display = 'block';
            setTimeout(_ => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 250);
        });
    }

}