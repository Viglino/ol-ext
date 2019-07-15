import ol_control_Control from 'ol/control/Control';
/**
 * Search Contr
 * This is the base class for search controls. You can use it for simple custom search or as base to new class.
 * @see contrSearchFeature
 * @see contrSearchPhoton
 *
 * @constructor
 * @extends {ol_control_Control}
 * @fires select
 * @fires change:input
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {string | undefined} options.label Text label to use for the search button, default "search"
 *  @param {string | undefined} options.placeholder placeholder, default "Search..."
 *  @param {string | undefined} options.inputLabel label for the input, default none
 *  @param {string | undefined} options.noCollapse prevent collapsing on input blur, default false
 *  @param {number | undefined} options.typing a delay on each typing to start searching (ms) use -1 to prevent autocompletion, default 300.
 *  @param {number | undefined} options.minLength minimum length to start searching, default 1
 *  @param {number | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *  @param {number | undefined} options.maxHistory maximum number of items to display in history. Set -1 if you don't want history, default maxItems
 *  @param {function} options.getTitle a function that takes a feature and return the name to display in the index.
 *  @param {function} options.autocomplete a function that take a search string and callback function to send an array
 */
export class Search extends ol_control_Control {
    constructor(options?: {
        className: string;
        target: Element | string | undefined;
        label: string | undefined;
        placeholder: string | undefined;
        inputLabel: string | undefined;
        noCollapse: string | undefined;
        typing: number | undefined;
        minLength: number | undefined;
        maxItems: number | undefined;
        maxHistory: number | undefined;
        getTitle: (...params: any[]) => any;
        autocomplete: (...params: any[]) => any;
    });
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
