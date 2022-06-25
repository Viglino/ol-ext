export default ol_control_RoutingGeoportail;
/** Geoportail routing Control.
 * @constructor
 * @extends {ol_control_Control}
 * @fires select
 * @fires change:input
 * @fires routing:start
 * @fires routing
 * @fires step:select
 * @fires step:hover
 * @fires error
 * @fires abort
 * @param {Object=} options
 *	@param {string} options.className control class name
 *	@param {string | undefined} [options.apiKey] the service api key.
 *	@param {string | undefined} options.authentication: basic authentication for the service API as btoa("login:pwd")
 *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {string | undefined} options.label Text label to use for the search button, default "search"
 *	@param {string | undefined} options.placeholder placeholder, default "Search..."
 *	@param {string | undefined} options.inputLabel label for the input, default none
 *	@param {string | undefined} options.noCollapse prevent collapsing on input blur, default false
 *	@param {number | undefined} options.typing a delay on each typing to start searching (ms) use -1 to prevent autocompletion, default 300.
 *	@param {integer | undefined} options.minLength minimum length to start searching, default 1
 *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *	@param {integer | undefined} options.maxHistory maximum number of items to display in history. Set -1 if you don't want history, default maxItems
 *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index.
 *	@param {function} options.autocomplete a function that take a search string and callback function to send an array
 *	@param {number} options.timeout default 20s
 */
declare class ol_control_RoutingGeoportail {
    constructor(options: any);
    _classname: any;
    _source: ol_source_Vector<import("ol/geom/Geometry").default>;
    _auth: any;
    _search: any[];
    resultElement: HTMLElement;
    setMode(mode: any, silent: any): void;
    setMethod(method: any, silent: any): void;
    addButton(className: any, title: any, info: any): HTMLElement;
    /** Get point source
     * @return {ol.source.Vector }
     */
    getSource(): ol.source.Vector;
    _resetArray(element: any): void;
    /** Remove a new search input
     * @private
     */
    private removeSearch;
    /** Add a new search input
     * @private
     */
    private addSearch;
    /** Geometry has changed
     * @private
     */
    private onGeometryChange;
    /**
     * Set the map instance the control is associated with
     * and add its controls associated to this map.
     * @param {_ol_Map_} map The map instance.
     */
    setMap(map: _ol_Map_): void;
    /** Get request data
     * @private
     */
    private requestData;
    /** Gets time as string
     * @param {*} routing routing response
     * @return {string}
     * @api
     */
    getTimeString(t: any): string;
    /** Gets distance as string
     * @param {number} d distance
     * @return {string}
     * @api
     */
    getDistanceString(d: number): string;
    /** Show routing as a list
     * @private
     */
    private listRouting;
    /** Handle routing response
     * @private
     */
    private handleResponse;
    path: {
        type: string;
    };
    /** Abort request
     */
    abort(): void;
    _request: XMLHttpRequest;
    /** Calculate route
     * @param {Array<ol.coordinate>|undefined} steps an array of steps in EPSG:4326, default use control input values
     * @return {boolean} true is a new request is send (more than 2 points to calculate)
     */
    calculate(steps: Array<ol.coordinate> | undefined): boolean;
    /** Send an ajax request (GET)
     * @param {string} url
     * @param {function} onsuccess callback
     * @param {function} onerror callback
     */
    ajax(url: string, onsuccess: Function, onerror: Function): void;
}
import ol_source_Vector from "ol/source/Vector";
