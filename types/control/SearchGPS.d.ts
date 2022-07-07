export default ol_control_SearchGPS;
/**
 * Search on GPS coordinate.
 *
 * @constructor
 * @extends {ol_control_Search}
 * @fires select
 * @param {Object=} Control options.
 *  @param {string} options.className control class name
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {string | undefined} options.label Text label to use for the search button, default "search"
 *  @param {string | undefined} options.placeholder placeholder, default "Search..."
 *  @param {number | undefined} options.typing a delay on each typing to start searching (ms), default 300.
 *  @param {integer | undefined} options.minLength minimum length to start searching, default 1
 *  @param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 */
declare class ol_control_SearchGPS {
    constructor(options: any);
    geolocation: ol_Geolocation;
    /** Create input form
     * @private
     */
    private _createForm;
    /** Autocomplete function
    * @param {string} s search string
    * @return {Array<any>|false} an array of search solutions
    * @api
    */
    autocomplete(s: string): Array<any> | false;
}
import ol_Geolocation from "ol/Geolocation";
