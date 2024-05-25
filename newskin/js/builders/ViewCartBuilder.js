import { ShoppingCart, CartProductItem } from '../parsers/ViewCartParser.js';
import {Format} from "../util/Format";

export class ViewCartBuilder {

    constructor() {
    }

    build() {
        // TODO: make this the function the main code calls.
    }

    /**
     * Builds the shopping cart view.
     * @param cart {ShoppingCart}
     * @returns {HTMLDivElement}
     */
    buildCartView(cart) {

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

                // cart list
                for (let item of cart.items) {
                    $container.appendChild(this.buildCartItemRow(cart, item));
                }

                // cart summary
                $container.appendChild(this.buildCartSummary(cart));


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
                    }
                    else {
                        $aRemove.classList.add('remove');
                        $icon.classList.remove('fa-toggle-off');
                        $icon.classList.add('fa-toggle-on');
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

                                let $coupon = document.createElement('div');
                                {
                                    $coupon.classList.add('coupon');
                                    $left.appendChild($coupon);

                                    let $form = document.createElement('form');
                                    {
                                        $form.action = '#';
                                        $form.target = '_blank';
                                        $coupon.appendChild($form);

                                        let $input = document.createElement('input');
                                        {
                                            $input.type = 'text';
                                            $input.placeholder = 'Enter Your Coupon';
                                            $form.appendChild($input);

                                            let $divButton = document.createElement('div');
                                            {
                                                $divButton.classList.add('button');
                                                $form.appendChild($divButton);

                                                let $button = document.createElement('button');
                                                {
                                                    $button.classList.add('btn');
                                                    $button.innerHTML = 'Apply Coupon';
                                                    $divButton.appendChild($button);
                                                }
                                            }
                                        }
                                    }
                                }
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
                                            alert('checkout clicked');
                                            // TODO: copy fields to old form and submit
                                        });
                                    }

                                    let $a2 = document.createElement('a');
                                    {
                                        $a2.classList.add('btn', 'btn-alt');
                                        $a2.innerHTML = 'Continue Shopping';
                                        $divButton.appendChild($a2);

                                        $a2.addEventListener('click', () => {
                                            alert('continue shopping clicked');
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
}