/**
 * Project: Sunset Wholesale West Website
 * File:    FrontPageSpecialsBuilder.js
 * Author:  Scott Mitting
 * Date:    2024-05-13
 * Abstract:
 *  HTML building methods for the specials section on the front page.
 */

import {ImageHelper} from "../util/ImageHelper.js";
import {SizeHelper} from "../util/SizeHelper.js";
import {CategoryBuilder} from "./CategoryBuilder.js";

/**
 * Builds the HTML for the special offers on the front page.
 */
export class FrontPageSpecialsBuilder {

    /**
     * Builds the HTML for the special offers on the front page using
     * the section data loaded from the old page.
     * @param sections {SpecialSectionItem[]}
     * @param $insertionPoint {HTMLElement}
     */
    buildFrontPageProducts(sections, $insertionPoint) {

        // create a <section> for each section data
        for (let i = 0; i < sections.length; i++) {

            // create the section and add to DOM
            let $section = this.#buildSpecialSection(sections[i]);
            $insertionPoint.after($section)

            // make all product boxes the same height
            SizeHelper.makeChildrenSameHeight(
                $section,
                ['.trending-product .product-image', '.trending-product .single-product']
            );
        }
    }

    /**
     * Builds the html for a single special section.
     * @param section {SpecialSectionItem}
     * @returns {HTMLElement}
     */
    #buildSpecialSection(section) {

        // top level section tag
        let $section = document.createElement('section');
        {
            $section.classList.add('trending-product');
            $section.classList.add('section');


            // create the container for this section
            let $container = document.createElement('div');
            {
                $container.classList.add('container');
                $section.appendChild($container);

                // create the title row
                let $titleRow = this.#buildSectionTitleRow(section);
                $container.appendChild($titleRow);

                // create the product row(s)
                let $productRow = document.createElement('div');
                {
                    $productRow.classList.add('row');
                    $container.appendChild($productRow);

                    // loop through the products in this section
                    for (let j = 0; j < section.products.length; j++) {
                        let product = section.products[j];
                        let $productCol = document.createElement('div');
                        {
                            $productCol.classList.add('col-lg-3', 'col-md-6', 'col-12');
                            $productRow.appendChild($productCol);

                            let $product = this.#buildProduct(product);
                            $productCol.appendChild($product);
                        }
                    } // next j
                }
            }
        } // end section

