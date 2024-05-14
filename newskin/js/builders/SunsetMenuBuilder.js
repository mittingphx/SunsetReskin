/**
 * Project: Sunset Wholesale West Website
 * File:    SunsetMenuBuilder.js
 * Author:  Scott Mitting
 * Date:    2024-05-13
 * Abstract:
 *  HTML building methods for the menu on the swwest website.
 */

/**
 * Builds the HTML for the menu on the swwest website.
 */
export class SunsetMenuBuilder {


    /**
     * Recursively builds the HTML for the menu.
     * @param itemList {SunsetMenuItem[]}
     * @param childDepth {number} how many levels of children deep
     * @returns {HTMLUListElement}
     */
    buildMenuNode(itemList, childDepth) {

        // default depth is zero
        if (!childDepth) {
            childDepth = 0;
        }

        // determine class to use at this depth
        if (!this._depthClasses) {
            this._depthClasses = [
                'sub-category',
                'inner-sub-category',
                'inner-sub-2-category',
                'inner-sub-3-category',
                'inner-sub-4-category'
            ];
        }
        if (childDepth >= this._depthClasses.length) {
            childDepth = this._depthClasses.length - 1;
        }
        //console.log('depth=' + depth + ' class=' + this._depthClasses[depth]);
        if (childDepth >= this._depthClasses.length) {
            console.error('invalid menu depth: ' + childDepth);
            return document.createElement('ul');
        }
        let cssClass = this._depthClasses[childDepth];


        let $ul = document.createElement('ul');
        //$ul.classList.add(isChild ? 'inner-sub-category' : 'sub-category');
        $ul.classList.add(cssClass);
        for (let i = 0; i < itemList.length; i++) {
            let $li = document.createElement('li');
            if (itemList[i].children.length <= 0) {
                $li.innerHTML = `<a href="${itemList[i].link}">${itemList[i].text}</a>`;
            }
            else {
                let $subUl = this.buildMenuNode(itemList[i].children, childDepth + 1);
                $li.innerHTML = `<a href="${itemList[i].link}">${itemList[i].text} <i class="lni lni-chevron-right"></i></a>`;
                $li.appendChild($subUl);
            }
            $ul.appendChild($li);
        }
        return $ul;
    }

}