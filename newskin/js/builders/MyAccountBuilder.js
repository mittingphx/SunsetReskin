import {MyAccountForm} from "../models/MyAccountForm.js";
import {SunsetSkin} from "../SunsetSkin.js";
import {SplitUrl} from "../UrlHelper.js";
import {MyAccountController} from "../controllers/MyAccountController.js";
import {PageLoadHelper} from "../util/PageLoadHelper.js";
import {DomHelper} from "../util/DomHelper.js";
import {AspNetPostback} from "../util/AspNetPostback.js";

let DEBUG_MODE = true; // shows the iframe for testing background calls

/**
 * Builds the HTML for the account page.
 */
export class MyAccountBuilder {

    /**
     * The main program reference.
     * @type {SunsetSkin}
     */
    skin = null;

    /**
     * The controller for the MyAccount page.
     * @type {MyAccountController|null}
     */
    controller = null;

    /**
     * Constructor takes reference to the skin to be built.
     * @param skin
     * @param controller {MyAccountController}
     */
    constructor(skin, controller) {
        this.skin = skin;
        this.controller = controller;
    }

    /**
     * Builds the HTML for the account page.
     * @param $myAccountForm {MyAccountForm}
     */
    build($myAccountForm) {

        //console.log('build(myAccountForm)', $myAccountForm);

        // my account section (right sidebar)
        document.querySelector('#txtName').innerHTML = $myAccountForm.$spanName.innerHTML;
        document.querySelector('#txtCompany').innerHTML = $myAccountForm.$spanCompany.innerHTML;
        document.querySelector('#txtAcctNo').innerHTML = $myAccountForm.acctNo;

        // order history
        //let $orderHistoryTable = this.#buildOrderHistoryTable($myAccountForm.orders);
        let $orderHistoryTable = this.#buildLoadingTable();
        document.querySelector('.order-history-insertion-point').after($orderHistoryTable);

        // set up the order loading event listener.  show the full order history once it's loaded
        this.controller.parser.onOrdersLoaded.addListener((orders, allPages) => {
            console.log('onOrdersLoaded', orders, allPages);
            $orderHistoryTable.remove(); // remove old one
            $orderHistoryTable = this.#buildOrderHistoryTable(orders);
            document.querySelector('.order-history-insertion-point').after($orderHistoryTable);
            document.querySelector('.page-buttons').remove();
        });

        // shipping addresses
        let $shippingAddressTable = this.#buildShippingAddressTable($myAccountForm.shippingAddresses);
        document.querySelector('.shipping-addresses-insertion-point').after($shippingAddressTable);

        // shipping address buttons
        let addressForm = {};
        DomHelper.addElementsByQuery(addressForm, {
            $btnAddShipping: '#btnAddShipping',
            $panelEditAddress: '.panel-edit-address',
            $btnSaveShipping: '#btnSaveAddress',
            $btnCancelShipping: '#btnCancelEditAddress'
        });
        addressForm.$btnAddShipping.addEventListener('click', () => {
            addressForm.$panelEditAddress.style.display = 'flex';
            this.#addShippingAddress();
        });

        // my account page buttons
        let form = {};
        DomHelper.addElementsByQuery(form, {
            $btnChangePassword: '#btnChangePassword',
            $panelChangePassword: '.change-password-panel',
            $btnCancelChangePassword: '#btnCancelChangePassword',
            $btnSaveChangePassword: '#btnSaveChangePassword',
            $btnLogout: '#btnLogout'
        });

        form.$btnChangePassword.addEventListener('click', () => {
            form.$panelChangePassword.style.display = 'block';
        });
        form.$btnCancelChangePassword.addEventListener('click', () => {
            form.$panelChangePassword.style.display = 'none';
        });
        form.$btnSaveChangePassword.addEventListener('click', () => {
            form.$panelChangePassword.style.display = 'none';
            this.#doChangePasswordInBackground();
        });
        form.$btnLogout.addEventListener('click', () => {
            SunsetSkin.getInstance().signOut();
        });

        // set breadcrumbs
        document.querySelector('.breadcrumbs .page-title').innerHTML = 'My Account - ' + $myAccountForm.acctNo;
    }

