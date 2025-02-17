// noinspection HtmlUnknownTarget,JSUnusedLocalSymbols

import {DomHelper} from "../util/DomHelper.js";
import {Format} from "../util/Format.js";
import {SunsetSkin} from "../SunsetSkin.js";
import {PageLoadHelper} from "../util/PageLoadHelper.js";
import {LoginPageForm} from "../models/LoginPageForm.js";



// version of replace that doesn't message up $ in replacement values
function replaceTextInString(str, oldText, newText) {
    let indexOf = str.indexOf(oldText);
    while (indexOf > -1) {
        str = str.substring(0, indexOf) + newText + str.substring(indexOf + oldText.length);
        indexOf = str.indexOf(oldText, indexOf + newText.length);
    }
    return str;

    //return str.replace(new RegExp(oldText, 'g'), newText);
}

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

        // Register button click - submit step 1, go to step 2
        data.$btnRegister.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.#submitRegistrationForm(data);
        });

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
        }
        else {
            data.$newUsername.focus();
        }
    }

    /**
     * Displays the new account registration form.
     */
    #showRegistrationForm() {
        document.querySelector('.page-title').innerHTML = 'Register (Step 1 of 2)';
        document.querySelector('#panel-register').style.display = 'block';
        document.querySelector('#panel-register-page2').style.display = 'none';
        document.querySelector('#panel-login').style.display = 'none';
    }

    /**
     * Displays page 2 of the registration form.
     * @returns {HTMLElement} the parent of the page 2 form
     */
    #showRegistrationPage2() {
        document.querySelector('.page-title').innerHTML = 'Register (Step 2 of 2)';
        document.querySelector('#panel-register').style.display = 'none';
        document.querySelector('#panel-register-page2').style.display = 'block';
        document.querySelector('#panel-login').style.display = 'none';
        return document.querySelector('#panel-register-page2');
    }

    /**
     * Displays the user login form.
     */
    #showLoginForm() {
        document.querySelector('.page-title').innerHTML = 'Login';
        document.querySelector('#panel-register').style.display = 'none';
        document.querySelector('#panel-register-page2').style.display = 'none';
        document.querySelector('#panel-login').style.display = 'block';
    }

    /**
     * Attempts to open the login page in a hidden iframe in the background.
     * @param data {*} data object containing login form elements
     */
    #doLoginInBackground(data) {

        let user = data.$newUsername.value;
        let pass = data.$newPassword.value;

        // note: both the old website and the new website should get
        // logged into simultaneously so it shouldn't take any extra
        // time to log into both sites

        let builder = this;

        // log into the old website at the same time so we can use the same session
        function loginOldSite() {
            PageLoadHelper.fetchIntoHiddenIframe('/Login/Login.aspx?reskin=0', (wnd, html) => {

                let newScript = builder.#getLoginInjectionScript(user, pass);
                html = replaceTextInString(html, '</body>', newScript.outerHTML + "</body>");
                html = PageLoadHelper.removeNewSkinScripts(html);

                // write to the new window
                wnd.document.open();
                wnd.document.write(html);
                wnd.document.close();

                // close finished login page on old site
                PageLoadHelper.waitUntilPageChange(wnd, async _ => {
                    loginNewSite();
                });
            });
        }

        // do the login for the new skin
        function loginNewSite() {
            PageLoadHelper.fetchIntoHiddenIframe('Login/Login.aspx?reskin=0', (wnd, html) => {

                let newScript = builder.#getLoginInjectionScript(user, pass);
                html = replaceTextInString(html, '</body>', newScript.outerHTML + "</body>");
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


        // start the process
        loginOldSite();

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
        js = replaceTextInString(js, '%%USERNAME%%', username);
        js = replaceTextInString(js, '%%PASSWORD%%', password);
        //js = js.replace('%%USERNAME%%', username);
        //js = js.replace('%%PASSWORD%%', password);
        newScript.innerHTML = js + ' injectScript();';

        return newScript;
    }


    /**
     * Everything that happens when the user submits the registration
     * form to start step 2 of the registration process.
     * @param data {*} data object containing registration form elements
     */
    #submitRegistrationForm(data) {

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

        // make sure we have a link to the registration submit button
        let skin = SunsetSkin.getInstance();
        if (!data.$regBtnSubmit) {
            data.$regBtnSubmit = document.querySelector('#MainContent_BtnContinue');
        }
        data.$regBtnSubmit.removeAttribute('disabled');

        // perform the button postback action in the background
        skin.aspNet.backgroundPostback(data.$regBtnSubmit, (iframeDoc) => {

            // show an error if we got one
            let $submitError = iframeDoc.querySelector('#MainContent_ValSumNewCustomer');
            if ($submitError) {
                // remove newlines, tabs, and spaces from string
                $submitError.innerHTML = $submitError.innerHTML.replace(/[\r\n\t\s]+/g, '');
            }
            if ($submitError && $submitError.innerHTML) {
                // show as notification
                skin.alertNotification('Registration Error', $submitError.innerHTML, 10);
                // show in form
                if (!data.$regMessage) {
                    data.$regMessage = document.querySelector('#reg-message');
                }
                data.$regMessage.innerHTML = $submitError.innerHTML;
                data.$regMessage.style.display = 'block';
                return;
            }

            this.#buildRegistrationPage2( skin, iframeDoc)

        });

    }

    /**
     * Shows Page 2 of the registration form.
     * @param skin {SunsetSkin} the main application object for the skin
     * @param iframeDoc {Document} the iframe document loaded in the hidden iframe
     */
    #buildRegistrationPage2(skin, iframeDoc) {

        // check input
        if (!iframeDoc) {
            alert('no iframeDoc provided to buildRegistrationPage2()');
            return;
        }

        // show the 2nd page
        let $page2 = this.#showRegistrationPage2();
        if (!$page2) {
            alert('Could not find page 2 of registration form');
            return;
        }

        // grab DOM elements from old skin
        let $oldPage2 = iframeDoc.querySelector('#MainContent_TblRegister');
        if (!$oldPage2) {
            alert('Could not find page 2 of registration form on the old skin');
            return;
        }

        let oldSkin = {};
        if (!DomHelper.addElementsByQuery(oldSkin, $oldPage2, {
            $lblEmail: '#MainContent_LblEmail',
            $lblAcctNo: '#MainContent_LblAcctNo',
            $txtFirstName: '#MainContent_TxtFirstName',
            $txtLastName: '#MainContent_TxtLastName',
            $txtCompany: '#MainContent_TxtCompany',
            $txtAddress: '#MainContent_TxtAddress',
            $txtApartment: '#MainContent_TxtApartment',
            $txtZipCode: '#MainContent_TxtZipCode',
            $txtCity: '#MainContent_TxtCity',
            $dropState: '#MainContent_DropState',
            $txtCounty: '#MainContent_TxtCounty',
            $txtPhone: '#MainContent_TxtPhone',
            $txtCell: '#MainContent_TxtCell',
            $txtFax: '#MainContent_TxtFax',
            $txtTaxID: '#MainContent_TxtTaxID',
            $txtDun: '#MainContent_TxtDun',
            $dropPromoFlag: '#MainContent_DropPromoFlag',
            $btnRegister: '#MainContent_BtnRegister',
            $btnBack: '#MainContent_BtnBack',
        })) {}

        // grab DOM elements from new skin
        let newSkin = {};
        if (!DomHelper.addElementsByQuery(newSkin, $page2, {
            $regEmail: '#reg-page2-email',
            $regAcctNo: '#reg-page2-acctno',
            $regFirstName: '#reg-page2-fn',
            $regLastName: '#reg-page2-ln',
            $regCompany: '#reg-page2-company',
            $regAddress: '#reg-page2-address',
            $regUnit: '#reg-page2-unit',
            $regZipCode: '#reg-page2-zip',
            $regCity: '#reg-page2-city',
            $dropState: '#reg-page2-state',
            $regCounty: '#reg-page2-county',
            $regPhone: '#reg-page2-phone',
            $regCell: '#reg-page2-cell',
            $regFax: '#reg-page2-fax',
            $regTaxID: '#reg-page2-taxid',
            $regDbn: '#reg-page2-dbn',
            $regSpam: '#reg-page2-spam',
            $btnSubmit: '#btn-page2-register',
            $btnBack: '#btn-page2-back',
        })) {}

        // populate dropdowns
        if (oldSkin.$dropState) {
            newSkin.$dropState.innerHTML = oldSkin.$dropState.innerHTML;
        }
        if (oldSkin.$dropPromoFlag) {
            newSkin.$regSpam.innerHTML = oldSkin.$dropPromoFlag.innerHTML;
        }

        // populate fixed fields
        if (oldSkin.$lblEmail) {
            newSkin.$regEmail.value = oldSkin.$lblEmail.innerHTML;
        }
        if (oldSkin.$lblAcctNo) {
            newSkin.$regAcctNo.value = oldSkin.$lblAcctNo.innerHTML;
        }

        // bind input elements on new skin to original form fields
        DomHelper.bindAllFormInputs([
            // registration page 2
            {from: newSkin.$regFirstName, to: oldSkin.$txtFirstName},
            {from: newSkin.$regLastName, to: oldSkin.$txtLastName},
            {from: newSkin.$regCompany, to: oldSkin.$txtCompany},
            {from: newSkin.$regAddress, to: oldSkin.$txtAddress},
            {from: newSkin.$regUnit, to: oldSkin.$txtApartment},
            {from: newSkin.$regZipCode, to: oldSkin.$txtZipCode},
            {from: newSkin.$regCity, to: oldSkin.$txtCity},
            {from: newSkin.$dropState, to: oldSkin.$dropState},
            {from: newSkin.$regCounty, to: oldSkin.$txtCounty},
            {from: newSkin.$regPhone, to: oldSkin.$txtPhone},
            {from: newSkin.$regCell, to: oldSkin.$txtCell},
            {from: newSkin.$regFax, to: oldSkin.$txtFax},
            {from: newSkin.$regTaxID, to: oldSkin.$txtTaxID},
            {from: newSkin.$regDbn, to: oldSkin.$txtDun},
            {from: newSkin.$regSpam, to: oldSkin.$dropPromoFlag}
        ]);

        // set focus to first editable field that isn't empty
        newSkin.$regFirstName.focus();

        // manually copy over the name and company name, since bind isn't doing it (but should be)
        if (oldSkin.$txtFirstName) {
            newSkin.$regFirstName.value = oldSkin.$txtFirstName.value;
            newSkin.$regLastName.focus();
        }
        if (oldSkin.$txtLastName) {
            newSkin.$regLastName.value = oldSkin.$txtLastName.value;
            newSkin.$regCompany.focus();
        }
        if (oldSkin.$txtCompany) {
            newSkin.$regCompany.value = oldSkin.$txtCompany.value;
            newSkin.$regAddress.focus();
        }

        // Register button click - submit step 2
        newSkin.$btnSubmit.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.#submitRegistrationFormStep2(skin, oldSkin, newSkin);
        });

        // Back button click - go back to step 1
        newSkin.$btnBack.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.#showRegistrationForm();
        });
    }

    /**
     * Handles clicking the register button on page 2 of the registration form.
     * @param skin {SunsetSkin} the main application object for the skin
     * @param oldSkin {Object} the old skin DOM elements
     * @param newSkin {Object} the new skin DOM elements
     */
    #submitRegistrationFormStep2(skin, oldSkin, newSkin) {

        // check required fields
        if (!newSkin.$regFirstName.value) {
            alert('Please enter your first name before pressing Register');
            return;
        }
        if (!newSkin.$regLastName.value) {
            alert('Please enter your last name before pressing Register');
            return;
        }
        if (!newSkin.$regAddress.value) {
            alert('Please enter your address before pressing Register');
            return;
        }
        if (!newSkin.$regCity.value) {
            alert('Please enter your city before pressing Register');
            return;
        }
        if (!newSkin.$regZipCode.value) {
            alert('Please enter your zip code before pressing Register');
            return;
        }
        if (!newSkin.$regCounty.value) {
            alert('Please enter your county before pressing Register');
            return;
        }

        // perform the button postback action in the background
        skin.aspNet.backgroundPostback(oldSkin.$btnRegister, (iframeDoc) => {

            // get result message
            let $result = iframeDoc.querySelector('#MainContent_LblMessage');
            if (!$result) {
                alert('New account registration submitted, but no confirmation was received.  Please try again later.');
                return;
            }

            let success = $result.innerHTML.indexOf('Thank you') !== -1;

            // show the result to the user
            if (success) {
                skin.alertNotification('Registration Submitted Successfully', $result.innerHTML, 99);
                this.#showLoginForm();
            }
            else {
                let error = $result.innerHTML;
                let $problem = iframeDoc.querySelector('#MainContent_ValSumNewCustomer');
                if ($problem) {
                    error += '\n\n' + $problem.innerHTML;
                }
                skin.alertNotification('Registration Submission Failed', error, 99);

                // have to rebind the form to the new hidden iframe page
                this.#buildRegistrationPage2(skin, iframeDoc);
            }
        });

    }
}