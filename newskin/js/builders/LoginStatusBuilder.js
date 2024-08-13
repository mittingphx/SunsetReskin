import {fixUrl} from "../UrlHelper.js";
import {LoginStatus} from "../models/LoginStatus.js";
import {SunsetSkin} from "../SunsetSkin.js";

/**
 * Builds the HTML for the login status information in the upper right.
 */
export class LoginStatusBuilder {

    constructor() {
    }

    /**
     * Inserts current information about the logged-in user into the
     * header.
     * @param loginStatus {LoginStatus}
     * @returns {HTMLDivElement}
     */
    build(loginStatus) {

        let $topEnd = document.createElement('div');
        $topEnd.classList.add('top-end');

        // username display
        let $user = document.createElement('div');
        {
            $user.classList.add('user');
            $topEnd.appendChild($user);

            $user.innerHTML = '<i class="lni lni-user"></i>';

            if (loginStatus.loggedIn) {
                $user.innerHTML += ` ${loginStatus.email}`;
            }
            else {
                $user.innerHTML += ' Not Logged In';
            }
        }

        // user buttons
        let $userLogin = document.createElement('ul');
        {
            $userLogin.classList.add('user-login');
            $topEnd.appendChild($userLogin);

            if (loginStatus.loggedIn) {

                // sign out button
                let $login = document.createElement('li');
                {
                    let $aSignOut = document.createElement('a');
                    {
                        $aSignOut.title = 'Sign Out';
                        $aSignOut.href = 'javascript:void(0)';
                        $login.appendChild($aSignOut);
                        $aSignOut.addEventListener('click', function() {
                            SunsetSkin.getInstance().signOut();
                        });
                    }
                    $userLogin.appendChild($login);
                }

                // my account button
                let $register = document.createElement('li');
                {
                    let url = fixUrl('Login/MyAccount.aspx');
                    $register.innerHTML = '<a href="' + url + '">My Account</a>';
                    $userLogin.appendChild($register);
                }

                // admin button
                if (loginStatus.isAdmin) {
                    let $admin = document.createElement('li');
                    {
                        let url = fixUrl('Admin/Dashboard.aspx');
                        $admin.innerHTML = '<a href="' + url + '">Admin</a>';
                        $userLogin.appendChild($admin);
                    }
                }
            }
            else {
                // sign in button
                let $login = document.createElement('li');
                {
                    let url = fixUrl('Login/Login.aspx');
                    $login.innerHTML = '<a href="' + url + '">Sign In</a>';
                    $userLogin.appendChild($login);
                }

                // register button
                let $register = document.createElement('li');
                {
                    let url = fixUrl('Login/Login.aspx?register=1');
                    $register.innerHTML = '<a href="' + url + '">Register</a>';
                    $userLogin.appendChild($register);
                }
            }
        }

        return $topEnd;
    }

}