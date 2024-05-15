/**
 * Model class for parsed product detail data.
 */
export class ProductDetailItem {

    /**
     * The display text for this product item.
     * @type {string}
     */
    text = '';

    /**
     * Text description for this product (not currently used).
     * @type {string}
     */
    description = '';

    /**
     * Image to display for this product.
     * @type {string}
     */
    image = '';

    /**
     * Alternate images for the product.
     * @type {[string]}
     */
    images = [];

    /**
     * Category this product belongs to.
     * TODO: collect this info from old page
     * @type {string}
     */
    category = '';

    /**
     * Features of this product (not currently used).
     *
     * @type {[string]}
     */
    features = [];

    /**
     * Size to display for this product.
     * @type {string}
     */
    size = '';

    /**
     * How many items make up this product.
     * @type {string}
     */
    pack = '';

    /**
     * The unique item number to show for this product.
     * @type {string}
     */
    itemNo = '';

    /**
     * Pallet number for this product.
     * @type {string}
     */
    pallet = '';

    /**
     * Price for this product.
     * @type {string}
     */
    price = '';

    /**
     * Price before discount is applied.
     * @type {string}
     */
    preDiscountPrice = '';

    /**
     * Shipping options (not currently used)
     * @type {[]}
     */
    shippingOptions = [];

    /**
     * Options for the product like color or size (not currently used)
     * @type {[]}
     */
    options = [];

    /**
     * Price per case for this product.
     * @type {string}
     */
    casePrice = '';

}

/**
 * Parses product details from the product detail page.
 */
export class ProductDetailParser {


    /**
     * The HTML document to load the product data from.
     * @type {Document|null}
     */
    sourceDocument = null;

    /**
     * Constructor defaults source document to the current document.
     * @param source {Document|null}
     */
    constructor(source) {
        this.sourceDocument = source || document;
    }


    /**
     * Loads a product detail from the source document, assuming it is
     * the product details page.
     * @returns {ProductDetailItem|null}
     */
    readProductDetail() {

        let ret = new ProductDetailItem();

        // grab the parent
        const $table = this.sourceDocument.querySelector('#MainContent_Table1')
        if (!$table) {
            console.error('could not find product detail using selector: #MainContent_Table1');
            return null;
        }

        // grab the image
        let $img = $table.querySelector('.ImgItemDetail');
        if ($img) {
            ret.image = $img.getAttribute('src');
        }
        else {
            console.error('could not find image using selector: .ImgItemDetail');
            // TODO: use a placeholder image here
        }

        // grab the detail properties
        let $detail = $table.querySelector('#MainContent_PanelQty');
        if (!$detail) {
            console.error('could not find detail properties using selector: #MainContent_PanelQty');
            return null;
        }

        // span labels that map to properties
        const propMap = {
            'ItemDesc': 'text',
            'Size': 'size',
            'Pack': 'pack',
            'ItemNo': 'itemNo',
            'UPC': 'upc',
            'Palette': 'pallet',
            'Price': 'price'
        };

        // check each span within the details area
        let $spans = $detail.querySelectorAll('span');
        for (let i = 0; i < $spans.length; i++) {

            // determine if this span corresponds to a property
            let key= $spans[i].getAttribute('id');
            if (!key || !key.toLowerCase().startsWith('MainContent_Lbl'.toLowerCase())) {
                continue;
            }

            // grab details by span id
            key = key.substring('MainContent_Lbl'.length);
            if (key in propMap) {
                ret[propMap[key]] = $spans[i].textContent;
            }
        }



        return ret;

    }

}
