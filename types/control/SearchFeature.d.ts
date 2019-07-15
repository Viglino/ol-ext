import Feature from 'ol/Feature';
import { Vector as VectorSource } from 'ol/source';
import { Search } from './Search';
/**
 * Search features.
 *
 * @constructor
 * @extends {contrSearch}
 * @fires select
 * @param {Object=} Control options.
 *	@param {string} options.className control class name
 *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {string | undefined} options.label Text label to use for the search button, default "search"
 *	@param {string | undefined} options.placeholder placeholder, default "Search..."
 *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 300.
 *	@param {number | undefined} options.minLength minimum length to start searching, default 1
 *	@param {number | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *
 *	@param {string | undefined} options.property a property to display in the index, default 'name'.
 *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index, default return the property
 *	@param {function | undefined} options.getSearchString a function that take a feature and return a text to be used as search string, default geTitle() is used as search string
 */
export class SearchFeature extends Search {
    constructor(Control?: any);
    /** No history avaliable on features
     */
    restoreHistory(): void;
    /** No history avaliable on features
     */
    saveHistory(): void;
    /** Returns the text to be displayed in the menu
    *	@param {Feature} f the feature
    *	@return {string} the text to be displayed in the index
    *	@api
     */
    getTitle(f: Feature): string;
    /** Return the string to search in
    *	@param {Feature} f the feature
    *	@return {string} the text to be used as search string
    *	@api
     */
    getSearchString(f: Feature): string;
    /** Get the source
    *	@return {VectorSource}
    *	@api
     */
    getSource(): VectorSource;
    /** Get the source
    *	@param {VectorSource} source
    *	@api
     */
    setSource(source: VectorSource): void;
    /** Autocomplete function
    * @param {string} s search string
    * @param {number} max max
    * @param {function} cback a callback function that takes an array to display in the autocomplete field (for asynchronous search)
    * @return {Array<any>|false} an array of search solutions or false if the array is send with the cback argument (asnchronous)
    * @api
     */
    autocomplete(s: string, cback: (...params: any[]) => any): Array<any> | false;
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
    /** A ligne has been clicked in the menu > dispatch event
    *	@param {any} f the feature, as passed in the autocomplete
    *	@api
     */
    select(f: any): void;
    /**
     * Remove previous history
     */
    clearHistory(): void;
    /**
     * Get history table
     */
    getHistory(): void;
    /** Test if 2 features are equal
     * @param {any} f1
     * @param {any} f2
     * @return {boolean}
     */
    equalFeatures(f1: any, f2: any): boolean;
}
