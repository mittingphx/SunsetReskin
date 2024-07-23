// noinspection HtmlUnknownTarget

import {Format} from "../util/Format.js";
import {ProductCategoryBreadcrumb} from "../parsers/CommonParser.js";
import {LoginStatus} from "../models/LoginStatus.js";
import {SunsetSkin} from "../SunsetSkin.js";
import {ShoppingCart} from "../models/ShoppingCart.js";
import {CartProductItem} from "../models/CartProductItem.js";

/**
 * Builds the cart page and cart dropdown html.
 */
export class ViewCartBuilder {

    /**
     * Constructor
     */
    constructor() {
    }

    /**
     * Builds the shopping cart view.
     * @param cart {ShoppingCart}
     * @param loginStatus {LoginStatus}
     * @returns {HTMLDivElement}
     */
    build(cart, loginStatus) {

        let $cart = document.createElement('div');
        $cart.classList.add('shopping-cart', 'section');
        {
            let $container = document.createElement('div');
            $container.classList.add('container');
            $cart.appendChild($container);
            {
                let $cartListHead = document.createElement('div');
                $cartListHead.classList.add('cart-list-head');
                $container.appendChild($cartListHead);
                {
                    // header row
                    let $cartListTitle = document.createElement('div');
                    $cartListTitle.classList.add('cart-list-title');
                    $cartListHead.appendChild($cartListTitle);
                    {
                        let $row = document.createElement('div');
                        $row.classList.add('row');
                        $cartListTitle.appendChild($row);
                        {
                            // image column
                            let $cell0 = document.createElement('div');
                            $cell0.classList.add('col-lg-1', 'col-md-1', 'col-12');
                            $row.appendChild($cell0);

                            // product name column
                            let $cell1 = document.createElement('div');
                            $cell1.classList.add('col-lg-4', 'col-md-3', 'col-12');
                            $cell1.innerHTML = '<p>Product Name</p>';
                            $row.appendChild($cell1);

                            // price
                            let $cell2 = document.createElement('div');
                            $cell2.classList.add('col-lg-2', 'col-md-2', 'col-12');
                            $cell2.innerHTML = '<p>Price</p>';
                            $row.appendChild($cell2);

                            // quantity
                            let $cell3 = document.createElement('div');
                            $cell3.classList.add('col-lg-2', 'col-md-2', 'col-12');
                            $cell3.innerHTML = '<p>Quantity</p>';
                            $row.appendChild($cell3);

                            // subtotal
                            let $cell4 = document.createElement('div');
                            $cell4.classList.add('col-lg-2', 'col-md-2', 'col-12');
                            $cell4.innerHTML = '<p>Subtotal</p>';
                            $row.appendChild($cell4);

                            // remove
                            let $cell5 = document.createElement('div');
                            $cell5.classList.add('col-lg-1', 'col-md-2', 'col-12');
                            $cell5.innerHTML = '<p>Remove</p>';
                            $row.appendChild($cell5);
                        }
                    }
                }

                // empty cart because not logged in
                if (!loginStatus || !loginStatus.loggedIn) {
                    let $outerDiv = document.createElement('div');
                    {
                        $outerDiv.classList.add('cart-empty');
                        $container.appendChild($outerDiv);
                        let $row = document.createElement('div');
                        {
                            $row.classList.add('row');
                            $outerDiv.appendChild($row);
                            {
                                let $cell = document.createElement('div');
                                $cell.classList.add('col-lg-12', 'col-md-12', 'col-12');
                                $cell.innerHTML = '<p>You must be logged in to view your cart.</p>';
                                $row.appendChild($cell);
                            }
                        }
                    }
                }
                else {
                    // cart list
                    for (let item of cart.items) {
                        $container.appendChild(this.buildCartItemRow(cart, item));
                    }

                    // cart summary
                    $container.appendChild(this.buildCartSummary(cart));
                }
            }
        }
        return $cart;
    }

