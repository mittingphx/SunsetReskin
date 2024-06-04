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

        // show the error message if there is one
        if (loginForm.errorMessage) {
            data.$newError.innerText = loginForm.errorMessage;
        }

        // bind input elements on new skin to original form fields
        DomHelper.bindAllFormInputs([
            // login form bindings
            { from: data.$newUsername, to: loginForm.$username },
            { from: data.$newPassword, to: loginForm.$password },
            { from: data.$newRememberMe, to: loginForm.$chkRememberMe },

            // registration form bindings
            { from: data.$regEmail, to: loginForm.$regEmail },
            { from: data.$regPass, to: loginForm.$regPassword },
            { from: data.$regPassConfirm, to: loginForm.$regConfirmPassword },
            { from: data.$regFirstName, to: loginForm.$regFirstName },
            { from: data.$regLastName, to: loginForm.$regLastName },
            { from: data.$regCompany, to: loginForm.$regCompany },
            { from: data.$regAccount, to: loginForm.$regAcctNo }
        ]);

        // login button
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
        data.$regAccount.addEventListener('click', _ => {

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
            if (!data.$regPass.value !== data.$regPassConfirm.value) {
                alert('The passwords do not match');
                return;
            }

            // click the register button
            data.$regBtnSubmit.click();
        })

        // show registration form from login
        data.$newRegister.addEventListener('click', _ => {
            document.querySelector('#panel-register').style.display = 'block';
            document.querySelector('#panel-login').style.display = 'none';
            setTimeout(_ => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 250);
        });

        // show login form from registration
        data.$newLogin.addEventListener('click', _ => {
            document.querySelector('#panel-register').style.display = 'none';
            document.querySelector('#panel-login').style.display = 'block';
            setTimeout(_ => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 250);
        });
    }

}