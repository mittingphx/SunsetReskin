// noinspection JSUnusedGlobalSymbols

/**
 * Project: Sunset Wholesale West Website
 * File:    DomHelper.js
 * Author:  Scott Mitting
 * Date:    2024-06-04
 * Abstract:
 * Algorithms for dealing with the document object model.
 */

/**
 * Set to true to show warnings when elements are not found.
 * @type {boolean}
 */
const SHOW_ELEMENT_WARNINGS = false;

/**
 * Alias for document.querySelector
 * @param query {string} DOM selector
 * @param source {Document|HTMLElement} optional source to pull from (default: document)
 * @return {Element|null}
 */
export function $(query, source = null) {
    if (!source) source = document;
    return source.querySelector(query);
}

/**
 * Returns the value of an element
 * @param query {string} DOM selector
 * @param source {Document|HTMLElement} optional source to pull from (default: document)
 * @return {*|null}
 */
export function $value(query, source = null) {
    const $el = $(query, source);
    return $el ? $el.value : null;
}

/**
 * Helper methods for dealing with the document object model.
 */
export class DomHelper {

    /**
     * Adds fields to an object by query selector.
     * @param data {object} object to add results to
     * @param $parent {HTMLElement|Document|Object.<string,string>} parent element to pull from (optional)
     * @param selectors {HTMLElement|Document|Object<string, string>} map of property names to query selectors
     * @returns {boolean} true iff all elements were found
     */
    static addElementsByQuery(data, $parent, selectors= null) {

        // handle method overloads manually
        if (selectors === null) {
            selectors = $parent;
            $parent = null;
        }

        // use document if no parent specified
        if ($parent === null) {
            $parent = document.body
        }

        // search for each element
        let ret = true;
        for (let selector in selectors) {
            let $element = $(selectors[selector], $parent);
            //let $element = $parent.querySelector(selectors[selector]);
            if ($element) {
                data[selector] = $element;
            }
            else {
                if (SHOW_ELEMENT_WARNINGS) {
                    console.warn('Could not find element with selector ' + selectors[selector]);
                }
                ret = false;
            }
        }
        return ret;
    }

    /**
     * Binds several form fields together from an array of objects
     * with the properties from and to.
     * @param bindings {{from: HTMLElement, to: HTMLElement}[]}
     * @param twoWay {boolean} when set the source is set to the target's initial value
     */
    static bindAllFormInputs(bindings, twoWay = false) {
        for (let binding of bindings) {
            DomHelper.bindFormInputs(binding.from, binding.to);
            if (twoWay) {
                DomHelper.bindFormInputs(binding.to, binding.from, true);
            }
        }
    }

    /**
     * Binds two form fields together so a change in one causes a
     * change in the other.
     * @param $source {HTMLElement} when changed the target's value is set
     * @param $target {HTMLElement} element set when source is changed
     * @param setNow {boolean} immediately set the target
     */
    static bindFormInputs($source, $target, setNow = false) {

        // pick set value function by target type
        let fnSetValue;
        if ($target instanceof HTMLInputElement) {
            if ($target.type === 'checkbox') {
                fnSetValue = value => {
                    $target.checked = value;
                }
            } else {
                fnSetValue = value => {
                    $target.value = value;
                }
            }
        }
        else if ($target instanceof HTMLButtonElement) {
            console.error('cannot bind button to form', $target);
            return;
        }
        else if ($target instanceof HTMLSelectElement) {
            fnSetValue = value => {
                for (let i = 0; i < $target.options.length; i++) {
                    if ($target.options[i].value === value) {
                        $target.selectedIndex = i;
                        break;
                    }
                }
            }
        }
        else if ($target instanceof HTMLTextAreaElement) {
            fnSetValue = value => $target.value = value;
        }
        else if (typeof $source.value === 'string') {
            fnSetValue = value => $target.value = value;
        }
        else if (typeof $source.innerHTML === 'string') {
            fnSetValue = value => $target.innerHTML = value;
        }
        else {
            console.error('unknown target type: ', $target);
            return;
        }

        // pick get value function by source type
        let fnGetValue;
        if ($source instanceof HTMLInputElement) {
            if ($source.type === 'checkbox') {
                fnGetValue = () => $source.checked;
            } else {
                fnGetValue = () => $source.value;
            }
        }
        else if ($source instanceof HTMLSelectElement) {
            fnGetValue = () => $source.options[$source.selectedIndex].value;
        }
        else if ($source instanceof HTMLTextAreaElement) {
            fnGetValue = () => $source.value;
        }
        else if (typeof $source.value === 'string') {
            fnGetValue = () => $source.value;
        }
        else if (typeof $source.innerHTML === 'string') {
            fnGetValue = () => $source.innerHTML;
        }
        else {
            console.error('unknown source type: ', $source);
            return;
        }

        // add appropriate event (always 'change' so far)
        $source.addEventListener('change', _ => {
            fnSetValue(fnGetValue());
        });

        // immediately set if requested
        if (setNow) {
            fnSetValue(fnGetValue());
        }
    }

}