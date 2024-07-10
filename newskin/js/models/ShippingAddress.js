/**
 * Represents one shipping address record from the My Account screen.
 */
export class ShippingAddress {

    /**
     * Link to the edit form from the old website.
     * @type {HTMLAnchorElement|null}
     */
    $link = null;

    /**
     * Link to the delete button on the old website.
     * @type {HTMLAnchorElement|null}
     */
    $deleteLink = null;

    /**
     * Name of this record in the list.
     * @type {string|null}
     */
    addressName = null;

    /**
     * The street address of the business.
     * @type {string|null}
     */
    businessAddress = null;

    /**
     * The optional unit number.
     * @type {string|null}
     */
    unitNo = null;

    /**
     * The zip code of the business
     * @type {string|null}
     */
    zipCode = null;

    /**
     * The city of the business
     * @type {string|null}
     */
    city = null;

    /**
     * The state of the business
     * @type {string|null}
     */
    state = null;

    /**
     * The phone number of the business
     * @type {string|null}
     */
    phoneNumber = null;

    /**
     * The cell number of the business
     * @type {string|null}
     */
    cellNumber = null;

    /**
     * The fax number of the business
     * @type {string|null}
     */
    faxNumber = null;
}