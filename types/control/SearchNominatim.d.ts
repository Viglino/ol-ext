import Feature from 'ol/Feature';
import { Search } from './Search';
/**
 * Search places using the Nominatim geocoder from the OpenStreetmap project.
 *
 * @constructor
 * @extends {contrSearch}
 * @fires select
 * @param {Object=} Control options.
 *	@param {string} options.className control class name
 *	@param {boolean | undefined} options.polygon To get output geometry of results (in geojson format), default false.
 *	@param {viewbox | undefined} options.viewbox The preferred area to find search results. Any two corner points of the box are accepted in any order as long as they span a real box, default none.
 *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {string | undefined} options.label Text label to use for the search button, default "search"
 *	@param {string | undefined} options.placeholder placeholder, default "Search..."
 *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 500.
 *	@param {number | undefined} options.minLength minimum length to start searching, default 3
 *	@param {number | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *
 *	@param {string|undefined} options.url URL to Nominatim API, default "https://nominatim.openstreetmap.org/search"
 * @see {@link https://wiki.openstreetmap.org/wiki/Nominatim}
 */
export class SearchNominatim extends Search {
    constructor(Control?: any);
    /** Returns the text to be displayed in the menu
     *	@param {Feature} f the feature
     *	@return {string} the text to be displayed in the index
     *	@api
     */
    getTitle(f: Feature): string;
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
    /** Get the input field
    *	@return {Element}
    *	@api
     */
    getInputField(): Element;
    /** Force search to refresh
     */
    search(): void;
    /** Set the input value in the form (for initialisation purpose)
    *	@param {string} value
    *	@param {boolean} search to start a search
    *	@api
     */
    setInput(value: string, search: boolean): void;
    /** Save history (in the localstorage)
     */
    saveHistory(): void;
    /** Restore history (from the localstorage)
     */
    restoreHistory(): void;
    /**
     * Remove previous history
     */
    clearHistory(): void;
    /**
     * Get history table
     */
    getHistory(): void;
    /** Autocomplete function
    * @param {string} s search string
    * @param {function} cback a callback function that takes an array to display in the autocomplete field (for asynchronous search)
    * @return {Array|false} an array of search solutions or false if the array is send with the cback argument (asnchronous)
    * @api
     */
    autocomplete(s: string, cback: (...params: any[]) => any): Array<any> | false;
    /** Test if 2 features are equal
     * @param {any} f1
     * @param {any} f2
     * @return {boolean}
     */
    equalFeatures(f1: any, f2: any): boolean;
}
