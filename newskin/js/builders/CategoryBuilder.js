import {ImageHelper} from "../util/ImageHelper.js";
import {CategoryProductItem} from "../models/CategoryProductItem.js";
import {ProductCategoryItem} from "../models/ProductCategoryItem.js";
import {MathFilter} from "../util/Tween.js";
import {CssHelper} from "../util/CssHelper.js";
import {SizeHelper} from "../util/SizeHelper.js";
import {ClickHelper} from "../util/ClickHelper.js";
import {SunsetSkin} from "../SunsetSkin.js";
import {StringHelper} from "../util/StringHelper.js";

/**
 * Builds the HTML for the category page.
 */
export class CategoryBuilder {

    /**
     * The controller using this builder.
     * @type {CategoryController}
     */
    controller = null;

    /**
     * Last place we inserted products.
     * @type {HTMLDivElement|null}
     */
    $lastInsertionPoint = null;

    /**
     * Last value for the product size slider.
     * @type {number|null}
     */
    #lastSliderValue = null;

    /**
     * Constructor takes reference to the skin to be built.
     * @param controller {CategoryController}
     */
    constructor(controller) {
        this.controller = controller;
    }

    build() {

    }

    /**
     * Builds a custom box for the subcategories area when showing
     * subcategories doesn't make any sense, such as with search
     * results.
     * @param title {string}
     * @param text {string}
     * @returns {HTMLDivElement}
     */
    buildMessageAsList(title, text) {

        let $customList = document.createElement('div');
        {
            $customList.classList.add('single-widget', 'sub-category-list');

            let $menuH3 = document.createElement('h3');
            {
                $menuH3.innerHTML = title;
                $customList.appendChild($menuH3);
            }

            let $menuUl = document.createElement('ul');
            {
                $menuUl.classList.add('list');
                $customList.appendChild($menuUl);

                let $message = document.createElement('li');
                {
                    $message.innerHTML = text;
                    $menuUl.appendChild($message);
                }
            }
        }
        return $customList;
    }

