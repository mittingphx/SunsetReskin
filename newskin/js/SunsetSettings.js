/**
 * Project: Sunset Wholesale West Website
 * File:    SunsetSettings.js
 * Author:  Scott Mitting
 * Date:    2024-06-10
 * Abstract:
 *  Settings constants stored on a per file-type basis.
 *
 */

import {BaseController} from "./controllers/BaseControllers.js";
import {FrontPageController} from "./controllers/FrontPageControler.js";
import {ProductDetailsController} from "./controllers/ProductDetailsContoller.js";
import {CategoryController} from "./controllers/CategoryContoller.js";
import {CartController} from "./controllers/CartController.js";
import {LoginController} from "./controllers/LoginController.js";
import {ContactPageController} from "./controllers/ContactPageController.js";
import {MyAccountController} from "./controllers/MyAccountController.js";


/**
 * Settings constants for different aspects of the system.
 */
export class SunsetSettings {

    /**
     * Available controller classes.
     * @type {Object.<string,BaseController|function>}
     */
    static controllers = {
        'FrontPageController': FrontPageController,
        'ProductDetailsController': ProductDetailsController,
        'CategoryController': CategoryController,
        'CartController': CartController,
        'LoginController': LoginController,
        'ContactPageController': ContactPageController,
        'MyAccountController': MyAccountController
    };

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
        },
        'MyAccount': {
            newSkinUrl: 'newskin/html/MyAccount.html',
            hasMenu: true,
            controller: 'MyAccountController'
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

    /**
     * Returns a new instance of the controller with the given name.
     * @param controllerName {string}
     * @param skin {SunsetSkin}
     * @returns {BaseController}
     */
    static getControllerInstanceByName(controllerName, skin) {
        let controller = this.controllers[controllerName];
        if (controller) {
            return new controller(skin);
        }
        throw new Error('Unknown controller: ' + controllerName);

/*

        switch (controllerName) {
            case 'FrontPageController':
                return new FrontPageController(skin);
            case 'ProductDetailsController':
                return new ProductDetailsController(skin);
            case 'CategoryController':
                return new CategoryController(skin);
            case 'CartController':
                return new CartController(skin);
            case 'LoginController':
                return new LoginController(skin);
            case 'ContactPageController':
                return new ContactPageController(skin);
            case 'MyAccountController':
                return new MyAccountController(skin);
            default:
                throw new Error('Unknown controller: ' + controllerName);
        }
        */

    }
}
