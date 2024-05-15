
export class ProductDetailBuilder {


    /**
     * Builds the HTML for a product detail item after the insertion point.
     * @param productItem {ProductDetailItem}
     * @param $insertionPoint {HTMLElement}
     */
    buildProductDetailItem(productItem, $insertionPoint) {

        // create the product row
        let $productRow = this.buildItemDetailsSection(productItem);
        $insertionPoint.append($productRow);

    }

    /**
     * Creates the <section> for the product details
     * @param productItem {ProductDetailItem}
     * @returns {HTMLElement}
     */
    buildItemDetailsSection(productItem) {

        let $section = document.createElement('section');
        $section.classList.add('item-details', 'section');

        let $container = document.createElement('div');
        {
            $container.classList.add('container');
            $section.appendChild($container);

            // image area
            let $topArea = this.buildProductDetailsTopArea(productItem)
            $container.appendChild($topArea);

            // details area
            let $productDetailsInfo = this.buildProductDetailsInfoTable(productItem)
            $container.appendChild($productDetailsInfo);
        }

        return $section;

    }

    /**
     * Builds the top area featuring the main image and name.
     * @param productItem {ProductDetailItem}
     * @returns {HTMLDivElement}
     */
    buildProductDetailsTopArea(productItem) {
        let $topArea = document.createElement('div');
        {
            $topArea.classList.add('top-area');

            let $row = document.createElement('div');
            {
                $row.classList.add('row', 'align-items-center');
                $topArea.appendChild($row);

                // left side has images
                let $cellLeft = document.createElement('div');
                {
                    $cellLeft.classList.add('col-lg-6', 'col-md-12', 'col-12');
                    $row.appendChild($cellLeft);

                    $cellLeft.appendChild(this.buildProductImageGallery(productItem))
                }

                // right side has main details
                let $cellRight = document.createElement('div');
                {
                    $cellRight.classList.add('col-lg-6', 'col-md-12', 'col-12');
                    $row.appendChild($cellRight);

                    $cellRight.appendChild(this.buildProductInfo(productItem))
                }
            }
        }

        return $topArea;
    }

    /**
     * Creates the image view with thumbnails for alternate images
     * to be displayed.
     * @param productItem {ProductDetailItem}
     * @returns {HTMLDivElement}
     */
    buildProductImageGallery(productItem) {

        let $productImageGallery = document.createElement('div');
        {
            $productImageGallery.classList.add('product-images');
            let $main = document.createElement('main');
            {
                $main.setAttribute('id', 'gallery')
                $productImageGallery.appendChild($main);

                // main image view
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
                }

                // thumbnails of alternate images
                let $images = document.createElement('div');
                {
                    $images.classList.add('images');
                    $main.appendChild($images);

                    // TODO: check server for multiple images
                    // for now just use the first multiple times to test
                    productItem.images = [productItem.image, productItem.image, productItem.image];

                    for (let i = 0; i < productItem.images.length; i++) {
                        let $img = document.createElement('img');
                        {
                            $img.setAttribute('style', 'cursor: pointer; width: 75px;');
                            $img.src = productItem.images[i];
                            $img.alt = productItem.text;
                            $images.appendChild($img);
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
    buildProductInfo(productItem) {

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

            // TODO: read category from server
            productItem.category = 'todo_get_category';

            // category
            let $productInfoP = document.createElement('p');
            {
                $productInfoP.innerHTML = productItem.category;
                $productInfo.appendChild($productInfoP);

                $productInfoP.innerHTML = '<i class="lni lni-tag"></i> ' + productItem.category;
                $productInfoP.innerHTML += 'Drones: ';
                $productInfoP.innerHTML += '<a href="javascript:void(0)">Action cameras</a>';
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
            let $bottom = this.buildProductInfoBottom(productItem);
            if ($bottom) {
                $productInfo.appendChild($bottom);
            }
        }

        return $productInfo
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
    buildProductInfoBottom(productItem) {

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
    buildProductDetailsInfoTable(productItem) {
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

                            let specData = [];
                            specData.push({key: 'Item No', value: productItem.itemNo});
                            specData.push({key: 'Size', value: productItem.size});
                            specData.push({key: 'Pack', value: productItem.pack});
                            specData.push({key: 'Pallet', value: productItem.pallet});
                            specData.push({key: 'Case Price', value: productItem.casePrice})

                            let $specUL = document.createElement('ul');
                            {
                                $specUL.classList.add('normal-list');
                                $infoBody.appendChild($specUL);

                                for (let i = 0; i < specData.length; i++) {
                                    let spec = specData[i];
                                    let $li = document.createElement('li');
                                    {
                                        $li.innerHTML = '<span>' + spec.key + ':</span> ' + spec.value;
                                        $specUL.appendChild($li);
                                    }
                                }
                            }

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
}