    /**
     * Builds the immediate subcategories for this page's category.
     * @param categoryData {ProductCategoryItem}
     * @param menu {SunsetMenu}
     * @returns {HTMLDivElement|null}
     */
    buildSubcategoryList(categoryData, menu) {

        if (!menu || !categoryData || !categoryData.breadcrumbs) {
            return null;
        }

        // get the current item from the menu
        let item = menu.findItem(categoryData.breadcrumbs);
        if (!item) {
            return null;
        }
        let selectedItem = item;

        // if the item has no children, list the siblings in the subcategory list
        if (item.children.length === 0) {
            item = item.parent;
            if (!item) {
                return null;
            }
        }

        // list the immediate children in the subcategory list
        let $widgetDiv = document.createElement('div');
        {
            $widgetDiv.classList.add('single-widget', 'sub-category-list');

            // title of the list
            $widgetDiv.appendChild(this.#createSubcategoryHeader(item, categoryData.breadcrumbs));

            // links
            let $ul = document.createElement('ul');
            {
                $ul.classList.add('list');
                for (let i = 0; i < item.children.length; i++) {
                    let child = item.children[i];
                    let $li = document.createElement('li');
                    {
                        if (child === selectedItem) {
                            $li.classList.add('active-category');
                            $li.innerHTML = child.text;
                        }
                        else {
                            let $a = document.createElement('a');
                            {
                                $a.href = child.link;
                                if (item.count) {
                                    $a.innerHTML = child.text + ' <span>' + item.count + '</span>';
                                } else {
                                    $a.innerHTML = child.text;
                                }
                                $li.appendChild($a);
                            }
                        }
                        $ul.appendChild($li);
                    }
                }
                $widgetDiv.appendChild($ul);
            }

        }
        return $widgetDiv;
    }

    /**
     * Builds the HTML for an error message on the category page.
     * @param errorMessage {string} message to display
     */
    buildError(errorMessage) {

        // reload the cart dropdown when this error message is displayed
        if (StringHelper.contains(errorMessage, 'Added to Cart')) {
            SunsetSkin.getInstance().forceReloadCartDropdown();
        }

        // build the error message
        let $div = document.createElement('div');
        {
            $div.classList.add('alert', 'alert-danger');
            $div.innerHTML = errorMessage;
        }
        return $div;
    }

    /**
     * Builds the HTML for the products in the category grid view.
     */
    buildCategoryProducts(categoryData, $insertionPoint) {

        let $tabContent = document.createElement('div');
        {
            $tabContent.classList.add('tab-content');
            $tabContent.id = 'nav-tabContent';

            // grid tab
            let $tabGridView = document.createElement('div');
            {
                $tabGridView.classList.add('tab-pane', 'fade', 'show', 'active');
                $tabGridView.id = 'nav-grid';
                $tabGridView.role = 'tabpanel';
                $tabGridView.setAttribute('aria-labelledby', 'nav-grid-tab');
                $tabContent.appendChild($tabGridView);

                // products
                let $row = document.createElement('div');
                {
                    $row.classList.add('row');
                    $tabGridView.appendChild($row);

                    // loop through the products in this category
                    for (let product of categoryData.items) {
                        let $cell = document.createElement('div');
                        {
                            $cell.classList.add('col-lg-4', 'col-md-6', 'col-12', 'category-cell');
                            $row.appendChild($cell);

                            let $productItem = this.#buildCategoryProduct(product);
                            $cell.appendChild($productItem);
                        }
                    }
                }

                // pager
                let $pagerRow = document.createElement('div');
                {
                    $pagerRow.classList.add('row');
                    $tabGridView.appendChild($pagerRow);

                    let $pagerCell = document.createElement('div');
                    {
                        $pagerCell.classList.add('col-12');
                        $pagerRow.appendChild($pagerCell);

                        let $pager = document.createElement('div');
                        {
                            $pager.classList.add('pagination', 'left');
                            $pagerCell.appendChild($pager);

                            let $pagerUl = document.createElement('ul');
                            {
                                $pagerUl.classList.add('pagination-list');
                                $pager.appendChild($pagerUl);

                                let tempActivePage = 2;
                                for (let page = 1; page < 4; page++) {
                                    let $pagerLi = document.createElement('li');
                                    {
                                        if (page === tempActivePage) {
                                            $pagerLi.classList.add('active');
                                        }
                                        let $pagerA = document.createElement('a');
                                        {
                                            $pagerA.href = 'javascript:void(0)';
                                            $pagerA.innerHTML = page.toString()
                                            $pagerLi.appendChild($pagerA);
                                        }
                                        $pagerUl.appendChild($pagerLi);
                                    }

                                }

                                let $pagerLiRight = document.createElement('li');
                                {
                                    let $pagerARight = document.createElement('a');
                                    {
                                        $pagerARight.href = 'javascript:void(0)';
                                        $pagerARight.innerHTML = '<i class="lni lni-chevron-right"></i>';
                                        $pagerLiRight.appendChild($pagerARight);
                                    }
                                    $pagerUl.appendChild($pagerLiRight);
                                }
                            }
                        }
                    }
                }
            }

            // list tab
            let $tabListView = document.createElement('div');
            {
                $tabListView.classList.add('tab-pane', 'fade');
                $tabListView.id = 'nav-list';
                $tabListView.role = 'tabpanel';
                $tabListView.setAttribute('aria-labelledby', 'nav-list-tab');
                $tabContent.appendChild($tabListView);

                let $row = document.createElement('div');
                {
                    $row.classList.add('row');
                    $tabListView.appendChild($row);

                    // loop through the products in this category
                    for (let product of categoryData.items) {
                        let $cell = document.createElement('div');
                        {
                            $cell.classList.add('col-lg-12', 'col-md-12', 'col-12');
                            $row.appendChild($cell);

                            let $productItem = this.#buildCategoryProductListItem(product);
                            $cell.appendChild($productItem);
                        }
                    }
                }
            }
        }

  //      $tabContent.classList.add('insert-category');
//        $insertionPoint.replaceWith($tabContent);


        $insertionPoint.innerHTML = $tabContent.innerHTML
        $insertionPoint.classList.add('tab-content');

        this.$lastInsertionPoint = $insertionPoint;

        // make sure products are the same height
        setTimeout(() => { this.resizeProductImages(); }, 1000);

        this.#addTabViewEventHandlers()
    }

    /**
     * Removes the old custom heights and recalculates a height that
     * makes all product boxes the same height.
     */
    resizeProductImages() {

        // only continue if we have a reference to the insertion point
        if (this.$lastInsertionPoint === null) {
            console.warn('Call to resizeProductImages without $lastInsertionPoint');
            return;
        }
        let $insertionPoint = this.$lastInsertionPoint

        // make all product boxes the same height
        if (this.#lastSliderValue !== null && this.#lastSliderValue < 0.4) {
            SizeHelper.minHeight = 32;
        }
        else {
            SizeHelper.minHeight = 100;
        }

        SizeHelper.makeChildrenSameHeight($insertionPoint, ['#nav-grid .product-image', '#nav-grid .single-product']);
    }

    /**
     * Builds the paging on the bottom of a category page from the
     * PageControls object.
     *
     * @param pageControls {PageControls}
     * @returns {HTMLElement}
     */
    buildPagingControls(pageControls) {
        let $div = document.createElement('div');
        {
            $div.classList.add('pagination', 'left');
            let $ul = document.createElement('ul');
            {
                $ul.classList.add('pagination-list');
                $div.appendChild($ul);
                for (let i = 0; i < pageControls.pages.length; i++) {
                    let page = pageControls.pages[i];
                    let $li = document.createElement('li');
                    {
                        $ul.appendChild($li);
                        let $a = document.createElement('a');
                        {
                            $li.appendChild($a);
                            $a.href = 'javascript:void(0)';
                            if (page.type === 'current') {
                                $a.innerHTML = page.text;
                                $li.classList.add('active');
                            } else if (page.type === 'next') {
                                $a.innerHTML = '<i class="lni lni-chevron-right"></i>';
                            } else if (page.type === 'prev') {
                                $a.innerHTML = '<i class="lni lni-chevron-left"></i>';
                            } else if (page.type === 'page') {
                                $a.innerHTML = page.text;
                            } else {
                                console.error('unknown page type: ' + page.type);
                            }
                            $a.addEventListener('click', () => {
                                this.controller.pageButtonHandler(page);
                            });
                        }
                    }
                }
            }
        }
        return $div;
    }

    /**
     * Creates an HTML range slider for customizing the grid size similar
     * to many photo apps.
     */
    initSizeSlider() {

        let $range = document.querySelector('#nav-size-range');
        if ($range) {
            $range.addEventListener('input', _ => {

                let value = this.#getSizeSliderValue($range);
                this.#lastSliderValue = value;

                // changing the width property of the CSS class 'category-cell'
                // instead of setting each of the element's custom styles
                CssHelper.changeClassProperty('.category-cell', {'width': (50 * value) + '%'});
                CssHelper.changeClassProperty('.category-cell h4', {'font-size': (2.70*value)+'em'});
                CssHelper.changeClassProperty('.category-cell a', {'font-size': (21*value)+'px'});
                CssHelper.changeClassProperty('.single-product .product-info .price span', {'font-size': (21*value)+'px'});
                CssHelper.changeClassProperty('.category-cell .product-info', {'padding': (20*value)+'px'});
                CssHelper.changeClassProperty('.category-cell .product-add', {'font-size':  Math.min(2.0*value, 1.0)+'em'});

                // resize the images
                this.resizeProductImages();
            });
        }
    }

    /**
     * Adds event handlers to icons to change the tab views.
     */
    #addTabViewEventHandlers() {

        let $tabList = document.querySelector('#nav-list-tab');
        let $tabListView = document.querySelector('#nav-list');
        let $tabGrid = document.querySelector('#nav-grid-tab');
        let $tabGridView = document.querySelector('#nav-grid');
        let $sliderControl = document.querySelector('#nav-size');

        $tabList.addEventListener('click', () => {
            $tabGrid.classList.remove('active');
            $tabGridView.classList.remove('active', 'show');
            $tabList.classList.add('active');
            $tabListView.classList.add('active', 'show');

            $sliderControl.style.display = 'none';
        });
        $tabGrid.addEventListener('click', () => {
            $tabList.classList.remove('active');
            $tabListView.classList.remove('active', 'show');
            $tabGrid.classList.add('active');
            $tabGridView.classList.add('active', 'show');

            $sliderControl.style.display = 'block';
        });

    }

