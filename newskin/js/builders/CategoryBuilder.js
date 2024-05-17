
export class CategoryBuilder {

    /**
     *
     */
    buildCategoryProducts(categoryData, $insertionPoint) {
        console.log('buildCategoryProducts()');

        //let text = JSON.stringify(categoryData);
        //alert('got data=' + text);
        console.log ({categoryData:categoryData});

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
                            $cell.classList.add('col-lg-4', 'col-md-6', 'col-12');
                            $row.appendChild($cell);

                            let $productItem = this.buildCategoryProduct(product);
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

                            let $productItem = this.buildCategoryProductListItem(product);
                            $cell.appendChild($productItem);
                        }
                    }
                }
            }
        }

        $insertionPoint.appendChild($tabContent);
    }

    /**
     * Creates the HTML to display a single product in the grid view.
     * @param product {CategoryProductItem}
     * @returns {HTMLElement}
     */
    buildCategoryProduct(product) {
        let $div = document.createElement('div');
        $div.classList.add('single-product');
        {
            let $divImage = document.createElement('div');
            {
                $divImage.classList.add('product-image');
                $div.appendChild($divImage);

                let $img = document.createElement('img');
                $img.src = product.image;
                $img.alt = product.text;
                $divImage.appendChild($img);
            }

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

                    let $a = document.createElement('a');
                    $a.href = product.link;
                    $a.innerHTML = product.text
                    $divInfo.appendChild($a);
                }

                let $divPrice = document.createElement('div');
                {
                    $divPrice.classList.add('price');
                    $divInfo.appendChild($divPrice);

                    let $price = document.createElement('span');
                    $price.innerHTML = product.price;
                    $divPrice.appendChild($price);
                }
            }
        }
        return $div;
    }

    /**
     * Creates the HTML to display a single product in the list view.
     * @param product {CategoryProductItem}
     * @returns {HTMLElement}
     */
    buildCategoryProductListItem(product) {
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

}