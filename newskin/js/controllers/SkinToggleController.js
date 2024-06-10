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

        // TODO: build the toggle html here instead of placing it in the html of every page

        // grab new skin toggle
        const $newSkinPanel = document.querySelector('.newskin-toggle');
        if (!$newSkinPanel) {
            console.error('.newskin-toggle not found');
            return;
        }

        // toggle new skin
        $newSkinPanel.addEventListener('click', () => {

            // TODO: make the old pages have a "new skin available" link

            let url = '' + document.location;
            if (url.indexOf('?') === -1) {
                url += '?';
            }
            else {
                url += '&';
            }
            url += 'reskin=no';

            document.location = url;
            /*
            const $newSkinIcon = $newSkinPanel.querySelector('i');
            const $newSkinLabel = $newSkinPanel.querySelector('b');
            if ($newSkinIcon.classList.contains('fa-toggle-on')) {
                $newSkinIcon.classList.remove('fa-toggle-on');
                $newSkinIcon.classList.add('fa-toggle-off');
                $newSkinLabel.innerText = 'Classic Look';

                this.html.toggle('old');
            }
            else {
                $newSkinIcon.classList.remove('fa-toggle-off');
                $newSkinIcon.classList.add('fa-toggle-on');
                $newSkinLabel.innerText = 'New Skin Enabled';

                this.html.toggle('new');
            }*/
        });
    }
}