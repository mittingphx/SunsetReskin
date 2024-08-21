
/**
 * Project: Sunset Wholesale West Website
 * File:    ProductDetailBuilder.js
 * Author:  Scott Mitting
 * Date:    2024-05-14
 * Abstract:
 *  Internal helper methods for dealing with URL conversions.
 */

import {UrlHelper} from "../UrlHelper.js";
import {ImageHelper} from "../util/ImageHelper.js";
import {SunsetSkin} from "../SunsetSkin.js";

/**
 * Builds the breadcrumb area above the product details.
 */
export class ProductBreadcrumbBuilder {

    /**
     * Builds the HTML for a page breadcrumbs.
     * @param title {string} text to display for this page
     * @param breadcrumbs {ProductCategoryBreadcrumb} text and links for the breadcrumbs to display
     * @returns {HTMLElement}
     */
    build(title, breadcrumbs) {

        let $div = document.createElement('div');
        $div.classList.add('breadcrumbs');
        {
            let $container = document.createElement('div');
            {
                $container.classList.add('container');
                $div.appendChild($container);

                let $row = document.createElement('div');
                {
                    $row.classList.add('row', 'align-items-center');
                    $container.appendChild($row);

                    // product title
                    let $titleCell = document.createElement('div');
                    {
                        $titleCell.classList.add('col-lg-6', 'col-md-6', 'col-12');
                        $row.appendChild($titleCell);

                        let $content = document.createElement('div');
                        {
                            $content.classList.add('breadcrumbs-content');
                            $titleCell.appendChild($content);

                            let $h1 = document.createElement('h1');
                            {
                                $h1.classList.add('page-title');
                                $h1.innerHTML = title;
                                $content.appendChild($h1);
                            }
                        }
                    }

                    // product category breadcrumbs
                    let $breadcrumbCell = document.createElement('div');
                    {
                        $breadcrumbCell.classList.add('col-lg-6', 'col-md-6', 'col-12');
                        $row.appendChild($breadcrumbCell);

                        let $breadcrumbUL = document.createElement('ul');
                        {
                            $breadcrumbUL.classList.add('breadcrumb-nav');
                            $breadcrumbCell.appendChild($breadcrumbUL);

                            let liList = this.#getBreadcrumbList(breadcrumbs);
                            for (let i = 0; i < liList.length; i++) {
                                $breadcrumbUL.appendChild(liList[i]);
                            }
                        }
                    }
                }
            }
        }

        return $div;
    }

    /**
     * Returns the array of <li> tags to use as breadcrumbs
     * @param cat {ProductCategoryBreadcrumb}
     * @returns {HTMLLIElement[]}
     */
    #getBreadcrumbList(cat) {

        let liList = [];

        // walk the product's category tree
        if (cat != null) {
/*
            // product name has no link
            let $li = document.createElement('li');
            {
                $li.innerHTML = cat.name;
                liList.push($li);
            }
*/
            // walk up the tree
            while (cat != null) {
                let $li = document.createElement('li');
                {
                    // the last link has a home icon, others do not
                    let $a = document.createElement('a');
                    $a.href = cat.link;
                    $a.innerHTML = cat.name;
                    if (cat.parent == null) {
                        $a.innerHTML = '<i class="lni lni-home"></i> ' + $a.innerHTML;
                    }
                    $li.appendChild($a);
                }
                liList.push($li);
                cat = cat.parent;
            }
        }

        // list is backwards at this point
        liList = liList.reverse()
        return liList
    }

}

/**
 * Builds the main product description and image gallery for
 * the product details page.
 */
export class ProductDetailBuilder {

    /**
     * The controller that will handle the product details
     * @type {ProductDetailsController|null}
     */
    controller = null;

    /**
     * Constructor takes parent controller
     * @param controller {ProductDetailsController}
     */
    constructor(controller) {
        this.controller = controller;
    }

    /**
     * Builds the HTML for a product detail item to be placed after the
     * insertion point in the template.
     * @param productItem {ProductDetailItem}
     * @returns {HTMLElement}
     */
    build(productItem) {

        // create the product row
        return this.#buildItemDetailsSection(productItem);
    }