    /**
     * Builds one row for the shopping cart.
     * @param cart {ShoppingCart}
     * @param item {CartProductItem}
     * @returns {HTMLDivElement}
     */
    buildCartItemRow(cart, item) {

        let $cartItem = document.createElement('div');
        $cartItem.classList.add('cart-single-list');

        let $row = document.createElement('div');
        {
            $row.classList.add('row');
            $cartItem.appendChild($row);

            // image cell
            let $cell0 = document.createElement('div');
            $cell0.classList.add('col-lg-1', 'col-md-1', 'col-12');
            $row.appendChild($cell0);
            {
                let $a = document.createElement('a');
                $a.href = item.link;
                $cell0.appendChild($a);

                let $image = document.createElement('img');
                $image.classList.add('cart-image');
                $image.src = item.image;
                $a.appendChild($image);
            }

            // product text and link
            let $cell1 = document.createElement('div');
            {
                $cell1.classList.add('col-lg-4', 'col-md-3', 'col-12');
                $row.appendChild($cell1);

                let $h5 = document.createElement('h5');
                {
                    $h5.classList.add('product-name');
                    $cell1.appendChild($h5);

                    let $a = document.createElement('a');
                    $a.href = item.link;
                    $a.innerHTML = item.description;
                    $h5.appendChild($a);
                }

                let $p = document.createElement('p');
                {
                    $p.classList.add('product-des');
                    $cell1.appendChild($p);

                    if (item.unitType) {
                        let $spanUnit = document.createElement('span');
                        $p.appendChild($spanUnit);
                        $spanUnit.innerHTML = '<em>Unit:</em> ' + item.unitType;
                    }
                }
            }

            // price
            let $cell2 = document.createElement('div');
            $cell2.classList.add('col-lg-2', 'col-md-2', 'col-12');
            $cell2.innerHTML = '<p>' + Format.money(item.price) + '</p>';
            $row.appendChild($cell2);

            // quantity
            let $cell3 = document.createElement('div');
            {
                $cell3.classList.add('col-lg-2', 'col-md-2', 'col-12');
                $row.appendChild($cell3);

                let $countDiv = document.createElement('div');
                $countDiv.classList.add('count-input');
                $cell3.appendChild($countDiv);

                let $input = document.createElement('input');
                $input.style.width = '50px';
                $input.type = 'number';
                $input.value = item.quantity.toString();
                item.$newQuantity = $input;
                $countDiv.appendChild($input);

                $input.addEventListener('change', () => {
                    item.quantity = parseInt($input.value);
                    $row.querySelector('.subtotal').innerHTML = Format.money(item.total);
                    document.querySelector('.total-price').innerHTML = Format.money(cart.total);
                });
            }

            // subtotal
            let $cell4 = document.createElement('div');
            $cell4.classList.add('col-lg-2', 'col-md-2', 'col-12');
            $cell4.innerHTML = '<p class="subtotal">' + Format.money(item.total) + '</p>';
            $row.appendChild($cell4);

            // remove
            let $cell5 = document.createElement('div');
            {
                $cell5.classList.add('col-lg-1', 'col-md-2', 'col-12');

                let $aRemove = document.createElement('a');
                $aRemove.href = 'javascript:;';
                $cell5.appendChild($aRemove);
                item.$newCheckbox = $aRemove;

                let $icon = document.createElement('i');
                $icon.classList.add('fa', 'fa-toggle-off', 'fa-2x');
                $aRemove.appendChild($icon);

                $aRemove.addEventListener('click', () => {
                    if ($aRemove.classList.contains('remove')) {
                        $aRemove.classList.remove('remove');
                        $icon.classList.add('fa-toggle-off');
                        $icon.classList.remove('fa-toggle-on');
                        item.markedForDeletion = false;
                    }
                    else {
                        $aRemove.classList.add('remove');
                        $icon.classList.remove('fa-toggle-off');
                        $icon.classList.add('fa-toggle-on');
                        item.markedForDeletion = true;
                    }
                });
            }
            $row.appendChild($cell5);
        }

        return $cartItem;
    }


