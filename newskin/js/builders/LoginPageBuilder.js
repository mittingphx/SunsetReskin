import { LoginPageForm} from "../parsers/LoginPageParser.js";
import {DomHelper} from "../util/DomHelper.js";
import {Format} from "../util/Format.js";
import {UrlHelper} from "../UrlHelper.js";
import {SunsetSkin} from "../SunsetSkin.js";

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
                window.scrollTo({top: 0, behavior: 'smooth'});
            }, 250);
        });

        // show login form from registration
        data.$newLogin.addEventListener('click', _ => {
            document.querySelector('#panel-register').style.display = 'none';
            document.querySelector('#panel-login').style.display = 'block';
            setTimeout(_ => {
                window.scrollTo({top: 0, behavior: 'smooth'});
            }, 250);
        });
    }

    /**
     * Attempts to open the login page in a hidden iframe in the background.
     * @param data {*} data object containing login form elements
     */
    #doLoginInBackground(data) {

        let user = data.$newUsername.value;
        let pass = data.$newPassword.value;

        // open the login page in a new window
        let loginUrl = new URL('Login/Login.aspx?reskin=0', UrlHelper.getDeployment()).href
        //let wnd = window.open(loginUrl, '_blank', 'width=1,height=1');


        let iframe = document.createElement('iframe');
        iframe.classList.add('login-iframe');

        // load the login page into the iframe
        iframe.src = loginUrl;
        document.body.appendChild(iframe);
        let wnd = iframe.contentWindow;

        // testing using fetch instead of iframe src
        fetch(loginUrl)
            .then(response => response.text())
            .then(html => {
                console.log(html);


                let newScript = this.#getLoginInjectionScript(user, pass);
                html = html.replace('</body>', newScript.outerHTML + "</body>");
                html = html.replace('<script type="module" src="/reskin/NewSkin.js"></script>', '');
                html = html.replace('<script type="module" src="NewSkin.js"></script>', '');

                // write to the new window
                wnd.document.open();
                wnd.document.write(html);
                wnd.document.close();

                // close hidden page and redirect once login is complete
                this.#waitUntilPageChange(wnd, async wnd => {

                    console.log('page change detected!');
                    // setup controls that require login information (gets called by navigateTo() )
                    //SunsetSkin.getInstance().loginController.updateLoginStatus();

                    //document.location = UrlHelper.getDeployment() + 'Login/MyAccount.aspx';
                    await SunsetSkin.navigateToAsync('ViewCart.aspx');

                });
            });

/*
        // wait until window can receive an injected script
        this.#waitUntilPageReady(wnd, wnd => {
            // create the login script
            let newScript = this.#getLoginInjectionScript(user, pass);

            // create new html with injected script
            let head = wnd.document.head.outerHTML;
            let body = wnd.document.body.outerHTML;
            body = body.replace('</body>', newScript.outerHTML + "</body>");
            body = body.replace('<script type="module" src="/reskin/NewSkin.js"></script>', '');
            body = body.replace('<script type="module" src="NewSkin.js"></script>', '');

            let html = '<html lang="en">' + head + body + '</html>';
            console.log(html);

            // write to the new window
            wnd.document.open();
            wnd.document.write(html);
            wnd.document.close();

            // close hidden page and redirect once login is complete
            this.#waitUntilPageChange(wnd, async wnd => {

                // setup controls that require login information (gets called by navigateTo() )
                //SunsetSkin.getInstance().loginController.updateLoginStatus();

                //document.location = UrlHelper.getDeployment() + 'Login/MyAccount.aspx';
                await SunsetSkin.navigateToAsync('ViewCart.aspx');

            });
        });
        */

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
            console.log({body: document.body});

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
                console.log('attempting to login...');
                $email.value = '%%USERNAME%%';
                $password.value = '%%PASSWORD%%';
                $button.click();
                setTimeout(_ => {
                    //wnd.close();
                    window.close();
                }, 1000);
            } else {
                console.log('could not access login form... already logged in?')
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

    /**
     * Sets an interval that keeps checking if a page has loaded
     * and calls a callback once it's ready.
     * @param wnd {Window} window to wait for
     * @param callback {function} callback to call once the page is ready
     */
    #waitUntilPageReady(wnd, callback) {

        // wait until window can receive an injected script
        let interval = setInterval(_ => {

            // wait for window to load
            if (!wnd || !wnd.document || !wnd.document.body) {
                return;
            }

            // wait until there's actually something in the body;
            if (wnd.document.body.innerText.length === 0) {
                return;
            }

            // stop waiting
            clearInterval(interval);

            // do callback
            callback(wnd);
        });
    }

    /**
     * Waits until the page changes and calls a callback when it does.
     * @param wnd {Window} window to wait for
     * @param callback {function} callback to call once the page is ready
     */
    #waitUntilPageChange(wnd, callback) {

        let oldUrl = wnd.location.href;
        let oldTitle = wnd.document.title;

        let interval = setInterval(async _ => {
            // TODO: need to detect errors in login
            if (wnd.location.href === oldUrl) {
                return;
            }
            console.log('window title = ' + wnd.document.title
                + ' location=' + wnd.location.href
                + ' old=' + oldUrl
                + ' oldTitle=' + oldTitle
            );
            clearInterval(interval);

            // close the temporary window
            wnd.close(); // TODO: is this needed?  maybe remove iframe?

            // do callback
            callback(wnd);

        });

    }
}