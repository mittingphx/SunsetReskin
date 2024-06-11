/**
 * Project: Sunset Wholesale West Website
 * File:    SunsetPreload.js
 * Author:  Scott Mitting
 * Date:    2024-05-13
 * Abstract:
 *  This javascript file is meant to load as quickly as possible to
 *  cover up the entire website view so nothing is visible to the
 *  end user until the moment we are ready to show them the website.
 */


import {Tween} from "./util/Tween.js";
import {Range} from "./util/Range.js";


/**
 * Constants for time durations.
 */
export class TimeSpan {
    static IMMEDIATE = 0;
}

/**
 * Class controlling the display of a preloader over the website until
 * it is completely loaded.
 */
export class SunsetPreload {

    /**
     * True when the html needed for the preloader has been added
     * to the code of the website.
     * @type {boolean}
     */
    #assetsAdded = false;

    /**
     * Handle to the interval checking that the preloader is up.
     * @type {number|null}
     */
    #checkInterval = null;

    /**
     * The drapes displayed over the entire webpage view.
     * @type {HTMLElement}
     */
    #$preloader = null;

    /**
     * Object that fades out the preloader
     * @type {Tween}
     */
    #tween = null;

    /**
     * Singleton instance.
     */
    static #instance = null;

    /**
     * Adds the assets needed to hide the website and displays the
     * drapes to the end user immediately.
     */
    constructor() {
        SunsetPreload.#instance = this;
        this.#setupTween();
        this.#addAssets();
        this.#showDrapes();

        const rate = 1000 / 30;  // 30fps
        this.#checkInterval = setInterval(_ => this.preload(), rate);
    }

    /**
     * Returns a singleton instance, creating a new instance if needed.
     * @returns {SunsetPreload}
     */
    static getInstance() {
        if (!SunsetPreload.#instance) {
            SunsetPreload.#instance = new SunsetPreload();
        }
        return SunsetPreload.#instance;
    }

    /**
     * Stops the interval checking that the preloader is up.
     */
    stopChecking() {
        if (this.#checkInterval) {
            clearInterval(this.#checkInterval);
            this.#checkInterval = null;
        }
    }

    /**
     * Called by the website to inform the preloader that everything
     * is ready to go.
     */
    ready() {
        this.stopChecking();
        this.fadeOutPreloader();
    }

    /**
     * Makes sure the preloading drapes are visible.  Automatically
     * called at 30fps until preloader is explicitly hidden.
     */
    preload() {
        if (!this.#isConnected()) {
            this.#assetsAdded = false;
            this.#addAssets()
        }
        this.#showDrapes();
    }

    /**
     * Transfers the drapes to a new element
     * @param element {HTMLElement}
     */
    transfer(element) {

        // TODO: you need to detach the element too
        /*
        if (!element) return;
        if (!this.#isConnected()) {
            this.#assetsAdded = false;
        }
        this.#addAssets();
        element.appendChild(this.#$preloader);

         */
    }

    /**
     * Returns true if the preloader is still in the HTML body.
     * This is for detecting when other code wipes out all
     * the HTML on the page.
     * @returns {boolean}
     */
    #isConnected() {
        this.#assetsAdded = document.getElementById('divSunsetPreloader') !== null;
        return this.#assetsAdded;
    }

    /**
     * Hides the website with a preloader panel.
     */
    #showDrapes() {
        this.#$preloader.style.display = 'block';
    }

    /**
     * Fades out the preloader overlay over a period of time in milliseconds.
     * @param time {number} default 2000 = 2.0 seconds
     */
    fadeOutPreloader(time = 2000) {
        this.#setupTween();
        this.#tween.duration = time;
        this.#tween.start();
    }

    /**
     * Sets up the tween object to fade out the preloader.
     */
    #setupTween() {
        if (this.#tween) return;

        this.#tween = new Tween((tween, progress)=> {
            this.#setAlpha(progress);
        }, new Range(1, 0), 2000);
    }

    /**
     * Sets the opacity of the preloader from the tween.
     * @param value {number} the new opacity value
     */
    #setAlpha(value) {
        if (value <= 0) {
            this.#$preloader.style.display = 'none';
            this.#$preloader.style.opacity = '' + value;
        }
        else {
            this.#$preloader.style.display = 'block';
            this.#$preloader.style.opacity = '' + value;
        }
    }

    /**
     * Makes sure all the assets needed are added.
     */
    #addAssets() {
        if (this.#assetsAdded) return;

        // reconnect if it got disconnected
        if (this.#$preloader != null) {
            console.log('reconnecting preloader')
            document.body.appendChild(this.#$preloader)
            return;
        }

        // grab reference to preloader if already exists
        if (this.#$preloader === null) {
            this.#$preloader = document.getElementById('divSunsetPreloader');
            if (this.#$preloader !== null) {
                console.log('reusing preloader');
                this.#assetsAdded = true;
                return;
            }
        }

        // create preloader
        let $div = document.createElement('div');
        $div.id = 'divSunsetPreloader';
        $div.style.position = 'fixed';
        $div.style.left = '0px';
        $div.style.top = '0px';
        $div.style.width = '100%';
        $div.style.height = '100%';
        $div.style.background = 'rgba(0,0,0,0.3)';
        $div.style.zIndex = '100000';
        $div.style.display = 'none';
        $div.style.backdropFilter = 'blur(12px)';
        this.#$preloader = $div;
        //console.log({'#$preloader': $div});
        console.log('Built preloader HTML');

        // contents on top of pre-loader
        let $text = document.createElement('p');
        $text.style.position = 'fixed';
        $text.style.top = '50%';
        $text.style.width = '100%';
        $text.style.textAlign = 'center';
        $text.style.color = 'white';
        $text.style.font = '25pt impact';
        $text.innerHTML = 'Website is loading... please wait a few moments.';
        $div.appendChild($text);

        document.body.appendChild($div)
        this.#assetsAdded = true;
    }
}