    /**
     * Builds the total area for the shopping cart.
     * @param cart {ShoppingCart}
     * @returns {HTMLDivElement}
     */
    buildCartSummary(cart) {

        let $div = document.createElement('div');
        $div.classList.add('row');
        {
            let $col = document.createElement('div');
            {
                $col.classList.add('col-12');
                $div.appendChild($col);

                let $totalAmount = document.createElement('div');
                {
                    $totalAmount.classList.add('total-amount');
                    $col.appendChild($totalAmount);

                    let $row = document.createElement('div');
                    {
                        $row.classList.add('row');
                        $totalAmount.appendChild($row);

                        // left side
                        let $col1 = document.createElement('div');
                        {
                            $col1.classList.add('col-lg-8', 'col-md-6', 'col-12');
                            $row.appendChild($col1);

                            let $left = document.createElement('div');
                            {
                                $left.classList.add('left');
                                $col1.appendChild($left);


                                // update button (test)
                                let $divButtonUpdate = document.createElement('div');
                                {
                                    $divButtonUpdate.classList.add('button');
                                    $left.appendChild($divButtonUpdate);

                                    let $a1 = document.createElement('a');
                                    {
                                        $a1.classList.add('btn', 'btn-update-cart');
                                        $a1.innerHTML = 'Update Cart';
                                        $divButtonUpdate.appendChild($a1);

                                        $a1.addEventListener('click', () => {
                                            cart.updateCart()
                                        });
                                    }
                                } // end buttons

                            }
                        }

                        // right side
                        let $col2 = document.createElement('div');
                        {
                            $col2.classList.add('col-lg-4', 'col-md-6', 'col-12');
                            $row.appendChild($col2);

                            let $right = document.createElement('div');
                            {
                                $right.classList.add('right');
                                $col2.appendChild($right);

                                // subtotal lines
                                let $ul = document.createElement('ul');
                                {
                                    $right.appendChild($ul);

                                    let $li1 = document.createElement('li');
                                    {
                                        $ul.appendChild($li1);
                                        $li1.innerHTML = 'Total Price: <span class="total-price">' + Format.money(cart.total) + '</span>';
                                    }

                                    let $li2 = document.createElement('li');
                                    {
                                        $ul.appendChild($li2);
                                        $li2.innerHTML = 'Shipping: ';

                                        let $span = document.createElement('span');
                                        {
                                            $li2.appendChild($span);
                                        }

                                        let $selectShip = document.createElement('select');
                                        {
                                            $selectShip.style.width = '150px';
                                            $span.appendChild($selectShip);
                                            cart.$newShipping = $selectShip

                                            let $optionLabel = document.createElement('option');
                                            {
                                                $optionLabel.value = '0';
                                                $optionLabel.innerHTML = 'Select Shipping';
                                                $selectShip.appendChild($optionLabel);
                                            }

                                            let $option = document.createElement('option');
                                            {
                                                $option.value = '1';
                                                $option.innerHTML = 'Delivery';
                                                $selectShip.appendChild($option);
                                            }

                                            let $option2 = document.createElement('option');
                                            {
                                                $option2.value = '2';
                                                $option2.innerHTML = 'Pick Up';
                                                $selectShip.appendChild($option2);
                                            }
                                        }

                                        $selectShip.addEventListener('change', () => {
                                            switch ($selectShip.value) {
                                                case '1':
                                                    //cart.$oldShipping.value = 'Delivery';
                                                    cart.$oldShipping.selectedIndex = 0;

                                                    break;
                                                case '2':
                                                    //cart.$oldShipping.value = 'Pick-Up';
                                                    cart.$oldShipping.selectedIndex = 1;
                                                    break;
                                            }
                                        })
                                    } // end line 2

                                    let $li3 = document.createElement('li');
                                    {
                                        $ul.appendChild($li3);
                                        $li3.innerHTML = 'PO Number: ';
                                        let $span = document.createElement('span');
                                        {
                                            $li3.appendChild($span);

                                            let $input = document.createElement('input');
                                            {
                                                $input.style.width = '150px';
                                                $input.type = 'text';
                                                $input.placeholder = 'Enter PO Number';
                                                $span.appendChild($input);
                                                cart.$newPO = $input;
                                                cart.$newPO.addEventListener('input', () => {
                                                   cart.$oldPO.value = cart.$newPO.value
                                                });
                                            }
                                        }
                                    } // end of line 3

                                    let $li4 = document.createElement('li');
                                    {
                                        $ul.appendChild($li4);
                                        $li4.innerHTML = 'Message: ';
                                        let $span = document.createElement('span');
                                        {
                                            $li4.appendChild($span);

                                            let $input = document.createElement('input');
                                            {
                                                $input.style.width = '150px';
                                                $input.type = 'text';
                                                $input.placeholder = 'Enter Message';
                                                $span.appendChild($input);
                                                cart.$newMessage = $input;
                                                cart.$newMessage.addEventListener('input', () => {
                                                    cart.$oldMessage.value = cart.$newMessage.value;
                                                })
                                            }
                                        }
                                    } // end of line 4


                                } // end subtotal lines

                                // buttons for checkout
                                let $divButton = document.createElement('div');
                                {
                                    $divButton.classList.add('button');
                                    $right.appendChild($divButton);

                                    let $a1 = document.createElement('a');
                                    {
                                        $a1.classList.add('btn');
                                        $a1.innerHTML = 'Checkout';
                                        $divButton.appendChild($a1);

                                        $a1.addEventListener('click', () => {
                                            cart.updateAndSubmit();
                                        });
                                    }

                                    let $a2 = document.createElement('a');
                                    {
                                        $a2.classList.add('btn', 'btn-alt');
                                        $a2.innerHTML = 'Continue Shopping';
                                        $divButton.appendChild($a2);

                                        $a2.addEventListener('click', async () => {
                                            await SunsetSkin.getInstance().navigateTo('Default.aspx');
                                        });
                                    }
                                } // end buttons
                            } // end right panel
                        }
                    }
                }
            }
        }
        return $div;
    }

