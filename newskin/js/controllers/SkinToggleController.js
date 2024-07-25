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

        // toggle new skin
        $newSkinPanel.addEventListener('click', () => {

            // parse current location as a URL object
            let url = new URL(document.location);

            // toggle between new and old skin
            url.searchParams.set('reskin', url.searchParams.get('reskin') === 'no' ? 'yes' : 'no');

            // update the url
            document.location = url.toString();
        });
    }
}