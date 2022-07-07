export default ol_control_SearchGeoportail;
/**
 * Search places using the French National Base Address (BAN) API.
 *
 * @constructor
 * @extends {ol.control.SearchJSON}
 * @fires select
 * @param {any} options extend ol.control.SearchJSON options
 *	@param {string} options.className control class name
 *	@param {string | undefined} [options.apiKey] the service api key.
 *	@param {string | undefined} options.authentication: basic authentication for the service API as btoa("login:pwd")
 *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {string | undefined} options.label Text label to use for the search button, default "search"
 *	@param {boolean | undefined} options.reverse enable reverse geocoding, default false
 *	@param {string | undefined} options.placeholder placeholder, default "Search..."
 *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 500.
 *	@param {integer | undefined} options.minLength minimum length to start searching, default 3
 *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *
 *	@param {StreetAddress|PositionOfInterest|CadastralParcel|Commune} options.type type of search. Using Commune will return the INSEE code, default StreetAddress,PositionOfInterest
 * @see {@link https://geoservices.ign.fr/documentation/geoservices/geocodage.html}
 */
declare class ol_control_SearchGeoportail {
    constructor(options: any);
    /** Reverse geocode
     * @param {ol.coordinate} coord
     * @param {function|*} options callback function called when revers located or options passed to the select event
     * @api
     */
    reverseGeocode(coord: ol.coordinate, options: Function | any): void;
    /** Returns the text to be displayed in the menu
     *	@param {ol.Feature} f the feature
     *	@return {string} the text to be displayed in the index
     *	@api
     */
    getTitle(f: ol.Feature): string;
    /**
     * @param {string} s the search string
     * @return {Object} request data (as key:value)
     * @api
     */
    requestData(s: string): any;
    /**
     * Handle server response to pass the features array to the display list
     * @param {any} response server response
     * @return {Array<any>} an array of feature
     * @api
     */
    handleResponse(response: any): Array<any>;
    /** A ligne has been clicked in the menu > dispatch event
     * @param {any} f the feature, as passed in the autocomplete
     * @param {boolean} reverse true if reverse geocode
     * @param {ol.coordinate} coord
     * @param {*} options options passed to the event
     *	@api
     */
    select(f: any, reverse: boolean, coord: ol.coordinate, options: any): void;
    /** Search if no position and get the INSEE code
     * @param {string} s le nom de la commune
     */
    searchCommune(f: any, cback: any): void;
}