    /**
     * Creates breadcrumbs to show on the view cart screen.
     * @returns {ProductCategoryBreadcrumb}
     */
    buildBreadCrumbs() {

        let ret = new ProductCategoryBreadcrumb();

        ret.name = "View Shopping Cart";
        //ret.link = "#";
        ret.current = true;
        ret.parent = new ProductCategoryBreadcrumb();

        ret.parent.name = "Home";
        ret.parent.link = "Default.aspx";
        ret.parent.parent = null;

        return ret;
    }


    /**
     * Builds the dropdown preview of the cart available on every page.
     * @param cart {ShoppingCart}
     * @param loginStatus {LoginStatus}
     * @returns {HTMLDivElement}
     */
    buildCartDropdown(cart, loginStatus) {

        let $cartItems = document.createElement('div');
        {
            $cartItems.classList.add('cart-items', 'ddl-cart');

            // button with item count badge
            let $btn = document.createElement('a');
            {
                $btn.classList.add('main-btn');
                $btn.href = 'javascript:void(0)';
                $cartItems.appendChild($btn);

                let $i = document.createElement('i');
                {
                    $i.classList.add('lni', 'lni-cart');
                    $btn.appendChild($i);
                }

                let $span = document.createElement('span');
                {
                    $span.classList.add('total-items');
                    $span.innerHTML = cart.items.length.toString();
                    $btn.appendChild($span);
                }
            }

            // dropdown display
            let $divShopping = document.createElement('div');
            {
                $divShopping.classList.add('shopping-item');
                $cartItems.appendChild($divShopping);

                // header
                let $header = document.createElement('div');
                {
                    $header.classList.add('dropdown-cart-header');
                    $divShopping.appendChild($header);

                    let $span = document.createElement('span');
                    {
                        $span.classList.add('total-items');
                        let count = cart.items.length;
                        $span.innerHTML = count.toString() + ' Item' + (count === 1 ? '' : 's');
                        $header.appendChild($span);
                    }

                    let $a = document.createElement('a');
                    {
                        $a.href = 'ViewCart.aspx';
                        $a.innerHTML = 'View Cart';
                        $header.appendChild($a);
                    }
                }

                // cart error
                if (cart.errorMessage) {
                    let $ul = document.createElement('ul');
                    {
                        $ul.classList.add('error-list');
                        $divShopping.appendChild($ul);

                        $ul.innerHTML = '<li>' + cart.errorMessage + '</li>';
                    }
                }

                // cart items
                let $ul = document.createElement('ul');
                {
                    $ul.classList.add('shopping-list');
                    $divShopping.appendChild($ul);

                    if (!loginStatus.loggedIn) {
                        $ul.innerHTML = '<li>Please <a href="Login/Login.aspx?redirect=ViewCart.aspx">sign in</A to view cart</li>';
                        return $cartItems;
                    }

                    for (let item of cart.items) {
                        $ul.appendChild(this.buildCartDropDownItemRow(cart, item));
                    }
                    if (cart.items.length === 0) {
                        $ul.innerHTML = '<li>No items in cart</li>';
                    }
                }

                // footer
                let $footer = document.createElement('div');
                {
                    $footer.classList.add('bottom');
                    $divShopping.appendChild($footer);

                    if (!cart.isEmpty()) {

                        let $total = document.createElement('div');
                        {
                            $total.classList.add('total');
                            $footer.appendChild($total);

                            let $span1 = document.createElement('span');
                            {
                                $span1.innerHTML = 'Total '
                                $total.appendChild($span1);
                            }

                            let $span2 = document.createElement('span');
                            {
                                $span2.classList.add('total-amount');
                                $span2.innerHTML = '$' + cart.total.toFixed(2);
                                $total.appendChild($span2);
                            }
                        }

                        if (!loginStatus || loginStatus.loggedIn === false) {
                            let $btn = document.createElement('div');
                            {
                                $btn.innerHTML = 'You need to Sign In to checkout your cart.';
                                $footer.appendChild($btn);
                            }

                            let $a = document.createElement('a');
                            {
                                $a.classList.add('btn', 'animate');
                                $a.href = 'Login/Login.aspx';
                                $a.innerHTML = 'Sign In';
                                $btn.appendChild($a);
                            }
                        }
                        else {
                            let $btn = document.createElement('div');
                            {
                                $btn.classList.add('button');
                                $footer.appendChild($btn);

                                let $a = document.createElement('a');
                                {
                                    $a.classList.add('btn', 'animate');
                                    $a.href = 'ViewCart.aspx';
                                    $a.innerHTML = 'Checkout';
                                    $btn.appendChild($a);
                                }
                            }
                        }
                    }
                }
            }
        }
        return $cartItems;
    }

