import { Search } from './Search';
/**
 * Search on GPS coordinate.
 *
 * @constructor
 * @extends {contrSearch}
 * @fires select
 * @param {Object=} Control options.
 *  @param {string} options.className control class name
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {string | undefined} options.label Text label to use for the search button, default "search"
 *  @param {string | undefined} options.placeholder placeholder, default "Search..."
 *  @param {number | undefined} options.typing a delay on each typing to start searching (ms), default 300.
 *  @param {number | undefined} options.minLength minimum length to start searching, default 1
 *  @param {number | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 */
export class SearchGPS extends Search {
    constructor(Control?: any);
    /** Autocomplete function
    * @param {string} s search string
    * @return {Array<any>|false} an array of search solutions
    * @api
     */
    autocomplete(s: string): any[] | false;
    /** Get the input field
    *	@return {Element}
    *	@api
     */
    getInputField(): Element;
    /** Returns the text to be displayed in the menu
    *	@param {any} f feature to be displayed
    *	@return {string} the text to be displayed in the index, default f.name
    *	@api
     */
    getTitle(f: any): string;
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
    /** Test if 2 features are equal
     * @param {any} f1
     * @param {any} f2
     * @return {boolean}
     */
    equalFeatures(f1: any, f2: any): boolean;
}
