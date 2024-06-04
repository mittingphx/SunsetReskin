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

let skin = new SunsetSkin();
skin.apply();
