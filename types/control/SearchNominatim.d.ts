export default ol_control_SearchNominatim;
/**
 * Search places using the Nominatim geocoder from the OpenStreetmap project.
 *
 * @constructor
 * @extends {ol.control.Search}
 * @fires select
 * @param {Object=} Control options.
 *  @param {string} options.className control class name
 *  @param {boolean | undefined} options.polygon To get output geometry of results (in geojson format), default false.
 *  @param {Array<Number> | undefined} options.viewbox The preferred area to find search results. Any two corner points of the box are accepted in any order as long as they span a real box, default none.
 *  @param {boolean | undefined} options.bounded Restrict the results to only items contained with the bounding box. Restricting the results to the bounding box also enables searching by amenity only. default false
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {string | undefined} options.title Title to use for the search button tooltip, default "Search"
 *  @param {string | undefined} options.reverseTitle Title to use for the reverse geocoding button tooltip, default "Click on the map..."
 *  @param {string | undefined} options.placeholder placeholder, default "Search..."
 *  @param {number | undefined} options.typing a delay on each typing to start searching (ms), default 500.
 *  @param {integer | undefined} options.minLength minimum length to start searching, default 3
 *  @param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *
 *  @param {string|undefined} options.url URL to Nominatim API, default "https://nominatim.openstreetmap.org/search"
 * @see {@link https://wiki.openstreetmap.org/wiki/Nominatim}
 */
declare class ol_control_SearchNominatim {
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
    /** A ligne has been clicked in the menu > dispatch event
     *	@param {any} f the feature, as passed in the autocomplete
    *	@api
    */
    select(f: any): void;
    /** Reverse geocode
     * @param {ol.coordinate} coord
     * @api
     */
    reverseGeocode(coord: ol.coordinate, cback: any): void;
}
