/**
 * Project: Sunset Wholesale West Website
 * File:    ProductDetailBuilder.js
 * Author:  Scott Mitting
 * Date:    2024-05-14
 * Abstract:
 *  Internal helper methods for dealing with URL conversions.
 */

import {UrlHelper} from "../UrlHelper.js";

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

            // product name has no link
            let $li = document.createElement('li');
            {
                $li.innerHTML = cat.name;
                liList.push($li);
            }

            // walk up the tree
            cat = cat.parent;
            while (cat != null) {
                $li = document.createElement('li');
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

            // title
            let $productInfoH2 = document.createElement('h2');
            {
                $productInfoH2.classList.add('title');
                $productInfoH2.innerHTML = productItem.text;
                $productInfo.appendChild($productInfoH2);
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

            // price
            let $priceH3 = document.createElement('h3');
            {
                $priceH3.classList.add('price');
                $priceH3.innerHTML = '$' + productItem.price;
                if (productItem.preDiscountPrice) {
                    $priceH3.innerHTML += ' <span>-$' + productItem.preDiscountPrice + '</span>';
                }
                $productInfo.appendChild($priceH3);
            }

            // TODO: having a description would be cool

            // description
            if (productItem.description) {
                let $descriptionP = document.createElement('p');
                {
                    p.classList.add('info-text');
                    $descriptionP.innerHTML = productItem.description;
                    $productInfo.appendChild($descriptionP);
                }
            }

            // options for product (not in use yet)
            let $options = this.buildProductOptions(productItem);
            if ($options) {
                $productInfo.appendChild($options);
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
     * Builds form for selecting different options for this product
     * @param productItem {ProductDetailItem}
     * @returns {HTMLDivElement}
     */
    buildProductOptions(productItem) {

        // TODO: implement options for product
        if (!productItem.options) {
            return null;
        }

        let $options = document.createElement('div');
        {
            $options.classList.add('row');

            /*
                                        <div class="col-lg-4 col-md-4 col-12">
                                            <div class="form-group color-option">
                                                <label class="title-label" for="size">Choose color</label>
                                                <div class="single-checkbox checkbox-style-1">
                                                    <input type="checkbox" id="checkbox-1" checked="">
                                                    <label for="checkbox-1"><span></span></label>
                                                </div>
                                                <div class="single-checkbox checkbox-style-2">
                                                    <input type="checkbox" id="checkbox-2">
                                                    <label for="checkbox-2"><span></span></label>
                                                </div>
                                                <div class="single-checkbox checkbox-style-3">
                                                    <input type="checkbox" id="checkbox-3">
                                                    <label for="checkbox-3"><span></span></label>
                                                </div>
                                                <div class="single-checkbox checkbox-style-4">
                                                    <input type="checkbox" id="checkbox-4">
                                                    <label for="checkbox-4"><span></span></label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-lg-4 col-md-4 col-12">
                                            <div class="form-group">
                                                <label for="color">Battery capacity</label>
                                                <select class="form-control" id="color">
                                                    <option>5100 mAh</option>
                                                    <option>6200 mAh</option>
                                                    <option>8000 mAh</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="col-lg-4 col-md-4 col-12">
                                            <div class="form-group quantity">
                                                <label for="color">Quantity</label>
                                                <select class="form-control">
                                                    <option>1</option>
                                                    <option>2</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                </select>
                                            </div>
                                        </div>

                         */
        }
        return $options;

    }

    /**
     * Builds the buttons below the main product info.
     * @param productItem {ProductDetailItem}
     * @returns {HTMLDivElement}
     */
    #buildProductInfoBottom(productItem) {

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
                        }
                    }
                }

                // compare button
                let $cell2 = document.createElement('div');
                {
                    $cell2.classList.add('col-lg-4', 'col-md-4', 'col-12');
                    $row.appendChild($cell2);

                    let $compareButton = document.createElement('div');
                    {
                        $compareButton.classList.add('wish-button');
                        let $btn = document.createElement('button');
                        {
                            $btn.classList.add('btn');
                            $btn.innerHTML = '<i class="lni lni-reload"></i> Compare';
                            $compareButton.appendChild($btn);
                        }
                        $cell2.appendChild($compareButton);
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
                            $btn.innerHTML = '<i class="lni lni-heart"></i> To Wishlist';
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
     * Builds the deeper details for the product.
     * @param productItem {ProductDetailItem}
     * @returns {HTMLDivElement}
     */
    #buildProductDetailsInfoTable(productItem) {
        let $productDetailsInfo = document.createElement('div');
        {
            $productDetailsInfo.classList.add('product-details-info');

            let $singleBlock = document.createElement('div');
            {
                $singleBlock.classList.add('single-block');
                $productDetailsInfo.appendChild($singleBlock);

                let $row = document.createElement('div');
                {
                    $row.classList.add('row');
                    $singleBlock.appendChild($row);

                    // left cell
                    let $cell = document.createElement('div');
                    {
                        $cell.classList.add('col-lg-6', 'col-12');
                        $row.appendChild($cell);

                        let $infoBody = document.createElement('div');
                        {
                            $infoBody.classList.add('info-body', 'custom-responsive-margin');
                            $cell.appendChild($infoBody);

                            // details
                            let $detailsH4 = document.createElement('h4');
                            {
                                $detailsH4.innerHTML = 'Details';
                                $infoBody.appendChild($detailsH4);
                            }

                            let $detailsP = document.createElement('p');
                            {
                                $detailsP.innerHTML = productItem.description;
                                $infoBody.appendChild($detailsP);
                            }

                            // features
                            let $featuresH4 = document.createElement('h4');
                            {
                                $featuresH4.innerHTML = 'Features';
                                $infoBody.appendChild($featuresH4);
                            }

                            let $featuresUL = document.createElement('ul');
                            {
                                $infoBody.appendChild($featuresUL);

                                for (let i = 0; i < productItem.features.length; i++) {
                                    let feature = productItem.features[i];
                                    let $li = document.createElement('li');
                                    {
                                        $li.innerHTML = feature;
                                        $featuresUL.appendChild($li);
                                    }
                                }
                            }
                        }
                    }

                    // right cell
                    let $cell2 = document.createElement('div');
                    {
                        $cell2.classList.add('col-lg-6', 'col-12');
                        $row.appendChild($cell2);

                        let $infoBody = document.createElement('div');
                        {
                            $infoBody.classList.add('info-body');
                            $cell2.appendChild($infoBody);

                            // specifications
                            let $specH4 = document.createElement('h4');
                            {
                                $specH4.innerHTML = 'Specifications';
                                $infoBody.appendChild($specH4);
                            }
                            $infoBody.appendChild(this.#buildSpecList(productItem));

                            // shipping
                            // TODO: more details can go here (it's shipping options in template)
                            if (productItem.shippingOptions && productItem.shippingOptions.length > 0) {
                                let $shippingH4 = document.createElement('h4');
                                {
                                    $shippingH4.innerHTML = 'Shipping Options:';
                                    $infoBody.appendChild($shippingH4);
                                }

                                let $shippingUL = document.createElement('ul');
                                {
                                    $shippingUL.classList.add('normal-list');
                                    $infoBody.appendChild($shippingUL);

                                    for (let i = 0; i < productItem.shippingOptions.length; i++) {
                                        let ship = productItem.shippingOptions[i];
                                        let $li = document.createElement('li');
                                        {
                                            $li.innerHTML = ship;
                                            $shippingUL.appendChild($li);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return $productDetailsInfo;
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
        specData.push({key: 'Case Price', value: productItem.casePrice})

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