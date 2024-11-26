/**
 * File:    swwest-legacy.js
 * Author:  Scott Mitting
 * Date:    2024-11-26
 * Abstract:
 *  This file is meant to only be installed on the legacy swwest site,
 *  whose url is swwest.com/legacy/
 *
 *  This file is meant to point all links to the legacy site when clicked
 *  that would usually take them to the root site, since this code was
 *  originally installed at the root of swwest.com.
 *
 *  Only three places were identified where this happens and all three
 *  used the same method to link to the root (/) of the website.
 */




// check all click events to make sure none send you out of the /legacy/ folder
const elementsWithOnClick = document.querySelectorAll('[onclick]');
for (let index = 0; index < elementsWithOnClick.length; index++) {
    let element = elementsWithOnClick[index];

    // grab click attribute and look for links to root url
    let js = element.getAttribute('onclick');
    if (!js || !js.length) continue;
    let linkIndex = js.indexOf("='/");
    let legacyLinkIndex = js.indexOf("'legacy/");

    // point link at legacy site if pointed at root
    if (linkIndex > -1 && legacyLinkIndex === -1 || legacyLinkIndex > linkIndex) {
        let newJs = js.substring(0, linkIndex + 3) + 'legacy/' + js.substring(linkIndex + 3);
        element.setAttribute('onclick', newJs)
    }
}