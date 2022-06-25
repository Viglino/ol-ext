export default ol_control_Search;
/**
 * Search Control.
 * This is the base class for search controls. You can use it for simple custom search or as base to new class.
 * @see ol_control_SearchFeature
 * @see ol_control_SearchPhoton
 *
 * @constructor
 * @extends {ol_control_Control}
 * @fires select
 * @fires change:input
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {string | undefined} options.title Title to use for the search button tooltip, default "Search"
 *  @param {string | undefined} options.reverseTitle Title to use for the reverse geocoding button tooltip, default "Click on the map..."
 *  @param {string | undefined} options.placeholder placeholder, default "Search..."
 *  @param {boolean | undefined} options.reverse enable reverse geocoding, default false
 *  @param {string | undefined} options.inputLabel label for the input, default none
 *  @param {string | undefined} options.collapsed search is collapsed on start, default true
 *  @param {string | undefined} options.noCollapse prevent collapsing on input blur, default false
 *  @param {number | undefined} options.typing a delay on each typing to start searching (ms) use -1 to prevent autocompletion, default 300.
 *  @param {integer | undefined} options.minLength minimum length to start searching, default 1
 *  @param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *  @param {integer | undefined} options.maxHistory maximum number of items to display in history. Set -1 if you don't want history, default maxItems
 *  @param {function} options.getTitle a function that takes a feature and return the name to display in the index.
 *  @param {function} options.autocomplete a function that take a search string and callback function to send an array
 *  @param {function} options.onselect a function called when a search is selected
 *  @param {boolean} options.centerOnSelect center map on search, default false
 *  @param {number|boolean} options.zoomOnSelect center map on search and zoom to value if zoom < value, default false
 */
declare class ol_control_Search {
    constructor(options: any);
    _classname: any;
    button: HTMLElement;
    _input: HTMLElement;
    /** Returns the text to be displayed in the menu
     *	@param {any} f feature to be displayed
     *	@return {string} the text to be displayed in the index, default f.name
     *	@api
     */
    getTitle(f: any): string;
    /** Autocomplete function
    * @param {string} s search string
    * @param {function} cback a callback function that takes an array to display in the autocomplete field (for asynchronous search)
    * @return {Array|false} an array of search solutions or false if the array is send with the cback argument (asnchronous)
    * @api
    */
    autocomplete(s: string, cback: Function): any[] | false;
    /**
     * Remove the control from its current map and attach it to the new map.
     * Subclasses may set up event handlers to get notified about changes to
     * the map here.
     * @param {ol.Map} map Map.
     * @api stable
     */
    setMap(map: ol.Map): void;
    _listener: any;
    /** Collapse the search
     * @param {boolean} [b=true]
     * @api
     */
    collapse(b?: boolean): void;
    /** Get the input field
    *	@return {Element}
    *	@api
    */
    getInputField(): Element;
    /** Returns title as text
     *	@param {any} f feature to be displayed
     *	@return {string}
     *	@api
     */
    _getTitleTxt(f: any): string;
    /** Force search to refresh
     */
    search(): void;
    /** Reverse geocode
     * @param {Object} event
     *  @param {ol.coordinate} event.coordinate
     * @private
     */
    private _handleClick;
    /** Reverse geocode
     * @param {ol.coordinate} coord
     * @param {function | undefined} cback a callback function, default trigger a select event
     * @api
     */
    reverseGeocode(): void;
    /** Trigger custom event on elemebt
     * @param {*} eventName
     * @param {*} element
     * @private
     */
    private _triggerCustomEvent;
    /** Set the input value in the form (for initialisation purpose)
    *	@param {string} value
    *	@param {boolean} search to start a search
    *	@api
    */
    setInput(value: string, search: boolean): void;
    /** A line has been clicked in the menu > dispatch event
     * @param {any} f the feature, as passed in the autocomplete
     * @param {boolean} reverse true if reverse geocode
     * @param {ol.coordinate} coord
     * @param {*} options options passed to the event
     *	@api
     */
    select(f: any, reverse: boolean, coord: ol.coordinate, options: any): void;
    /**
     * Save history and select
     * @param {*} f
     * @param {boolean} reverse true if reverse geocode
     * @param {*} options options send in the event
     * @private
     */
    private _handleSelect;
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
    getHistory(): any;
    /** Draw the list
    * @param {Array} auto an array of search result
    * @private
    */
    private drawList_;
    _list: any[];
    /** Test if 2 features are equal
     * @param {any} f1
     * @param {any} f2
     * @return {boolean}
     */
    equalFeatures(): boolean;
    /** Current history */
    _history: {};
}
