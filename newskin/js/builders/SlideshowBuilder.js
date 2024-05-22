import {SlideshowItem} from "../parsers/SlideshowParser.js";

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

}