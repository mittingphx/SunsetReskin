/**
 * Project: Sunset Wholesale West Website
 * File:    NewSkin.js
 * Author:  Scott Mitting
 * Date:    2024-03-09
 * Abstract:
 *  This script is designed to read the existing out-of-date website
 *  and in real time replace it with a modern look-and-feel using the
 *  data displayed on this webpage, while remaining fully functional.
 *
 *  In order to provide the smoothest experience this script should be
 *  placed in the <head> tag of the html file, so it can hide the initial
 *  view with a load screen as quickly as possible to prevent the old
 *  site from being visible during a short flicker at the page load.
 *
 *  This script has been split up into the files in the newskin/js/
 *  folder for maintainability.
 */

import {SunsetSkin} from "./newskin/js/SunsetSkin.js";

// grab options form url query string
let options = {
    showSkin: true
};
let search = new URL(document.location.toString()).searchParams;
switch (search.get("reskin")) {
    case "off":
    case "0":
    case "no":
    case "false":
        options.showSkin = false;
        break;
}

// show the skin
if (options.showSkin) {

    // skip if we're in an iframe
    if (window.self !== window.top) {
        console.log('Skipping reskin because we are in an iframe...');
    }
    else {
        let skin = new SunsetSkin();
        skin.apply();
    }
}



