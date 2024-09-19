import {ComponentControllerBase} from "./BaseControllers.js";

/**
 * Builds the toggle button between the new and old skin.
 */
export class SkinToggleController extends ComponentControllerBase {

    /**
     * Constructor takes reference to the skin to be built.
     * @param skin
     */
    constructor(skin) {
        super(skin);
    }

    /**
     * Builds the toggle button between the new and old skin.
     */
    build() {

        // build the new skin toggle
        const $newSkinPanel = document.createElement('div');
        $newSkinPanel.className = 'newskin-toggle';
        $newSkinPanel.innerHTML = `
            <i class="fa-solid fa-toggle-on" id="toggleSkin"></i>
            <b>New Skin Enabled</b>
        `;
        document.body.append($newSkinPanel);

        function returnToOldSkin() {

            // parse current location as a URL object
            let url = new URL(document.location);

            // toggle between new and old skin
            url.searchParams.set('reskin', url.searchParams.get('reskin') === 'no' ? 'yes' : 'no');

            // update the url
            let newUrl = url.toString();

            newUrl = newUrl.replace('swwest.com/reskin/', 'swwest.com/');
            document.location = newUrl;
        }

        // toggle new skin
        $newSkinPanel.addEventListener('click', () => {
            returnToOldSkin();
        });

        // go back to old skin if you click your heels... ahem... press escape three times
        // show popup if escape is pressed 3 times
        document.onkeydown = function(evt) {
            let escapePressed = (evt.key === "Escape" || evt.key === "Esc");
            if (escapePressed) {
                window.escapeCount ||= 0;
                window.escapeCount++;
                console.log('escape pressed ' + window.escapeCount + ' times');
            }
            else {
                window.escapeCount = 0;
            }
            if (window.escapeCount >= 3) {
                window.escapeCount = 0;
                returnToOldSkin();
            }
        };
    }
}