    /**
     * Creates the <section> for the product details
     * @param productItem {ProductDetailItem}
     * @returns {HTMLElement}
     */
    #buildItemDetailsSection(productItem) {

        let $section = document.createElement('section');
        $section.classList.add('item-details', 'section');

        let $container = document.createElement('div');
        {
            $container.classList.add('container');
            $section.appendChild($container);

            // image, details, and price area
            let $topArea = this.#buildProductDetailsTopArea(productItem)
            $container.appendChild($topArea);

            // details grid area
            //let $productDetailsInfo = this.#buildProductDetailsInfoTable(productItem)
            //$container.appendChild($productDetailsInfo);
        }

        return $section;

    }

    /**
     * Builds the top area featuring the main image and name.
     * @param productItem {ProductDetailItem}
     * @returns {HTMLDivElement}
     */
    #buildProductDetailsTopArea(productItem) {
        let $topArea = document.createElement('div');
        {
            $topArea.classList.add('top-area');
            let $row = document.createElement('div');
            {
                $row.classList.add('row');//, 'align-items-center');

                // left side has images
                let $cellLeft = document.createElement('div');
                {
                    $cellLeft.classList.add('col-lg-6', 'col-md-12', 'col-12');
                    $cellLeft.appendChild(this.#buildProductImageGallery(productItem))
                }
                $row.appendChild($cellLeft);

                // right side has main details
                let $cellRight = document.createElement('div');
                {
                    $cellRight.classList.add('col-lg-6', 'col-md-12', 'col-12');
                    $cellRight.appendChild(this.#buildProductInfo(productItem));
                    $cellRight.appendChild(this.#buildProductInfoDetails(productItem));
                }
                $row.appendChild($cellRight);
            }
            $topArea.appendChild($row);
        }

        return $topArea;
    }

    /**
     * Creates the image view with thumbnails for alternate images
     * to be displayed.
     * @param productItem {ProductDetailItem}
     * @returns {HTMLDivElement}
     */
    #buildProductImageGallery(productItem) {

        let $productImageGallery = document.createElement('div');
        {
            $productImageGallery.classList.add('product-images');
            let $main = document.createElement('main');
            {
                $main.setAttribute('id', 'gallery')
                $productImageGallery.appendChild($main);

                // main image view
                let $mainImage;
                let $mainImg = document.createElement('div');
                {
                    $mainImg.classList.add('main-img');
                    $main.appendChild($mainImg);

                    let $img = document.createElement('img');
                    {
                        $img.id = 'current';
                        $img.src = productItem.image;
                        $img.alt = productItem.text;
                        $mainImg.appendChild($img);
                    }

                    ImageHelper.addMissingImageHandler($img);

                    $mainImage = $img;
                }

                // thumbnails of alternate images
                let $images = document.createElement('div');
                {
                    $images.classList.add('images');
                    $main.appendChild($images);

                    if (productItem.images.length > 1) {
                        for (let i = 0; i < productItem.images.length; i++) {
                            let $img = document.createElement('img');
                            {
                                $img.classList.add('thumb');

                                // prefer thumbnail images when available
                                let hasThumb = productItem.thumbs.length > i;
                                $img.src = hasThumb ? productItem.thumbs[i] : productItem.images[i];
                                $img.alt = productItem.text;
                                $images.appendChild($img);

                                // onclick = change main image
                                $img.addEventListener('click', (e) => {
                                    $mainImage.src = UrlHelper.toFullSize(e.target.src);
                                    $mainImage.alt = e.target.text;
                                })
                            }
                        }
                    }
                }

            } // end main#gallery
        } // end productImageGallery
        return $productImageGallery;
    }

    /**
     * Builds the main item details to the right of the product image.
     * @param productItem {ProductDetailItem}
     * @returns {HTMLDivElement}
     */
    #buildProductInfo(productItem) {

        let $productInfo = document.createElement('div');
        {
            $productInfo.classList.add('product-info');

            // detect errors in the product item
            if (productItem.errorMessage) {
                let $productErrorH2 = document.createElement('h2');
                {
                    $productErrorH2.classList.add('title');
                    $productErrorH2.innerHTML = '<span style="color: red;">' + productItem.errorMessage +'</span>';
                    $productInfo.appendChild($productErrorH2);
                }

                // show alert
                let skin = SunsetSkin.getInstance();
                skin.alertNotification('Product Error', productItem.errorMessage, 30);

                return $productInfo
            }

            // title
            let $productInfoH2 = document.createElement('h2');
            {
                $productInfoH2.classList.add('title');
                $productInfoH2.innerHTML = productItem.text;
                $productInfo.appendChild($productInfoH2);
            }

            // description (optional)
            if (productItem.description) {
                let $productInfoP = document.createElement('p');
                {
                    $productInfo.appendChild($productInfoP);
                    $productInfoP.innerHTML = productItem.description;
                }
            }

            // category
            if (productItem.category) {
                let $productInfoP = document.createElement('p');
                {
                    $productInfo.appendChild($productInfoP);
                    if (productItem.category.parent) {
                        $productInfoP.innerHTML
                            = '<i class="lni lni-tag"></i> '
                            + productItem.category.parent.name;
                    }
                    $productInfoP.innerHTML
                        += ': <a href="' + productItem.category.link + '">'
                        + productItem.category.name
                        + '</a>';
                }
            }

            // price (or login link)
            if (productItem.priceString === 'Login to View') {
                let $priceLogin = document.createElement('div');
                {
                    $priceLogin.innerHTML = '<i class="fa fa-sign-in"></i> ';
                    let $a = document.createElement('a');
                    {
                        $a.href = 'Login/Login.aspx';
                        $a.innerHTML = 'Login to view product price';
                        $priceLogin.appendChild($a);
                    }
                    $productInfo.appendChild($priceLogin);
                }
            }
            else {
                let $priceH3 = document.createElement('h3');
                {
                    $priceH3.classList.add('price');

                    let casePrice = productItem.getCasePrice();
                    let unitPrice = productItem.getUnitPrice();

                    $priceH3.innerHTML = '';
                    if (casePrice) {
                        $priceH3.innerHTML += casePrice + '<br>';
                    }
                    if (unitPrice) {
                        if (!casePrice) {
                            $priceH3.innerHTML += unitPrice + '<br>';
                        }
                        else {
                            $priceH3.innerHTML += '<p style="font-size: 0.7em; color #888;">' + unitPrice + '</p>';
                        }
                    }
                    if ($priceH3.innerHTML === '') {
                        $priceH3.innerHTML = productItem.priceString;
                    }

                    if (productItem.preDiscountPrice) {
                        $priceH3.innerHTML += ' <span>-$' + productItem.preDiscountPrice + '</span>';
                    }
                    $productInfo.appendChild($priceH3);
                }
            }


            // bottom buttons
            let $bottom = this.#buildProductInfoBottom(productItem);
            if ($bottom) {
                $productInfo.appendChild($bottom);
            }
        }

        return $productInfo
    }

    /**
     * Builds specifications area directly below price and description.
     * @param productItem
     */
    #buildProductInfoDetails(productItem) {

        let $infoBody = document.createElement('div');
        {
            $infoBody.classList.add('info-body');
            $infoBody.innerHTML = '<h4>Specifications</h4>';

            $infoBody.appendChild(this.#buildSpecList(productItem))
        }

        return $infoBody;
    }

    /**
     * Builds the buttons below the main product info.
     * @param productItem {ProductDetailItem}
     * @returns {HTMLDivElement}
     */
    #buildProductInfoBottom(productItem) {

        // attempt to get the wish list data
        let wishList = null;
        try {
            wishList = this.controller.skin.wishListController.builder.wishListData;
        }
        catch (e) {
            console.error('Could not find wish list data', e);
        }

        let $bottom = document.createElement('div');
        {
            $bottom.classList.add('bottom-content');

            if (!productItem) return $bottom;

            let $row = document.createElement('div');
            {
                $row.classList.add('row', 'align-items-end');
                $bottom.appendChild($row);

                // add to cart button
                let $cell1 = document.createElement('div');
                {
                    $cell1.classList.add('col-lg-4', 'col-md-4', 'col-12');
                    $row.appendChild($cell1);

                    let addButton = document.createElement('div');
                    {
                        addButton.classList.add('button', 'cart-button');
                        $cell1.appendChild(addButton);

                        let $btn = document.createElement('button');
                        {
                            $btn.classList.add('btn');
                            $btn.setAttribute('style', 'width: 100%');
                            $btn.innerHTML = 'Add to cart';
                            addButton.appendChild($btn);

                            $btn.addEventListener('click', () => {
                                if (!productItem.$btnAddToCart) {
                                    alert('Could not add item to the cart.  Please try again.');
                                    document.location = '' + document.location;
                                }
                                else {
                                    // checks that the server response says the item was added
                                    function checkServerResponse(iframeDoc) {
                                        if (!iframeDoc) {
                                            throw new Error('no iframeDoc');
                                        }
                                        let $panelAdded = iframeDoc.querySelector('#MainContent_PanelAdded');
                                        if (!$panelAdded) {
                                            throw new Error('no panel');
                                        }
                                        let content = $panelAdded.textContent;
                                        if (!content) {
                                            throw new Error('no textContent');
                                        }
                                        if (content.indexOf('Item Added to Cart') === -1) {
                                            throw new Error('no server confirmation received');
                                        }
                                    }

                                    // process the add to cart button in the background
                                    let skin = SunsetSkin.getInstance();
                                    skin.aspNet.backgroundPostback(productItem.$btnAddToCart, (iframeDoc) => {
                                        try {
                                            // check for "Item Added to Cart"
                                            checkServerResponse(iframeDoc);

                                            // reload the cart and show success
                                            let skin = SunsetSkin.getInstance();
                                            skin.forceReloadCartDropdown();

                                            skin.alertNotification('Shopping Cart', 'Item added to your shopping cart successfully.');
//                                            alert('Item added to cart'); // TODO: custom notification would be better
                                        }
                                        catch (error) {
                                            alert('Add to cart failed.  Please try again. (' + error + ')');
                                        }
                                    });
                                }
                            });
                        }
                    }
                }

                // wish button
                let $cell3 = document.createElement('div');
                {
                    $cell3.classList.add('col-lg-4', 'col-md-4', 'col-12');
                    $row.appendChild($cell3);

                    let $wishButton = document.createElement('div');
                    {
                        $wishButton.classList.add('wish-button');
                        let $btn = document.createElement('button');
                        {
                            $btn.classList.add('btn');

                            // sets up the wish button on the product details page
                            function setupWishListButton(on) {
                                if (on) {
                                    $btn.innerHTML = '<i class="lni lni-heart-filled"></i> On Wishlist';
                                    $btn.classList.add('wishlist-on');
                                }
                                else {
                                    $btn.innerHTML = '<i class="lni lni-heart"></i> To Wishlist';
                                    $btn.classList.remove('wishlist-on');
                                }
                                wishList && wishList.rebuild();
                            }

                            let onWishList = wishList && wishList.has(productItem);
                            setupWishListButton(onWishList);
                            $btn.addEventListener('click', () => {
                                if (onWishList) {
                                    wishList && wishList.remove(productItem);
                                    onWishList = false;
                                }
                                else {
                                    wishList && wishList.add(productItem);
                                    onWishList = true;
                                }
                                setupWishListButton(onWishList);
                            });

                            $wishButton.appendChild($btn);
                        }
                        $cell3.appendChild($wishButton);
                    }
                }
            }
        }
        return $bottom;
    }

    /**
     * Builds <ul> for product specifications.
     * @param productItem {ProductDetailItem}
     * @returns {HTMLUListElement}
     */
    #buildSpecList(productItem) {

        let specData = [];
        specData.push({key: 'Item No', value: productItem.itemNo});
        specData.push({key: 'Size', value: productItem.size});
        specData.push({key: 'Pack', value: productItem.pack});
        specData.push({key: 'Pallet', value: productItem.pallet});
        specData.push({key: 'Case Price', value: productItem.getCasePrice()})

        let $specUL = document.createElement('ul');
        {
            $specUL.classList.add('normal-list');

            for (let i = 0; i < specData.length; i++) {
                let spec = specData[i];
                if (spec.value === '') continue;

                let $li = document.createElement('li');
                {
                    $li.innerHTML = '<span>' + spec.key + ':</span> ' + spec.value;
                    $specUL.appendChild($li);
                }
            }
        }

        return $specUL;
    }
}