    /**
     * Creates the HTML to display a single product in the grid view.
     * @param product {CategoryProductItem}
     * @returns {HTMLElement}
     */
    #buildCategoryProduct(product) {
        let $div = document.createElement('div');
        $div.classList.add('single-product');
        {
            // product image
            let $divImage = document.createElement('div');
            {
                $divImage.classList.add('product-image');
                $div.appendChild($divImage);

                let $img = document.createElement('img');
                $img.src = product.image;
                $img.alt = product.text;
                $divImage.appendChild($img);

                ImageHelper.addMissingImageHandler($img);

                // ImageHelper.makeImageTransparent($img);
            }
            // product info
            let $divInfo = document.createElement('div');
            {
                $divInfo.classList.add('product-info');
                $div.appendChild($divInfo);

                let $span = document.createElement('span');
                $span.classList.add('category');
                $span.innerHTML = '#' + product.itemNo;
                $divInfo.appendChild($span);

                let $h4 = document.createElement('h4');
                {
                    $h4.classList.add('title');
                    $h4.innerHTML = product.text;
                    $divInfo.appendChild($h4);

                    if (product.description) {
                        let $p = document.createElement('p');
                        $p.innerHTML = product.description;
                        $divInfo.appendChild($p);
                    }
                    /*
                    let $a = document.createElement('a');
                    $a.href = product.link;
                    $a.innerHTML = product.text
                    $divInfo.appendChild($a);
                    */
                }

                let $divPrice = document.createElement('div');
                {
                    $divPrice.classList.add('price');
                    $divInfo.appendChild($divPrice);

                    let $price = document.createElement('span');
                    $price.innerHTML = product.price;
                    $divPrice.appendChild($price);
                }

                // spacer to keep margin above add to cart
                // (because add-to-cart is absolute positioned relative to single-product)
                let $divSpacer = document.createElement('div');
                {
                    $divSpacer.classList.add('product-spacer');
                    $divInfo.appendChild($divSpacer);
                }
            }
            // make product box clickable (via LinkHandler.js)
            $div.setAttribute('href', product.link);
            $div.addEventListener('click', (event) => {
                console.log('testing product click');
                console.log(event);
            })

            // add to cart
            let $addToCartSection = CategoryBuilder.createAddToCartSection(product);
            $div.appendChild($addToCartSection);
        }
        return $div;
    }

    /**
     * Adds the add to cart section for the product box.  This is
     * a static method, so it can be called from other builders.
     * @param product {CategoryProductItem|SpecialProductItem} the product data
     * @returns {HTMLElement}
     */
    static createAddToCartSection(product) {

        let $divAdd = document.createElement('div');
        {
            $divAdd.classList.add('product-add', 'ignore-click');
            let $label = document.createElement('label');
            {
                $label.setAttribute('for', 'qty');
                $label.innerText = 'Qty';
                $divAdd.appendChild($label);
            }
            let $qty = document.createElement('input');
            {
                $qty.id = 'qty';
                $qty.size = 4;
                $divAdd.appendChild($qty);

                // this fixes a bug where addEventListener isn't working
                $qty.setAttribute('onkeyup', ClickHelper.registerFunction((e) => {
                    product.$txtAdd.value = e.target.value;
                }));
            }
            let $btn = document.createElement('button');
            {
                $btn.classList.add('btn', 'btn-primary');
                $btn.innerHTML = '<i class="lni lni-cart"></i> Add';
                $divAdd.appendChild($btn);

                // this fixes a bug where addEventListener isn't working
                $btn.setAttribute('onclick', ClickHelper.registerFunction((_) => {
                    const skin = SunsetSkin.getInstance();
                    skin.loginController.getStatus(loginStatus => {
                        // show a warning (one time) if not logged in
                        if (!loginStatus.loggedIn) {
                            if (CategoryBuilder.shownLoginWarning) {
                                return;
                            }
                            CategoryBuilder.shownLoginWarning = true;
                            alert('You must be logged in to add items to your cart');
                            return;
                        }
                        // add to cart
                        product.$btnAdd.click();
                    });
                }));

            }
        }


        return $divAdd;
    }

    /**
     * Creates the HTML to display a single product in the list view.
     * @param product {CategoryProductItem}
     * @returns {HTMLElement}
     */
    #buildCategoryProductListItem(product) {
        let $div = document.createElement('div');
        $div.classList.add('single-product');
        {
            let $listRow = document.createElement('div');
            {
                $listRow.classList.add('row', 'align-items-center');
                $div.appendChild($listRow);

                let $listCell = document.createElement('div');
                {
                    $listCell.classList.add('col-lg-12', 'col-md-12', 'col-12');
                    $listRow.appendChild($listCell);

                    let $productImage = document.createElement('div');
                    {
                        $productImage.classList.add('product-image');
                        $listCell.appendChild($productImage);

                        let $img = document.createElement('img');
                        $img.src = product.image;
                        $img.alt = product.text;
                        $productImage.appendChild($img);

                        ImageHelper.addMissingImageHandler($img);

                        let $button = document.createElement('div');
                        {
                            $button.classList.add('button');
                            $productImage.appendChild($button);

                            let $buttonA = document.createElement('a');
                            {
                                $buttonA.classList.add('btn');
                                $buttonA.href = product.link;
                                $buttonA.innerHTML = '<i class="lni lni-cart"></i> Add to Cart';
                                $button.appendChild($buttonA);
                            }
                        }
                    }

                }

                let $listCell2 = document.createElement('div');
                {
                    $listCell2.classList.add('col-lg-8', 'col-md-8', 'col-12');
                    $listRow.appendChild($listCell2);

                    let $productInfo = document.createElement('div');
                    {
                        $productInfo.classList.add('product-info');
                        $listCell2.appendChild($productInfo);

                        let $span = document.createElement('span');
                        $span.classList.add('category');
                        $span.innerHTML = '#' + product.itemNo;
                        $productInfo.appendChild($span);

                        let $h4 = document.createElement('h4');
                        {
                            $h4.classList.add('title');
                            $h4.innerHTML = product.text;
                            $productInfo.appendChild($h4);
                        }

                        let $divPrice = document.createElement('div');
                        {
                            $divPrice.classList.add('price');
                            $productInfo.appendChild($divPrice);

                            let $price = document.createElement('span');
                            $price.innerHTML = product.price;
                            $divPrice.appendChild($price);
                        }
                    }
                }
            }
        }
        return $div;
    }

    /**
     * Creates the element to use as the subcategory header.
     *
     * @param item {SunsetMenuItem}
     * @param breadcrumbs {ProductCategoryBreadcrumb}
     * @returns {HTMLHeadingElement}
     */
    #createSubcategoryHeader(item, breadcrumbs) {

        // detect top level
        let isTopLevel = false;

        // create main list heading
        let $h3 = document.createElement('h3');
        $h3.innerHTML = item.text;

        // create icon linking to parent if not top level
        if (!isTopLevel) {
            let $parentLink = document.createElement('a');
            $parentLink.href = breadcrumbs.parent.link
            $parentLink.innerHTML = '<i class="fa fa-level-up"></i>';
            $parentLink.setAttribute('title', 'up one level (' + breadcrumbs.parent.name + ')');
            $parentLink.setAttribute('style', 'float:right');
            $h3.appendChild($parentLink);
        }

        return $h3;
    }

    /**
     * Returns the value of the range slider adjusted for easing.
     * @param $range {HTMLInputElement}
     * @returns {number}
     */
    #getSizeSliderValue($range) {

        // forces slider not select to show 3 and a half products per row, for example
        const clampValues = [
            12.5 / 50.0, // 8 wide
            14.2 / 50.0, // 7 wide
            16.6 / 50.0, // 6 wide
            19.7 / 50.0, // 5 wide
            25.0 / 50.0, // 4 wide
            33.3 / 50.0, // 3 wide
            50.0 / 50.0  // 2 wide
        ];
        const easeAmount = 2; // exponent of easing function

        // grab value with easing, treating 0.25 - 1.0 as 0.0 - 1.0
        let rangeValue = parseFloat($range.value);
        rangeValue = MathFilter.translate(rangeValue, 0.25, 1.0, 0.0, 1.0);
        let value = MathFilter.easeIn(rangeValue, easeAmount);
        value = MathFilter.translate(value, 0.0, 1.0, 0.25, 1.0);

        // clamp to integer number of products per row
        value = MathFilter.distinctClamp(value, clampValues);

        return value;
    }
}