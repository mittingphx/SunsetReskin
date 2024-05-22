/**
 * Project: Sunset Wholesale West Website
 * File:    SlideshowParser.js
 * Author:  Scott Mitting
 * Date:    2024-05-22
 * Abstract:
 *  Gets an array of slideshow items from the front page's bx-slider.
 */


/**
 * Object representing one slide within the slideshow.
 */
export class SlideshowItem {

    /**
     * The image displayed in the slide
     * @type {string}
     */
    image = '';

    /**
     * The custom HTML for the slide
     * @type {string}
     */
    html = '';

    /**
     * The link to the product this slide references.
     * Not used for now.
     * @type {string}
     */
    link = '';
}

/**
 * Extracts the slides from the front page.
 */
export class SlideshowParser {

    /**
     * Extracts the slides from the front page.  It searches for
     * the bxslider class and then extracts each div with the
     * class slide.  The image has the class SlideShowImg and the
     * custom html has the class slider-link.
     * @param {HTMLElement} source
     * @returns {SlideshowItem[]}
     */
    readSlidesFromDocument(source) {

        let $bxSlider = source.querySelector('.bxslider');
        if ($bxSlider) {
            return Array.from($bxSlider.querySelectorAll('.slide'))
                .map(this.readSlideFromDiv.bind(this));
        }
        return [];
    }

    /**
     * Reads a SlideShowItem from a div, which is the <div> with
     * class=slide.
     * @param div {HTMLDivElement}
     */
    readSlideFromDiv(div) {

        let ret = new SlideshowItem();

        // extract image
        let $img = div.querySelector('.slideShowImg');
        if ($img) {
            ret.image = $img.getAttribute('src');
        }

        // extract custom html
        let $div = div.querySelector('.slider-link');
        if ($div) {
            ret.html = $div.innerHTML
        }

        return ret;
    }

}