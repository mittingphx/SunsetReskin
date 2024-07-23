// noinspection DuplicatedCode

import {SlideshowItem} from "../parsers/SlideshowParser.js";
import {CookieHelper} from "../util/CookieHelper.js";
import {tns} from "../../../assets/js/tiny-slider.js";

/**
 * Creates the HTML for the slideshow on the new website.
 */
export class SlideshowBuilder {

    /**
     * The slides to display.
     * @type {SlideshowItem[]}
     */
    slideshow = [];

    /**
     * Creates a new SlideshowBuilder
     *
     * @param slides {SlideshowItem[]|null}
     */
    constructor(slides) {
        this.slideshow = slides || [];
    }

    /**
     * Builds the HTML for the slideshow on the new website.
     */
    build() {

        // create the slideshow
        let $slideshow = document.createElement('div');
        $slideshow.classList.add('slider-head');
        {
            let $container = document.createElement('div');
            {
                $container.classList.add('hero-slider');
                $slideshow.appendChild($container);

                // create the slides
                for (let slide of this.slideshow) {
                    let $slide = document.createElement('div');
                    $slide.classList.add('single-slider');
                    //$slide.style.backgroundImage = 'url(\'' + slide.image + '\')';

                    let $img = document.createElement('img');
                    $img.src = slide.image;
                    $slide.appendChild($img);

                    let $content = document.createElement('div');
                    {
                        // fix absolute links to point at /reskin/
                        slide.html = slide.html.replace(/\/ItemDetail.aspx/g, '/reskin/ItemDetail.aspx');

                        $content.classList.add('content');
                        $content.innerHTML = slide.html;
                        $slide.appendChild($content);

                        // testing adding button.....
                        // we would need to parse links from the custom code to make this work
                        /*
                        let $button = document.createElement('div');
                        {
                            $button.classList.add('button');
                            let $buttonLink = document.createElement('a');
                            {
                                $buttonLink.href = slide.link;
                                $button.appendChild($buttonLink);
                            }
                            $button.innerHTML = 'Shop Now';
                            $slide.appendChild($button);
                        }
                         */
                    }
                    $container.appendChild($slide);
                }
            }
        }

        return $slideshow;
    }


    /**
     * Calls the tiny slider library to set up the slideshow.
     */
    setupSlideshow() {

        if (typeof tns === 'undefined') {
            console.error('tns not found');
            return;
        }

        //========= Hero Slider
        tns({
            container: '.hero-slider',
            slideBy: 'page',
            scrollSpeed: 600,
            speed: 600,
            autoplay: true,
            autoplayButtonOutput: false,
            mouseDrag: true,
            gutter: 0,
            items: 1,
            nav: true,
            controls: true,
            controlsText: ['<i class="lni lni-chevron-left"></i>', '<i class="lni lni-chevron-right"></i>'],
        });
    }

    /**
     * Updates the HTML for a <select> that is using Sunset's product item
     * markup.  Example: <select>123,234,345,color:black,yellow</select> will
     * create a dropdown with three product ids with black text on yellow as
     * a dropdown.
     * @param $ddl {HTMLSelectElement}
     */

    processDropdownSunsetCustomMarkup($ddl) {
        if (!$ddl) return;

        let $parent = $ddl.parentElement;
        if (!$parent) return;

        let ddlHtml = $ddl.outerHTML;
        let items = [];

        // make sure the select has a class of "slider-link"
        if ($parent && !$parent.classList.contains('slider-link')) {
            $parent.classList.add('slider-link');
        }

        // if there's no <option> within the <select>, assume it's a
        // comma-selected list of inventory items to display
        if (ddlHtml.indexOf('<option') === -1) {
            let inner = $ddl.innerHTML;

            // also look for the label ",color:" at the end which defines the colors to apply
            let colorIndex = inner.indexOf(',color:');
            if (colorIndex > -1) {
                let colors = inner.substring(colorIndex + 7);
                let parts = colors.split(',');
                if (parts.length >= 1) {
                    $ddl.style.color = parts[0];
                }
                if (parts.length >= 2) {
                    $ddl.style.backgroundColor = parts[1];
                }
                inner = inner.substring(0, colorIndex);
            }

            items = inner.split(',');
        }
        else {
            // get the list of product numbers from the existing dropdown
            for (let j = 0; j < $ddl.options.length; j++) {
                let itemNumber = $ddl.options[j].value;
                if (!itemNumber) {
                    itemNumber = $ddl.options[j].text;
                }
                if (!itemNumber || itemNumber === 'Choose Product') {
                    continue;
                }
                if (itemNumber.indexOf('INV# ') !== -1) {
                    itemNumber = itemNumber.substring('INV# '.length);
                }
                items.push(itemNumber);
            }
        }


        // read in the list of items and make sure there's a select product options
        // and apply the new cleaned up list to replace the dropdown
        for (let j = $ddl.options.length - 1; j >= 0; j--) {
            $ddl.remove(j);
        }

        let chooseProduct = document.createElement('option');
        chooseProduct.text = 'Choose Product';
        $ddl.appendChild(chooseProduct);

        for (let j = 0; j < items.length; j++) {
            const itemNumber = items[j];
            let option = document.createElement('option');
            if (itemNumber.toLowerCase() === 'all') {
                option.value = 'all';
                option.text = 'Open All Products';
            }
            else {
                option.value = itemNumber;
                option.text = 'INV# ' + itemNumber;
            }
            $ddl.appendChild(option);
        }
    }

    /**
     This code allows custom markup in the slideshows to turn into
     html dropdowns.  This was needed because the website limits the
     html of slide show items to a certain size, limiting how many
     product links we can place in the slideshow.

     This is copied from the old website's ProcessSlideshow.js
     */
    addSlideshowChooseProductHandler() {
        console.log('Running addSlideshowChooseProductHandler()');

        let $slider = document.querySelector('.hero-slider');
        if (!$slider) return;
        let $dropdowns = $slider.querySelectorAll('select');
        for (let i = 0; i < $dropdowns.length; i++) {
            let $ddl = $dropdowns[i];
            this.processDropdownSunsetCustomMarkup($ddl);
            $ddl.addEventListener('change', () => {
                this.onSlideshowChooseProduct($ddl);
            })
        }
    }

    /**
     * Event handler for the "Choose Product" dropdown in te slideshow.
     * @param $ddl {HTMLSelectElement}
     */
    onSlideshowChooseProduct($ddl) {

        // get the product selection
        const value = $ddl.options[$ddl.selectedIndex].value;
        console.log('user selected value: ' + value);
        if (!value) {
            console.log('Skipping event, user selected blank option.');
            return;
        }

        // open all product details if "all" was select
        if (value === 'all') {
            // show popup warning once per hour
            if (CookieHelper.getCookie('warning') !== 'popup') {
                alert('Make sure popup blockers are off when opening all products');
                CookieHelper.setCookie('warning', 'popup', 3600)
            }

            for (let k = 1; k < $ddl.options.length; k++) {
                if (!$ddl.options[k].value) {
                    continue;
                }
                if ($ddl.options[k].value === 'all') {
                    continue;
                }
                const url = 'ItemDetail.aspx?ItemNo=' + $ddl.options[k].value;
                window.open(url);
            }
        }
        // otherwise open the specific product
        else {
            const url = 'ItemDetail.aspx?ItemNo=' + value;
            window.open(url);
        }
    }
}