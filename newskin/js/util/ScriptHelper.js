
// noinspection JSUnusedGlobalSymbols

export class ScriptHelper {

    /**
     * Executes all javascript <script> tags within the given element.
     *
     * In order to get this to work, we will be loading each of the
     * <script> tags with src using fetch and then eval()ing the content.
     * Embedded javascript content will be executed directly as well and
     * both will be executed in the order it appears.  The source will
     * not contain any <script> tags.
     *
     * @param element {HTMLElement}
     */
    static async runScripts(element) {
        // NOTE: this is currently disabled

        // get all the javascript that needs loaded
        let loadPlan = [];
        let references = [];
        let scripts = element.querySelectorAll('script');
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].src) {
                let obj = {url: scripts[i].src};
                loadPlan.push(obj);
                references.push(obj);
            }
            else {
                loadPlan.push({content: scripts[i].innerHTML});
            }
        }

        // fetch each of the javascript files asynchronously
        await Promise.all(
            references.map(script => fetch(script.url)
                .then(response => response.text())
                .then(text => script.content = text))
        );

        // execute the javascript in the order it appears
        for (let i = 0; i < loadPlan.length; i++) {
            if (loadPlan[i].content) {
                try {
                    if (loadPlan[i].url) {
                        console.log('running src=' + loadPlan[i].url);
                    }
                    else {
                        console.log('running inline script');
                    }
                    eval(loadPlan[i].content);
                }
                catch (ex) {
                    console.error('failed to run script\nexception: ' + ex + '\nscript: ' + loadPlan[i].content);
                }
            }
        }

    }

}