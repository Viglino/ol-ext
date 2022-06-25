export default ol_control_SearchPhoton;
/**
 * Search places using the photon API.
 *
 * @constructor
 * @extends {ol_control_SearchJSON}
 * @fires select
 * @param {Object=} Control options.
 *  @param {string} options.className control class name
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {string | undefined} options.title Title to use for the search button tooltip, default "Search"
 *  @param {string | undefined} options.reverseTitle Title to use for the reverse geocoding button tooltip, default "Click on the map..."
 *  @param {string | undefined} options.placeholder placeholder, default "Search..."
 *  @param {number | undefined} options.typing a delay on each typing to start searching (ms), default 1000.
 *  @param {integer | undefined} options.minLength minimum length to start searching, default 3
 *  @param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *  @param {function | undefined} options.handleResponse Handle server response to pass the features array to the list
 *
 *  @param {string|undefined} options.url Url to photon api, default "http://photon.komoot.de/api/"
 *  @param {string|undefined} options.lang Force preferred language, default none
 *  @param {boolean} options.position Search, with priority to geo position, default false
 *  @param {function} options.getTitle a function that takes a feature and return the name to display in the index, default return street + name + contry
 */
declare class ol_control_SearchPhoton {
    constructor(options: any);
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
     * Handle server response to pass the features array to the list
     * @param {any} response server response
     * @return {Array<any>} an array of feature
     */
    handleResponse(response: any): Array<any>;
    /** Prevent same feature to be drawn twice: test equality
     * @param {} f1 First feature to compare
     * @param {} f2 Second feature to compare
     * @return {boolean}
     * @api
     */
    equalFeatures(f1: any, f2: any): boolean;
    /** A ligne has been clicked in the menu > dispatch event
    *	@param {any} f the feature, as passed in the autocomplete
    *	@api
    */
    select(f: any): void;
    /** Get data for reverse geocode
     * @param {ol.coordinate} coord
     */
    reverseData(coord: ol.coordinate): {
        lon: number;
        lat: number;
    };
    /** Reverse geocode
     * @param {ol.coordinate} coord
     * @api
     */
    reverseGeocode(coord: ol.coordinate, cback: any): void;
}