    /**
     * Builds on item view withing the dropdown cart preview.
     * @param cart {ShoppingCart}
     * @param item {CartProductItem}
     * @returns {HTMLLIElement}
     */
    buildCartDropDownItemRow(cart, item) {

        let $li = document.createElement('li');
        {
            let $removeA = document.createElement('a');
            {
                $removeA.classList.add('remove');
                $removeA.href = 'javascript:void(0)';
                $removeA.title = 'Remove this item';
                $removeA.innerHTML = '<i class="lni lni-close"></i>';
                $removeA.addEventListener('click', () => {
                    cart.remove(item);
                });

                $li.appendChild($removeA);
            }

            let $divImg = document.createElement('div');
            {
                $divImg.classList.add('cart-img-head');
                $li.appendChild($divImg);

                let $imgA = document.createElement('a');
                {
                    $imgA.href = item.link;
                    $imgA.classList.add('cart-img');
                    $divImg.appendChild($imgA);

                    let $img = document.createElement('img');
                    {
                        $img.src = item.image;
                        $img.alt = item.description;
                        $imgA.appendChild($img);
                    }
                }
            }

            let $divContent = document.createElement('div');
            {
                $divContent.classList.add('content');
                $li.appendChild($divContent);

                let $h4 = document.createElement('h4');
                {
                    $h4.innerHTML = item.description;
                    $divContent.appendChild($h4);
                }

                let $p = document.createElement('p');
                {
                    $p.classList.add('quantity');
                    $p.innerHTML = item.quantity +'x - ';
                    $divContent.appendChild($p);

                    let $spanPrice = document.createElement('span');
                    {
                        $spanPrice.classList.add('amount');
                        $spanPrice.innerHTML = item.price.toFixed(2);
                        $p.appendChild($spanPrice);
                    }
                }
            }

        }
        return $li;
    }
}