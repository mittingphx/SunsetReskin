import {WishListData} from "../models/WishListData.js";


/**
 * Builds the wish list dropdown list next to the cart preview in the upper right.
 */
export class WishListBuilder {

    /**
     * Data access object for wish list data.
     * @type {WishListData}
     */
    wishListData = new WishListData();

    constructor() {

    }

    /**
     * Builds the wish list dropdown list.
     * @returns {HTMLDivElement}
     */
    build() {
        this.wishListData.load();
        let wishList = this.wishListData.wishList;

        let $list = document.createElement('div');
        {
            $list.classList.add('cart-items', 'ddl-wishlist');

            // button with item count batch
            let $btn = document.createElement('a');
            {
                $btn.classList.add('main-btn')
                $list.appendChild($btn);
                $btn.setAttribute('href', 'javascript:void(0)');
                $btn.addEventListener('click', () => {
                    // WishList.clear();
                });

                let $i = document.createElement('i');
                {
                    $i.classList.add('lni', 'lni-heart');
                    $btn.appendChild($i);
                }

                let $span = document.createElement('span');
                {
                    $span.classList.add('total-items');
                    $span.innerHTML = wishList.length.toString();
                    $btn.appendChild($span);
                }
            }

            // dropdown display
            let $divShopping = document.createElement('div');
            {
                $divShopping.classList.add('shopping-item');
                $list.appendChild($divShopping);

                // header
                let $header = document.createElement('div');
                {
                    $header.classList.add('dropdown-cart-header');
                    $divShopping.appendChild($header);

                    let $span = document.createElement('span');
                    {
                        $span.classList.add('total-items');
                        let count = wishList.length;
                        $span.innerHTML = count.toString() + ' Item' + (count === 1 ? '' : 's');
                        $header.appendChild($span);
                    }

                    let $a = document.createElement('a');
                    {
                        $a.href = 'javascript:void(0)';
                        $a.innerHTML = 'Wishlist';
                        $header.appendChild($a);
                    }
                }

                // cart items
                let $ul = document.createElement('ul');
                {
                    $ul.classList.add('shopping-list');
                    $divShopping.appendChild($ul);

                    for (let item of wishList) {
                        $ul.appendChild(this.buildWishListItemRow(wishList, item));
                    }

                    if (wishList.length === 0) {
                        $ul.innerHTML = '<li>No items in wish list</li>';
                    }
                }

                // footer
                let $footer = document.createElement('div');
                {
                    $footer.classList.add('bottom');
                    $divShopping.appendChild($footer);

                    let $btn = document.createElement('div');
                    {
                        $btn.classList.add('button');
                        $footer.appendChild($btn);

                        let $a = document.createElement('a');
                        {
                            $a.classList.add('btn', 'animate');
                            $a.href = 'javascript:void(0)';
                            $a.innerHTML = 'Clear Wish List';
                            $btn.appendChild($a);

                            $a.addEventListener('click', () => {
                                this.wishListData.clear();
                            });
                        }
                    }
                }
            }
        }

        return $list;
    }

    /**
     * Builds a wish list dropdown row.
     * @param wishList {WishListItem[]}
     * @param item {WishListItem}
     * @returns {HTMLLIElement}
     */
    buildWishListItemRow(wishList, item) {

        let $li = document.createElement('li');
        {
            // clicking anywhere except remove is a link to details
            $li.style.cursor = 'pointer';
            $li.addEventListener('click', (e) => {
                // close button clicked
                if (e.target.classList.contains('lni-close')) {
                    this.wishListData.remove(item);
                    this.wishListData.rebuild();
                }
                // anywhere else clicked
                else {
                    window.location = item.link;
                }
            });

            let $removeA = document.createElement('a');
            {
                $removeA.classList.add('remove');
                $removeA.href = 'javascript:void(0)';
                $removeA.title = 'Remove this item';
                $removeA.innerHTML = '<i class="lni lni-close"></i>';
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
                        $img.alt = item.text;
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
                    $h4.innerHTML = item.text;
                    $divContent.appendChild($h4);
                }

                let $p = document.createElement('p');
                {
                    $p.classList.add('quantity');
                    $divContent.appendChild($p);

                    let $spanPrice = document.createElement('span');
                    {
                        $spanPrice.classList.add('amount');
                        if (item.hasPrice) {
                            $spanPrice.innerHTML = item.getPrice();
                        }
                        else {
                            $spanPrice.innerHTML = 'Login to View';
                        }
                        $p.appendChild($spanPrice);
                    }
                }
            }

        }
        return $li;
    }
}