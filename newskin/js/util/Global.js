/**
 * Project: Sunset Wholesale West Website
 * File:    Global.js
 * Author:  Scott Mitting
 * Date:    2024-06-10
 * Abstract:
 *  Reflection-link helper functions.
 *
 */

import {CartController} from "../controllers/CartController.js";
import {CategoryController} from "../controllers/CategoryContoller.js";
import {ContactPageController} from "../controllers/ContactPageController.js";
import {FrontPageController} from "../controllers/FrontPageControler.js";
import {LoginController} from "../controllers/LoginController.js";
import {MenuController} from "../controllers/MenuController.js";
import {ProductDetailsController} from "../controllers/ProductDetailsContoller.js";
import {SkinToggleController} from "../controllers/SkinToggleController.js";
import {WishListController} from "../controllers/WishListController.js";


/**
 * Helper class that lets us create new instances of classes with only
 * the name of the class being available.
 */
export class Global {

    /**
     * Returns a new instance of an object with the specified name
     * in the global javascript context.
     * @param name {string} name of the class to create
     * @param arg0 {*} optional argument
     * @param arg1 {*} optional argument
     * @param arg2 {*} optional argument
     * @param arg3 {*} optional argument
     * @param arg4 {*} optional argument
     * @param arg5 {*} optional argument
     * @returns {*} the new instance
     */
    static createInstanceByName(name, arg0 = null, arg1 = null, arg2 = null, arg3 = null, arg4 = null, arg5 = null) {

        let obj = eval('new ' + name + '(arg0, arg1, arg2, arg3, arg4, arg5)');
        if (!obj) {
            console.error('Could not create an instance of ' + name);
        }
        return obj;

        /*
        let global = this.getGlobalScope();
        let obj = global[name](arg0, arg1, arg2, arg3, arg4, arg5);
        if (!obj) {
            console.error('Could not create an instance of ' + name);
        }
        return obj;*/
    }

    /**
     * Returns the global javascript context in way that works within
     * browsers and node.js
     * @returns {*}
     */
    static getGlobalScope() {
        let global;
        try {
            global = Function('return this')() || (42, eval)('this');
        }
        catch (e) {
            global = window;
        }
        return global;
    }
}
