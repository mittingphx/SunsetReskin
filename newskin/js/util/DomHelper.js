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
     */
    static bindAllFormInputs(bindings) {
        for (let binding of bindings) {
            DomHelper.bindFormInputs(binding.from, binding.to);
        }
    }

    /**
     * Binds two form fields together so a change in one causes a
     * change in the other.
     * @param $source {HTMLElement}
     * @param $target {HTMLElement}
     */
    static bindFormInputs($source, $target) {

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
        else {
            console.error('unknown source type: ', $source);
            return;
        }

        // add appropriate event (always 'change' so far)
        $source.addEventListener('change', _ => {
            fnSetValue(fnGetValue());
        });
    }

    /**
     * @typedef {Object} SpanMapItem
     * One item in a SpanMap
     * @property {string} field - The name of the field to assign in an object
     * @property {string} type - The type of the field within a <span>
     */

    /**
     * @typedef {Object.<string, SpanMapItem>} SpanMap
     * Maps the DOM id of a field to an item describing the field within an
     * object to map the value to, and what type of data is expected within
     * the <span>.
     */

    /**
     * Maps the content of all <span> elements within a given parent element using a mapping object.
     *
     * @param {object} obj - The object to map the content of the <span> elements to.
     * @param {HTMLElement} $parent - The parent element containing the <span> elements to be mapped.
     * @param {SpanMap} spanMap - The mapping object used to map the content of the <span> elements.
     * @return {void}
     */
    static mapSpanContent(obj, $parent, spanMap) {

        // find each <span> in the parent
        let $spans = $parent.querySelectorAll('span');
        for (let i = 0; i < $spans.length; i++) {

            // determine if this span corresponds to a property
            let key = $spans[i].getAttribute('id');
            if (!key) continue;

            // grab details by span id if defined in the map
            if (key in spanMap) {
                let map = spanMap[key];
                if (map.type === 'text') {
                    obj[map.field] = $spans[i].textContent;
                }
                else if (map.type === 'number') {
                    obj[map.field] = parseFloat($spans[i].textContent);
                }
                else if (map.type === 'html') {
                    obj[map.field] = $spans[i].innerHTML;
                }
            }
        }
    }
}