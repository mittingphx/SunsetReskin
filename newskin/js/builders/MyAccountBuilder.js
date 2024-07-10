import {MyAccountForm} from "../parsers/MyAccountParser.js";
import {SunsetSkin} from "../SunsetSkin.js";

/**
 * Builds the HTML for the account page.
 */
export class MyAccountBuilder {

    /**
     * Builds the HTML for the account page.
     * @param $myAccountForm {MyAccountForm}
     */
    build($myAccountForm) {

        console.log('build(myAccountForm)', $myAccountForm);

        // my account section (right sidebar)
        document.querySelector('#txtName').innerHTML = $myAccountForm.$spanName.innerHTML;
        document.querySelector('#txtCompany').innerHTML = $myAccountForm.$spanCompany.innerHTML;
        document.querySelector('#txtAcctNo').innerHTML = $myAccountForm.acctNo;

        // order history
        let $orderHistoryTable = this.#buildOrderHistoryTable($myAccountForm.orders);
        document.querySelector('.order-history-insertion-point').after($orderHistoryTable);

        // paging buttons
        // TODO: we might want to load this data offscreen instead of loading a new page

        document.querySelector('#btnFirst').disabled = $myAccountForm.$orderPaging.$btnFirst === null;
        document.querySelector('#btnPrev').disabled = $myAccountForm.$orderPaging.$btnPrev === null;
        document.querySelector('#btnNext').disabled = $myAccountForm.$orderPaging.$btnNext ===  null;
        document.querySelector('#btnLast').disabled = $myAccountForm.$orderPaging.$btnLast === null;
        document.querySelector('#btnFirst').addEventListener('click', () => {
            $myAccountForm.$orderPaging.$btnFirst.click();
        });
        document.querySelector('#btnPrev').addEventListener('click', () => {
            $myAccountForm.$orderPaging.$btnPrev.click();
        });
        document.querySelector('#btnNext').addEventListener('click', () => {
            $myAccountForm.$orderPaging.$btnNext.click();
        });
        document.querySelector('#btnLast').addEventListener('click', () => {
            $myAccountForm.$orderPaging.$btnLast.click();
        });

        // shipping addresses
        let $shippingAddressTable = this.#buildShippingAddressTable($myAccountForm.shippingAddresses);
        document.querySelector('.shipping-addresses-insertion-point').after($shippingAddressTable);

        // TODO: add shipping buttons

        // my account page buttons
        document.querySelector('#btnChangePassword').addEventListener('click', () => {
            // TODO: click the change password button?
            // load the change password page in the background
            // show a form for the user to enter their new password twice
            // write the new password to the page in the background and hit submit

            alert('TODO: not implemented');
        });
        document.querySelector('#btnLogout').addEventListener('click', () => {
            SunsetSkin.getInstance().signOut();
        });


        // set breadcrumbs
        document.querySelector('.breadcrumbs .page-title').innerHTML = 'My Account - ' + $myAccountForm.acctNo;

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
            let $thead = document.createElement('thead');
            {
                let $trHead = document.createElement('tr');
                {
                    $trHead.innerHTML = '<th>&nbsp;</th><th>Order No</th><th>Order Date</th><th>Invoice No</th><th>Status</th><th>Total</th>';
                    $thead.appendChild($trHead);
                }
                $table.appendChild($thead);
            }
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
     * Builds a single row for the order history table.
     * @param order {OrderHistoryRow}
     * @returns {HTMLTableRowElement}
     */
    #buildOrderRow(order) {
        const fields = [
            '$link',
            'orderNo',
            'orderDate',
            'invoiceNo',
            'orderStatus',
            'orderTotal'
        ];
        let $row = document.createElement('tr');
        {
            for (let field of fields) {
                let $td = document.createElement('td');
                if (field === '$link') {
                    let $view = document.createElement('a');
                    {
                        $view.href = '#';
                        $view.title = 'View Details';
                        $view.innerHTML = '<i class="lni lni-tag"></i>';
                        $view.addEventListener('click', (event) => {
                            event.preventDefault();
                            order.$link.click();
                        });
                    }
                    $td.appendChild($view);
                }
                else if (field === 'orderTotal') {
                    $td.classList.add('money');
                    $td.innerHTML = '$' + order[field];
                }
                else {
                    $td.innerHTML = order[field];
                }
                $row.appendChild($td);
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

        const fields = [
            '$link',
            'addressName',
            'fullAddress',
            'numbers',
            '$deleteLink'
        ];

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
            for (let field of fields) {
                let $td = document.createElement('td');
                if (field === '$link') {
                    let $edit = document.createElement('a');
                    {
                        $edit.href = '#';
                        $edit.innerHTML = '<i class="lni lni-pencil"></i>';
                        $edit.addEventListener('click', (event) => {
                            event.preventDefault();
                            console.log('edit clicked');
                            alert('TODO: need to go into edit mode');
                            shippingAddress.$link.click();
                        });
                    }
                    $td.appendChild($edit);
                }
                else if (field === '$deleteLink') {
                    let $delete = document.createElement('a');
                    {
                        $delete.href = '#';
                        $delete.innerHTML = '<i class="lni lni-trash-can"></i>';
                        $delete.addEventListener('click', (event) => {
                            event.preventDefault();
                            console.log('delete clicked');
                            alert('TODO: need to delete');
                            shippingAddress.$deleteLink.click();
                        });
                    }
                    $td.appendChild($delete);
                }
                else if (field === 'fullAddress') {
                    $td.innerHTML = shippingAddress['businessAddress'] + ' ' + shippingAddress['unitNo'] + '<br>'
                        + shippingAddress['city'] + ', ' + shippingAddress['state'] + ' ' + formatZip(shippingAddress['zipCode']);
                }
                else if (field === 'numbers') {
                    let html = '';
                    html += formatPhone('Ph', shippingAddress['phoneNumber']);
                    html += formatPhone('Cell', shippingAddress['cellNumber']);
                    html += formatPhone('Fax', shippingAddress['faxNumber']);
                    $td.innerHTML = html;
                    $td.style = 'font-family: monospace';
                }
                else {
                    $td.innerHTML = shippingAddress[field];
                }
                $row.appendChild($td);
            }
        }
        return $row;
    }

}

