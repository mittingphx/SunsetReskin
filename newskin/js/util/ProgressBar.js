import {Tween} from "./Tween.js";

/**
 * Provides a progress bar when pages are loading.
 */
export class ProgressBar {

    /**
     * Background over entire page
     * @type {HTMLDivElement}
     */
    $backdrop = null;

    /**
     * Progress bar element
     * @type {HTMLProgressElement}
     */
    $progress = null;

    /**
     * Text below the progress bar
     * @type {HTMLElement}
     */
    $progressText = null;

    /**
     * True iff the progress bar is shown
     * @type {boolean}
     */
    shown = false;

    /**
     * Settings for animating the progress bar
     * @type {Tween}
     */
    tween = new Tween((tween, progress)=> {
        this.setProgress(progress);
        if (tween.percent >= 1.0) {
            tween.stop();
            this.setVisible(false);
        }
    });

    /**
     * Constructor grabs DOM references
     */
    constructor() {

        // grab DOM references
        this.$backdrop = document.querySelector('.page-loader');
        this.$progress = document.querySelector('.progress');
        this.$progressText = document.querySelector('.progress-text');

        // hide by default
        this.setVisible(false);
    }

    /**
     * Sets the progress bar to a certain value over a certain amount of time.
     * @param target {number} target value to reach
     * @param duration {number} how many seconds to take
     */
    anim(target, duration) {

        this.tween.range.start = this.$progress.value;
        this.tween.range.end = target;
        this.tween.duration = duration;

        this.setVisible(true);
        this.tween.start();
    }

    /**
     * Displays or hides the progress bar.
     * @param visible {boolean}
     */
    setVisible(visible) {
        this.shown = visible;
        this.$backdrop.style.display = visible ? 'block' : 'none';
    }

    /**
     * Sets the progress of the progress bar.
     * @param value {number}
     */
    setProgress(value) {
        value = Math.floor(value);
        this.$progress.value = value;
        this.$progressText.innerHTML = `Loading: ${value}%`;
    }
}