    /**
     * Shows an error message for an attempt to change the password.
     * @param msg {string}
     */
    #showChangePasswordError(msg) {
        alert('Error changing password: ' + msg);
    }

    /**
     * Creates the <table> for the order history table while its loading
     *
     * @return {HTMLTableElement}
     */
    #buildLoadingTable() {
        let $table = document.createElement('table');
        {
            $table.classList.add('admin-table');
            $table.appendChild(this.#buildOrderTableHead());
            let $tbody = document.createElement('tbody');
            {
                $tbody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
                $table.appendChild($tbody);
            }
        }
        return $table;
    }

    /**
     * Creates the <table> for the order history table.
     * @param orders {OrderHistoryRow[]}
     * @returns {HTMLTableElement}
     */
    #buildOrderHistoryTable(orders) {
        let $table = document.createElement('table');
        {
            $table.classList.add('admin-table');
            $table.appendChild(this.#buildOrderTableHead());
            let $tbody = document.createElement('tbody');
            {
                for (let order of orders) {
                    $tbody.appendChild(this.#buildOrderRow(order));
                }
                $table.appendChild($tbody);
            }
        }
        return $table;
    }

    /**
     * Created the <thead> for the orders table.
     * @return {HTMLTableSectionElement}
     */
    #buildOrderTableHead() {
        let $thead = document.createElement('thead');
        {
            let $trHead = document.createElement('tr');
            {
                $trHead.innerHTML = '<th>&nbsp;</th><th>Order No</th><th>Order Date</th><th>Invoice No</th><th>Status</th><th>Total</th>';
                $thead.appendChild($trHead);
            }
        }
        return $thead;
    }

    /**
     * Builds a single row for the order history table.
     * @param order {OrderHistoryRow}
     * @returns {HTMLTableRowElement}
     */
    #buildOrderRow(order) {
        let $row = document.createElement('tr');
        {
            // link cell
            let $tdLink = document.createElement('td');
            {
                $tdLink.classList.add('link');
                let $view = document.createElement('a');
                {
                    $view.href = '#';
                    $view.title = 'View Order';
                    $view.innerHTML = '<i class="lni lni-tag"></i> View Order';
                    $view.addEventListener('click', (event) => {
                        event.preventDefault();
                        // order.$link.click();
                        document.location = SplitUrl.findDeployment(null) + 'ViewOrder.aspx?OrderNo=' + order.orderNo;
                    });
                }
                $tdLink.appendChild($view);
                $row.appendChild($tdLink);
            }

            // orderNo cell
            let $tdOrderNo = document.createElement('td');
            {
                $tdOrderNo.innerHTML = order.orderNo;
                $row.appendChild($tdOrderNo);
            }

            // orderDate cell
            let $tdOrderDate = document.createElement('td');
            {
                $tdOrderDate.innerHTML = order.orderDate
                $row.appendChild($tdOrderDate);
            }

            // invoiceNo cell
            let $tdInvoiceNo = document.createElement('td');
            {
                $tdInvoiceNo.innerHTML = order.invoiceNo
                $row.appendChild($tdInvoiceNo);
            }

            // orderStatus cell
            let $tdOrderStatus = document.createElement('td');
            {
                $tdOrderStatus.innerHTML = order.orderStatus
                $row.appendChild($tdOrderStatus);
            }

            // orderTotal cell
            let $tdOrderTotal = document.createElement('td');
            {
                $tdOrderTotal.classList.add('money');
                $tdOrderTotal.innerHTML = '$' + order.orderTotal
                $row.appendChild($tdOrderTotal);
            }
        }
        return $row;
    }

    /**
     * Creates the <table> for the list of shipping addresses.
     * @param shippingAddresses {ShippingAddress[]}
     * @returns {HTMLTableElement}
     */
    #buildShippingAddressTable(shippingAddresses) {

        let $table = document.createElement('table');
        {
            $table.classList.add('admin-table');
            let $thead = document.createElement('thead');
            {
                let $trHead = document.createElement('tr');
                {
                    $trHead.innerHTML = '<th>&nbsp;</th><th>Name</th><th>Address</th><th>Phone Numbers</th><th>&nbsp;</th>';
                    $thead.appendChild($trHead);
                }
                $table.appendChild($thead);
            }
            let $tbody = document.createElement('tbody');
            {
                for (let shippingAddress of shippingAddresses) {
                    $tbody.appendChild(this.#buildShippingAddressRow(shippingAddress));
                }
                $table.appendChild($tbody);
            }
        }
        return $table;
    }

    /**
     * Builds a single row for the list of shipping addresses.
     * @param shippingAddress {ShippingAddress}
     * @returns {HTMLTableRowElement}
     */
    #buildShippingAddressRow(shippingAddress) {

        function formatZip(zip) {
            if (zip.length > 5) {
                if (zip.indexOf('-') === -1) {
                    return zip.substring(0, 5) + '-' + zip.substring(5, 9);
                }
            }
            return zip;
        }

        function formatPhone(type, phone) {
            if (!phone) return '';
            if (phone === '') return '';

            if (phone.length === 10) {
                phone = '(' + phone.substring(0, 3) + ') ' + phone.substring(3, 6) + '-' + phone.substring(6, 10);
            }
            while (type.length < 4) {
                type = ' ' + type;
            }
            type = type.replace(/ /g, '&nbsp;');

            return type + ': ' + phone + '<br>';
        }

        let $row = document.createElement('tr');
        {
            // edit link cell
            let $tdLink = document.createElement('td');
            {
                let $edit = document.createElement('a');
                {
                    $edit.href = '#';
                    $edit.innerHTML = '<i class="lni lni-pencil"></i> Edit';
                    $edit.addEventListener('click', (event) => {
                        event.preventDefault();
                        this.#editShippingAddress(shippingAddress.$link)
                    });
                }
                $tdLink.appendChild($edit);
                $row.appendChild($tdLink);
            }

            // name cell
            let $tdName = document.createElement('td');
            {
                $tdName.innerHTML = shippingAddress['addressName'];
                $row.appendChild($tdName);
            }

            // address cell
            let $tdAddress = document.createElement('td');
            {
                $tdAddress.innerHTML
                    = shippingAddress['businessAddress'] + ' ' + shippingAddress['unitNo'] + '<br>'
                    + shippingAddress['city'] + ', ' + shippingAddress['state'] + ' '
                    + formatZip(shippingAddress['zipCode']);
                $row.appendChild($tdAddress);
            }

            // phone numbers cell
            let $tdPhone = document.createElement('td');
            {
                let html = '';
                html += formatPhone('Ph', shippingAddress['phoneNumber']);
                html += formatPhone('Cell', shippingAddress['cellNumber']);
                html += formatPhone('Fax', shippingAddress['faxNumber']);
                $tdPhone.innerHTML = html;
                $tdPhone.style.fontFamily = 'monospace';
                $row.appendChild($tdPhone);
            }

            // delete link cell
            let $tdDelete = document.createElement('td');
            {
                let $delete = document.createElement('a');
                {
                    $delete.href = '#';
                    $delete.innerHTML = '<i class="lni lni-trash-can"></i> Delete';
                    $delete.addEventListener('click', (event) => {
                        event.preventDefault();
                        this.#deleteShippingAddress(shippingAddress.$deleteLink);
                    });
                }
                $tdDelete.appendChild($delete);
                $row.appendChild($tdDelete);
            }
        }
        return $row;
    }

    /**
     * Clears out the shipping address form and sets up events to add a new record.
     */
    #addShippingAddress() {
        this.#editShippingAddress(null);
    }

    /**
     * Deletes the selected shipping address.
     * @param $link {HTMLAnchorElement}
     */
    #deleteShippingAddress($link) {
        AspNetPostback.runInBackground('Login/MyAccount.aspx?reskin=no', $link, (wnd, iframe) => {

            alert('Address deleted');
            location.reload();
        });
    }

    /**
     * Selects a shipping address to edit.  This clicks the edit button
     * on the old page, intercepting the postback into an iframe which
     * uses two-way binding with the visible form to allows saving using
     * the old page's form.
     * @param $link {HTMLAnchorElement} (null to go into add mode)
     */
    #editShippingAddress($link) {

        AspNetPostback.runInBackground('Login/MyAccount.aspx?reskin=no', $link, (wnd, iframe) => {

            // show edit panel
            let $editPanel = document.querySelector('.panel-edit-address');
            $editPanel.style.display = 'flex';

            // get the address form from the old site
            let addressForm = {};
            DomHelper.addElementsByQuery(addressForm, wnd.document, {
                $txtName: 'input#MainContent_TxtName',
                $txtAddress: 'input#MainContent_TxtAddress',
                $txtApartment: 'input#MainContent_TxtApartment',
                $txtZipCode: 'input#MainContent_TxtZipCode',
                $txtCity: 'input#MainContent_TxtCity',
                //$txtState: 'input#MainContent_TxtState',
                //$txtCountry: 'input#MainContent_TxtCountry',
                $txtPhone: 'input#MainContent_TxtPhone',
                $txtCell: 'input#MainContent_TxtCell',
                $txtFax: 'input#MainContent_TxtFax',
                $btnAdd: 'input#MainContent_BtnAddAddress',
                $btnCancel: 'input#MainContent_BtnCancel',
                $ddlState: 'select#MainContent_DropState'
            });

            // get the form displayed on the new site
            let displayForm = {};
            DomHelper.addElementsByQuery(displayForm, {
                $txtAddressName: 'input#txtAddressName',
                $txtBusinessAddress: 'input#txtBusinessAddress',
                $txtUnitNumber: 'input#txtUnitNumber',
                $txtCity: 'input#txtCity',
                $ddlState: 'select#ddlState',
                $txtZipCode: 'input#txtZipCode',
                $txtPhoneNumber: 'input#txtPhoneNumber',
                $txtCellNumber: 'input#txtCellNumber',
                $txtFaxNumber: 'input#txtFaxNumber',
                $btnSaveAddress: 'button#btnSaveAddress',
                $btnCancelEditAddress: 'button#btnCancelEditAddress'
            });

            console.log({displayForm:displayForm, addressForm:addressForm});

            // make two-way binding between the two pages
            this.#twoWayBind(displayForm.$txtAddressName, addressForm.$txtName);
            this.#twoWayBind(displayForm.$txtBusinessAddress, addressForm.$txtAddress);
            this.#twoWayBind(displayForm.$txtUnitNumber, addressForm.$txtApartment);
            this.#twoWayBind(displayForm.$txtCity, addressForm.$txtCity);
            this.#twoWayBind(displayForm.$ddlState, addressForm.$ddlState);
            this.#twoWayBind(displayForm.$txtZipCode, addressForm.$txtZipCode);
            this.#twoWayBind(displayForm.$txtPhoneNumber, addressForm.$txtPhone);
            this.#twoWayBind(displayForm.$txtCellNumber, addressForm.$txtCell);
            this.#twoWayBind(displayForm.$txtFaxNumber, addressForm.$txtFax);

            // make save and cancel buttons work
            function onSave() {

                // make sure phone numbers won't fail validation
                function cleanPhoneNumber($field, fieldName) {
                    $field.value = $field.value.replace(/[^0-9]/g, '');
                    if ($field.value === '') {
                        $field.value = '6020000000';
                    }
                    if ($field.value.length < 10) {
                        alert('Please enter a valid ' + fieldName);
                        return true;
                    }
                    return false;
                }
                if (cleanPhoneNumber(addressForm.$txtPhone, 'phone number')) {
                    return;
                }
                if (cleanPhoneNumber(addressForm.$txtCell, 'cell number')) {
                    return;
                }
                if (cleanPhoneNumber(addressForm.$txtFax, 'fax number')) {
                    return;
                }

                // tell old page to perform the save
                addressForm.$btnAdd.click();
                if ($link) {
                    alert('Address changes saved');
                }
                else {
                    alert('New address saved');
                }
                removeListeners();
                $editPanel.style.display = 'none';


                // reload the page so we can see the address changes
                if (DEBUG_MODE) {
                    alert('You should reload the page to see changes.\nCurrently this form is in DEBUG mode.')
                }
                else {
                    iframe.remove();
                    location.reload();
                }
            }

            function onCancel() {
                addressForm.$btnCancel.click();
                removeListeners();
                $editPanel.style.display = 'none';

                console.warn('not hiding iframe for testing')
                //iframe.remove();
            }

            function removeListeners() {
                displayForm.$btnSaveAddress.removeEventListener('click', onSave);
                displayForm.$btnCancelEditAddress.removeEventListener('click', onCancel);
            }

            displayForm.$btnSaveAddress.addEventListener('click', onSave);
            displayForm.$btnCancelEditAddress.addEventListener('click', onCancel);
        });
    }

    /**
     * Makes two-way binding between the two forms.
     * @param from {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement}
     * @param to {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement}
     */
    #twoWayBind(from, to) {
        // copy over value from old page to visible page
        from.value = to.value;

        // update value on old page upon changes
        if (from instanceof HTMLSelectElement) {
            from.addEventListener('change', (_) => {
                to.value = from.value;
            });
        }
        else {
            from.addEventListener('input', (_) => {
                to.value = from.value;
            });
        }
    }

    /**
     * Attempts to change the password using the old site in a hidden iframe.
     */
    #doChangePasswordInBackground() {

        // get passwords and make sure they match
        let pass1 = document.querySelector('#txtPassword').value;
        let pass2 = document.querySelector('#txtPassword2').value;
        if (pass1 !== pass2) {
            this.#showChangePasswordError('Passwords do not match!');
            return;
        }

        // use old site's form to change the password, detecting errors
        PageLoadHelper.fetchIntoHiddenIframe('Login/Login.aspx?ChangePassword=1&reskin=no',
            (wnd, html, iframe) => {

                // inject password change script
                let newScript = this.#getChangePasswordInjectionScript(pass1, pass2);
                html = html.replace('</body>', newScript.outerHTML + "</body>");
                html = PageLoadHelper.removeNewSkinScripts(html);

                // write to the new window
                wnd.document.open();
                wnd.document.write(html);
                wnd.document.close();

                // close hidden page and redirect once password change is complete
                PageLoadHelper.waitUntilPageChange(wnd, async _ => {

                    // check response for errors
                    let $lblError = wnd.document.querySelector('#MainContent_LblChangePasswordError');
                    if (!$lblError) {
                        console.error('Could not find lblError in change password response');
                    }
                    else if ($lblError.innerHTML !== '') {
                        this.#showChangePasswordError($lblError.innerHTML);
                        iframe.remove();
                        return;
                    }

                    // show success or error
                    alert('Password changed successfully!');
                    iframe.remove();
                });
            });
    }

    /**
     * Gets the javascript to inject into the hidden iframe to
     * perform the change password operation.
     * @param pass1 {string} the new password
     * @param pass2 {string} the confirmed password
     * @returns {HTMLScriptElement}
     */
    #getChangePasswordInjectionScript(pass1, pass2) {

        // code to inject into new window
        function injectScript() {

            let $txtPass1 = document.querySelector('#MainContent_TxtChangePassword');
            let $txtPass2 = document.querySelector('#MainContent_TxtChangePassword2');
            let $btnChangePassword = document.querySelector('#MainContent_BtnChangePassword');
            let $lblError = document.querySelector('#MainContent_LblChangePasswordError');
            console.log({
                txtPass1: $txtPass1,
                txtPass2: $txtPass2,
                btnChangePassword: $btnChangePassword,
                lblError: $lblError
            })

            if (!$txtPass1) {
                console.error('could not find password field! (#MainContent_TxtChangePassword)');
                return;
            }
            if (!$txtPass2) {
                console.error('could not find password field! (#MainContent_TxtChangePassword2)');
                return;
            }
            if (!$btnChangePassword) {
                console.error('could not find login button! (#MainContent_BtnChangePassword)');
                return;
            }
            if (!$lblError) {
                console.error('could not find error label! (#MainContent_LblChangePasswordError)');
                return;
            }

            $txtPass1.value = '%%PASS1%%';
            $txtPass2.value = '%%PASS2%%';

            let errorMessage = $lblError.innerHTML;
            if (errorMessage.length > 0) {
                alert($lblError.innerHTML);
            }
            else if ($btnChangePassword) {
                $btnChangePassword.click();
            }
        }

        // inject code into new script tag
        let newScript = document.createElement('script');
        let js = injectScript.toString();
        js = js.replace('%%PASS1%%', pass1);
        js = js.replace('%%PASS2%%', pass2);
        newScript.innerHTML = js + ' injectScript();';

        return newScript;
    }

}

