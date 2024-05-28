
export class ImageHelper {

    /**
     * Checks if an <img> doesn't load its src image and replaces it
     * with a missing image placeholder.
     * @param $img {HTMLImageElement}
     */
    static addMissingImageHandler($img) {

        $img.onerror = function() {
            $img.onerror = null;
            $img.src = 'newskin/images/NoImage.png';
        };
    }
}