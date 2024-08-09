export class StringHelper {

    /**
     * Returns true iff the string contains the text, ignoring case.
     * @param string {string|null} the string to search
     * @param text {string} the text to search for
     */
    static contains(string, text) {
        if (!string || !text) {
            return false;
        }
        return string.toLowerCase().includes(text.toLowerCase());
    }
}