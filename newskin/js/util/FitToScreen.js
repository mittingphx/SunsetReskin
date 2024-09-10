/**
 * Takes an images on the page and makes it fit to the screen, searching
 * within the div with class PanelImages.  If the width is wider than the
 * screen, the image is scaled down to fit.  If the image is taller than
 * the screen, the image is scaled down to fit.  If the image is smaller,
 * it is left alone.
 *
 * Example url:
 * https://sunset.imxremote.com/ViewImages.aspx?PictureID=74098
 *
 * The install-location for this script was in IMX Remote /Scripts/fitToScreen.js
 */

function fitPanelImages() {

    // resize images
    let panelImages = document.querySelectorAll(".PanelImages img");
    for (let i = 0; i < panelImages.length; i++) {
        let image = panelImages[i];
        if (image) {
            fitImage(image);
        }
    }

    // rerun whenever the window is resized
    if (!window.resizeApplied) {
        window.resizeApplied = true;
        window.addEventListener("resize", function () {
            fitPanelImages();
        });
    }
}

/**
 * Scales an image so it completely fits within the window.
 * @param img {HTMLImageElement} img to scale
 */
function fitImage(img) {
    img.style.maxWidth = window.innerWidth + "px";
    img.style.maxHeight = window.innerHeight + "px";
}


fitPanelImages();