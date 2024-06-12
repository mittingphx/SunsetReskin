
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
}