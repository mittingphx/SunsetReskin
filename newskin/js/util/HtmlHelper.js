/**
 * Tools for working with HTML strings.
 */
export class HtmlHelper {

    /**
     * Finds an <input> tag in unparsed html that has a specific id
     * and then replaces its value.
     * @param html {string} unparsed html
     * @param searchId {string} id of field to find
     * @param newValue {string} new value to replace existing value with
     * @returns {string}
     */
    static injectTagValue(html, searchId, newValue) {

        // find the id attribute matching the searchId
        let idIndex = html.indexOf('id="' + searchId + '"');
        if (idIndex < 0) {
            console.error('Could not find id: ' + searchId);
            return html;
        }

        // find start of the tag that attribute is within
        let tagStartIndex = html.lastIndexOf('<input', idIndex);
        if (tagStartIndex < 0) {
            console.error('malformed html @ ' + idIndex + ': ' + html);
            return html;
        }

        // find the end of that tag
        let tagEndIndex = html.indexOf('>', tagStartIndex);
        if (tagEndIndex < 0) {
            console.error('malformed html @ ' + tagStartIndex + ': ' + html);
            return html;
        }
        else if (html[tagEndIndex - 1] === '/') {
            tagEndIndex--;
        }

        // look for a value attribute within that tag
        let valueStartIndex = html.indexOf('value="', tagStartIndex);
        if (valueStartIndex < 0 || valueStartIndex > tagEndIndex) { // no value attribute, add it
            valueStartIndex = tagEndIndex;
            return html.substring(0, valueStartIndex) + ' value="' + newValue + '"' + html.substring(valueStartIndex);
        }
        else { // replace existing value attribute
            let valueEndIndex = html.indexOf('"', valueStartIndex + 7);
            return html.substring(0, valueStartIndex + 7) + newValue + html.substring(valueEndIndex);
        }
    }


    /**
     * Replaces the innerHTML of a tag in unparsed html that has a
     * specific id.  This is meant for <textarea> tags.
     * @param html {string} unparsed html
     * @param searchId {string} id of field to find
     * @param newValue {string} new value to replace existing value with
     * @returns {string}
     */
    static injectTagInnerHtml(html, searchId, newValue) {
        let idIndex = html.indexOf('id="' + searchId + '"');
        if (idIndex < 0) {
            console.error('Could not find id: ' + searchId);
            return html;
        }
        let tagStartIndex = html.lastIndexOf('<textarea', idIndex);
        if (tagStartIndex < 0) {
            console.error('malformed html @ ' + idIndex + ': ' + html);
            return html;
        }
        let tagEndIndex = html.indexOf('>', tagStartIndex);
        let endTagStartIndex = html.indexOf('</textarea>', tagEndIndex);
        if (endTagStartIndex < 0) {
            console.error('malformed html @ ' + tagStartIndex + ': ' + html);
            return html;
        }

        return html.substring(0, tagEndIndex + 1) + encodeURIComponent(newValue) + html.substring(endTagStartIndex);
    }
}