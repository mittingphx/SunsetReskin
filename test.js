/**
 * This file is for testing classes.
 */


import {FetchHelper, FetchQueryItem, FetchQueryList} from "./newskin/js/util/FetchHelper.js";


let testArgs = new FetchQueryList({
    email: 'ContactUs.aspx/MainContent_TxtEmail',
    name: new FetchQueryItem('Login/MyAccount.aspx', 'MainContent_LblName'),
    company: ['Login/MyAccount.aspx', 'MainContent_LblCompany'],
    acctNo: {url: 'Login/MyAccount.aspx', query: 'MainContent_LblAcctNo'}
});
/*
let testArgs = new FetchQueryList({
    email: 'swwest_copy.html/.ButtonNoBlockUI',
    name: new FetchQueryItem('swwest_cart.html', '.accordionHeader'),
    company: ['swwest_copy.html', 'MainContent_LblCompany'],
    acctNo: {url: 'swwest_cart.html', query: '#formAuthorizeNetPopup'}
});*/

new FetchHelper().fetchAndQueryCallback(testArgs, (results) => {

    console.log({args:testArgs,urls:testArgs.getUniqueUrlList(),results: results});

});