        return $section;
    }

    /**
     * Builds the title row for a section.
     * @param section {SpecialSectionItem}
     * @returns {HTMLElement}
     */
    #buildSectionTitleRow(section) {

        let $titleRow = document.createElement('div');
        {
            $titleRow.classList.add('row');

            let $titleCol = document.createElement('div');
            {
                $titleCol.classList.add('col-12');
                $titleRow.appendChild($titleCol);

                let $title = document.createElement('div');
                {
                    $title.classList.add('section-title');
                    $titleCol.appendChild($title);

                    let $titleH2 = document.createElement('h2');
                    $titleH2.innerHTML = section.name;
                    $title.appendChild($titleH2);

                    let $titleP = document.createElement('p');
                    let text = this.#getSectionQuote(section);
                    $titleP.innerHTML = text + '  <a href="' + section.link + '">View All</a>';
                    $title.appendChild($titleP);
                }
            }
        }

        return $titleRow;
    }

    /**
     * Returns the text to display under the title for a specials section.
     * @param section {SpecialSectionItem}
     * @returns {string}
     */
    #getSectionQuote(section) {
        switch (section.name) {
            case "Popular Items":
                return "Check out this week's most popular items.";
            case "End-Of-Line":
                return "These products are being discontinued.  Catch them while they last.";
            case "Items on Special":
                return "Check out these items on sale for a special discounted price.";
            case "New Products":
                return "Get ahead of the crowd and grab these new products before they hit our best sellers' list.";
            default:
                return "";
        }
    }

    /**
     * Builds the HTML for the single product on the specials section
     * on the front page of the website.
     * @param {SpecialProductItem} product
     * @returns {HTMLElement}
     */
    #buildProduct(product) {

        // .single-product wrapper
        let $product = document.createElement('div');
        {
            $product.classList.add('single-product');

            // product image area
            let $productImage = this.#buildProductImage(product);
            $product.appendChild($productImage);

            // product info area
            let $productInfo = this.#buildProductInfo(product);
            $product.appendChild($productInfo);

            // make entire product box a link to the product (vi LinkHandler.js)
            $product.setAttribute('href', product.link);

            // add to cart
            let $addToCartSection = CategoryBuilder.createAddToCartSection(product);
            $product.appendChild($addToCartSection);
        } // end .single-product

        return $product
    }

    /**
     * Builds the HTML for the product image area.
     * @param product {SpecialProductItem}
     * @returns {HTMLElement}
     */
    #buildProductImage(product) {

        // product image area
        let $productImage = document.createElement('div');
        {
            $productImage.classList.add('product-image');

            let $productImageImg = document.createElement('img');
            {
                // hack to make images work on localhost
                if (product.image.startsWith('/')) {
                    product.image = product.image.substring(1);
                }
                // hack to use full size image instead of thumbnail
                product.image = product.image.replace('0thn', '0');

                $productImageImg.src = product.image;
                $productImageImg.alt = product.altText || product.text;
                $productImage.appendChild($productImageImg);

                ImageHelper.addMissingImageHandler($productImageImg);
            }

            /*
            // test sale and new tags
            let rnd = Math.floor(Math.random() * 100) + 1;
            if (rnd > 80) {
               product.salePercent = '-25%';
            }
            else if (rnd > 60) {
                product.isNew = true;
            }
            */


            //<span class="sale-tag">-25%</span>
            if (product.salePercent) {
                let $productSaleTag = document.createElement('span');
                {
                    $productSaleTag.classList.add('sale-tag');
                    $productSaleTag.innerHTML = '-25%';
                    $productImage.appendChild($productSaleTag);
                }
            }

            //<span class="new-tag">new</span>
            if (product.isNew) {
                let $productNewTag = document.createElement('span');
                {
                    $productNewTag.classList.add('new-tag');
                    $productNewTag.innerHTML = 'new';
                    $productImage.appendChild($productNewTag);
                }
            }

            let $productImageButton = document.createElement('div');
            {
                $productImageButton.classList.add('button');
                $productImage.appendChild($productImageButton);

                let $productImageLink = document.createElement('a');
                {
                    $productImageLink.classList.add('btn');
                    $productImageLink.href = product.link;
                    $productImageLink.innerHTML = '<i class="lni lni-cart"></i> View Product';
                    $productImageButton.appendChild($productImageLink);
                }
            }
        } // end .product-image

        return $productImage;
    }

    /**
     * Builds the HTML for the product info area.
     * @param product {SpecialProductItem}
     * @returns {HTMLElement}
     */
    #buildProductInfo(product) {

        // product info area
        let $productInfo = document.createElement('div');
        {
            $productInfo.classList.add('product-info');

            // category
            let $productInfoCategory = document.createElement('span');
            {
                $productInfoCategory.classList.add('category');
                $productInfoCategory.innerHTML = '#' + product.itemNo;
                $productInfo.appendChild($productInfoCategory);
            }

            // clickable title
            let $productInfoH4   = document.createElement('h4');
            {
                $productInfoH4.classList.add('title');
                $productInfo.appendChild($productInfoH4);
                let $productInfoH4Link = document.createElement('a');
                {
                    $productInfoH4Link.href = product.link;
                    $productInfoH4Link.innerHTML = product.text;
                    $productInfoH4.appendChild($productInfoH4Link);
                }
            }

            // prices
            let $price = document.createElement('div');
            {
                $price.classList.add('price');

                let $priceSpan = document.createElement('span');
                $priceSpan.innerHTML = product.casePrice;
                $price.appendChild($priceSpan);

                if (product.preDiscountPrice) {
                    let $priceSpan2 = document.createElement('span');
                    $priceSpan2.classList.add('discount-price');
                    $priceSpan2.innerHTML = product.preDiscountPrice;
                    $price.appendChild($priceSpan2);
                }

                if (product.unitPrice) {
                    let $priceSpan3 = document.createElement('span');
                    $priceSpan3.classList.add('unit-price');
                    $priceSpan3.innerHTML = product.unitPrice;
                    $price.appendChild($priceSpan3);
                }

                $productInfo.appendChild($price);
            }
        } // end .product-info

        return $productInfo;
    }
}