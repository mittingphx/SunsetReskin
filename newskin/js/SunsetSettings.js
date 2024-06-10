/**
 * Project: Sunset Wholesale West Website
 * File:    SunsetSettings.js
 * Author:  Scott Mitting
 * Date:    2024-06-10
 * Abstract:
 *  Settings constants stored on a per file-type basis.
 *
 */


/**
 * Settings constants for different aspects of the system.
 */
export class SunsetSettings {

    /**
     * Settings for each of the file types supported by this system.
     * @type {Object.<string,{newSkinUrl: string, hasMenu: boolean, controller: string}>}
     */
    static fileTypes = {
        'FrontPage': {
            newSkinUrl: 'newskin/html/FrontPage.html',
            hasMenu: true,
            controller: 'FrontPageController'
        },
        'ItemDetail': {
            newSkinUrl: 'newskin/html/ItemDetails.html',
            hasMenu: true,
            controller: 'ProductDetailsController'
        },
        'Category': {
            newSkinUrl: 'newskin/html/Category.html',
            hasMenu: true,
            controller: 'CategoryController'
        },
        'Cart': {
            newSkinUrl: 'newskin/html/Cart.html',
            hasMenu: true,
            controller: 'CartController'
        },
        'Login': {
            newSkinUrl: 'newskin/html/Login.html',
            hasMenu: true,
            controller: 'LoginController'
        },
        'ContactUs': {
            newSkinUrl: 'newskin/html/Contact.html',
            hasMenu: true,
            controller: 'ContactPageController'
        }
    };

    /**
     * Returns the settings for the given file type.
     * @param fileType
     * @returns {{newSkinUrl: string, hasMenu: boolean, controller: string}}
     */
    static getByFileType(fileType) {
        return this.fileTypes[fileType];
    }
}
