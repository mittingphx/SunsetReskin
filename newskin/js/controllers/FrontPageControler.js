
import {SunsetSkin} from "../SunsetSkin.js";
import {PageControllerBase} from "./BaseControllers.js";
import {DomHelper} from "../util/DomHelper.js";
import {FrontPageSpecialsParser} from "../parsers/FrontPageSpecialsParser.js";
import {FrontPageSpecialsBuilder} from "../builders/FrontPageSpecialsBuilder.js";
import {SlideshowParser} from "../parsers/SlideshowParser.js";
import {SlideshowBuilder} from "../builders/SlideshowBuilder.js";

/**
 * Handles parsing of the old site's front page and building the new.
 */
export class FrontPageController extends PageControllerBase {

    /**
     * Builds the specials sections on the front page.
     * @type {FrontPageSpecialsBuilder}
     */
    specialsBuilder = new FrontPageSpecialsBuilder();

    /**
     * Constructor takes reference to the skin to be built.
     * @param skin {SunsetSkin} the skin to build
     */
    constructor(skin) {
        super(skin);
    }

    /**
     * Builds the new front page from the old site's front page.
     */
    build() {

        // grab DOM references from skin
        let $oldBody = this.skin.html.oldHtmlBody;
        if (!$oldBody) {
            console.error('Could not find old body');
            return;
        }

        let dom = {};
        DomHelper.addElementsByQuery(dom, $oldBody, {
            $table: '.ItemSpecials'
        });
        DomHelper.addElementsByQuery(dom, document, {
            $insertionPoint: '.insert-products',
            $slideshowInsertion: '.slider-head'
        });

        // parse from the old to build the new specials
        if (dom.$table) {
            let parser = new FrontPageSpecialsParser();
            let specials = parser.readNodesFromTable(dom.$table);
            //console.log({specials: specials});

            if (dom.$insertionPoint) {
                this.specialsBuilder.buildFrontPageProducts(specials, dom.$insertionPoint);
            }
        }

        // set up the slide show using slides from the old page
        let slideshowParser = new SlideshowParser();
        let slideshow = slideshowParser.readSlidesFromDocument($oldBody);
        //console.log({slideshow:slideshow});

        if (dom.$slideshowInsertion) {
            if (slideshow.length === 0) {
                let $missingSlideshow = document.createElement('div');
                $missingSlideshow.classList.add('slider-head');
                $missingSlideshow.innerHTML = '<div class="hero-slider">ERROR: Slideshow contains no slides.</div>';
                dom.$slideshowInsertion.replaceWith($missingSlideshow);
            } else {
                let slideshowBuilder = new SlideshowBuilder(slideshow);
                dom.$slideshowInsertion.replaceWith(slideshowBuilder.build());
                slideshowBuilder.setupSlideshow();

                // wait until page has settled down to process custom content
                setTimeout(() => {
                    slideshowBuilder.addSlideshowChooseProductHandler()
                }, 100);
            }
        }

        // set the window title
        document.title = `Sunset Wholesale West - Fine Tobaccos and Products`;
    }

}