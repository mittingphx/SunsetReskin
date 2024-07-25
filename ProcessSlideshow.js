
/**
 This code allows custom markup in the slideshows to turn into
 html dropdowns.  This was needed because the website limits the
 html of slide show items to a certain size, limiting how many
 product links we can place in the slideshow.
 */
/*
function processSlideshowMarkup() {
    console.log('Running processSlideshowMarkup()');

    let $slider = document.querySelector('.bxslider');
    if (!$slider) return;
    let $dropdowns = $slider.querySelectorAll('select');
    for (let i = 0; i < $dropdowns.length; i++) {
        let $ddl = $dropdowns[i];
        let $parent = $ddl.parentElement;
        let ddlHtml = $ddl.outerHTML;
        let items = [];

        // make sure the select has a class of "slider-link"
        if ($parent && !$parent.classList.contains('slider-link')) {
            $parent.classList.add('slider-link');
        }

        // if there's no <option> within the <select>, assume it's a
        // comma-selected list of inventory items to display
        if (ddlHtml.indexOf('<option') === -1) {
            let inner = $ddl.innerHTML;

            // also look for the label ",color:" at the end which defines the colors to apply
            let colorIndex = inner.indexOf(',color:');
            if (colorIndex > -1) {
                let colors = inner.substring(colorIndex + 7);
                let parts = colors.split(',');
                if (parts.length >= 1) {
                    $ddl.style.color = parts[0];
                }
                if (parts.length >= 2) {
                    $ddl.style.backgroundColor = parts[1];
                }
                inner = inner.substring(0, colorIndex);
            }

            items = inner.split(',');
        }
        else {
            // get the list of product numbers from the existing dropdown
            for (let j = 0; j < $ddl.options.length; j++) {
                let itemNumber = $ddl.options[j].value;
                if (!itemNumber) {
                    itemNumber = $ddl.options[j].text;
                }
                if (!itemNumber || itemNumber === 'Choose Product') {
                    continue;
                }
                if (itemNumber.indexOf('INV# ') !== -1) {
                    itemNumber = itemNumber.substring('INV# '.length);
                }
                items.push(itemNumber);
            }
        }

        function getCookie(name) {
            let matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));
            return matches ? decodeURIComponent(matches[1]) : undefined;
        }

        // open the detail page for the selected item when the user selects an option
        $ddl.onchange = function() {

            // get the product selection
            const value = this.options[this.selectedIndex].value;
            console.log('user selected value: ' + value);
            if (!value) {
                console.log('Skipping event, user selected blank option.');
                return;
            }

            // open all product details if "all" was select
            if (value === 'all') {
                // show popup warning once per hour
                if (getCookie('warning') !== 'popup') {
                    alert('Make sure popup blockers are off when opening all products');
                    document.cookie = "warning=popup; max-age=3600";
                }

                for (let k = 1; k < this.options.length; k++) {
                    if (!this.options[k].value) {
                        continue;
                    }
                    if (this.options[k].value === 'all') {
                        continue;
                    }
                    const url = '/ItemDetail.aspx?ItemNo=' + this.options[k].value;
                    window.open(url);
                }
            }
            // otherwise open the specific product
            else {
                const url = '/ItemDetail.aspx?ItemNo=' + value;
                window.open(url);
            }
        };

        // read in the list of items and make sure there's a select product options
        // and apply the new cleaned up list to replace the dropdown
        for (let j = $ddl.options.length - 1; j >= 0; j--) {
            $ddl.remove(j);
        }

        let chooseProduct = document.createElement('option');
        chooseProduct.text = 'Choose Product';
        $ddl.appendChild(chooseProduct);

        for (let j = 0; j < items.length; j++) {
            const itemNumber = items[j];
            let option = document.createElement('option');
            if (itemNumber.toLowerCase() === 'all') {
                option.value = 'all';
                option.text = 'Open All Products';
            }
            else {
                option.value = itemNumber;
                option.text = 'INV# ' + itemNumber;
            }
            $ddl.appendChild(option);
        }
    }
}
setTimeout(function() {
    processSlideshowMarkup();
},100);

*/
