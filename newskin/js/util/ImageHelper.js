
export class ImageHelper {

    /**
     * Checks if an <img> doesn't load its src image and replaces it
     * with a missing image placeholder.
     * @param $img {HTMLImageElement}
     */
    static addMissingImageHandler($img) {

        // if no image assigned, point at missing image placeholder
        if (!$img.getAttribute('src')) {
            $img.src = 'newskin/images/NoImage.jpg';
            return;
        }

        // if load fails, point at missing image placeholder
        $img.onerror = function() {
            $img.onerror = null;
            $img.src = 'newskin/images/NoImage.jpg';
        };
    }

    /**
     * Reads the pixels in the image and changes a specific color in
     * that image to transparent pixels and replaces the contents of
     * the <img> tag with the new image.
     * @param $img {HTMLImageElement} img tag containing image to update
     *
     * @returns {HTMLImageElement} the img tag that was updated
     */
    static makeImageTransparent($img) {

        // avoid double processing
        if ($img.getAttribute('processed') === 'true') {
            return $img;
        }
        $img.setAttribute('processed', 'true');

        console.log('makeImageTransparent: ' + $img.src);

        const tolerance = 15;
        const maxZ = 255 - tolerance;

        // create canvas and draw image
        let canvas = document.createElement('canvas');
        canvas.width = $img.width;
        canvas.height = $img.height;

        let ctx = canvas.getContext('2d');
        ctx.drawImage($img, 0, 0);

        // set all pixels matching the color to transparent
        let imgData = ctx.getImageData(0, 0, $img.width, $img.height);
        let data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] >= maxZ && data[i + 1] >= maxZ && data[i + 2] >= maxZ) {
                data[i + 3] = 0;
            }
        }

        // put image data back in canvas
        ctx.putImageData(imgData, 0, 0);
        $img.setAttribute('src', canvas.toDataURL());

        // return the img tag that was updated
        canvas.remove();
        return $img;
    }
}