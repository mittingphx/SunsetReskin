
/**
 * Stores information about a dynamically created CSS class, so we can
 * add a few properties at a time instead the same <style> tag instead
 * of recreated the entire <style> tag.
 */
class DynamicCssClass {

    /**
     * The selector for the <style> tag that contains the CSS.
     * @type {string|null}
     */
    selector = null;

    /**
     * DOM reference to the <style> tag that contains the CSS.
     * @type {HTMLStyleElement|null}
     */
    $style = null;

    /**
     * The CSS properties used by this class.
     * @type {{}}
     */
    properties = {};

    /**
     * Sets properties on the <style> tag.
     * @param properties {Object<string, string>}
     * @return {boolean} true if any properties were changed
     */
    setProperties(properties) {
        let hasChanges = false;
        for (let key in properties) {
            key = DynamicCssClass.#toKebabCase(key);
            if (this.properties[key] !== properties[key]) {
                hasChanges = true;
                this.properties[key] = properties[key];
            }
        }
        return hasChanges
    }

    /**
     * Builds the CSS for the <style> tag from the current set of
     * properties.
     * @returns {string}
     */
    createCss() {
        return this.selector + ' {' + Object.keys(this.properties).map( (key) => {
            return key + ':' + this.properties[key];
        }).join(';') + '}';
    }

    /**
     * Updates the contents of the <style> tag with the results from
     * createCss().
     */
    update() {
        this.$style.innerHTML = this.createCss();
    }

    /**
     * Allows properties to be passed as their javascript equivalent
     * name (e.g. 'fontWeight' instead of 'font-weight')
     * @param str {string} key to convert
     * @return {string}
     */
    static #toKebabCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
}


/**
 * Helper methods for modifying CSS stylesheets dynamically.
 */
export class CssHelper {

    /**
     * List of DOM references to dynamically created CSS stylesheets.
     * @type {Object<string,DynamicCssClass>}
     */
    static #styleTags = {};

    /**
     * Gets the computed value of a CSS property on an element.
     * @param element {HTMLElement}
     * @param property {string}
     * @return {string}
     */
    static getCssProperty(element, property) {
        return window.getComputedStyle(element, null).getPropertyValue(property);
    }

    /**
     * Changes properties of a CSS class.
     * @param selector {string} CSS selector to change
     * @param propList {Object<string, string>} map of property names to values to change
     */
    static changeClassProperty(selector, propList) {

        // update properties and keep already created style properties
        let style = this.#getDynamicClass(selector);
        let hasChanges = style.setProperties(propList)

        // update the <style> tag
        if (hasChanges) {
            style.update();
        }
    }

    /**
     * Returns the style tag that contains the CSS for the given selector.
     * @param selector {string}
     * @return {DynamicCssClass}
     */
    static #getDynamicClass(selector) {
        let style = CssHelper.#styleTags[selector];
        if (!style) {
            style = new DynamicCssClass();
            style.selector = selector;
            style.$style = document.createElement('style');
            document.head.appendChild(style.$style);
            CssHelper.#styleTags[selector] = style;
        }
        return style;
    }
}