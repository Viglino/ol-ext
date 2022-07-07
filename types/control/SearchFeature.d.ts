export default ol_control_SearchFeature;
/**
 * Search features.
 *
 * @constructor
 * @extends {ol_control_Search}
 * @fires select
 * @param {Object=} Control options.
 *	@param {string} options.className control class name
 *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {string | undefined} options.label Text label to use for the search button, default "search"
 *	@param {string | undefined} options.placeholder placeholder, default "Search..."
 *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 300.
 *	@param {integer | undefined} options.minLength minimum length to start searching, default 1
 *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *
 *	@param {string | undefined} options.property a property to display in the index, default 'name'.
 *	@param {function} options.getTitle a function that takes a feature and return the name to display in the index, default return the property
 *	@param {function | undefined} options.getSearchString a function that take a feature and return a text to be used as search string, default geTitle() is used as search string
 */
declare class ol_control_SearchFeature {
    constructor(options: any);
    /** Return the string to search in
    *	@param {ol.Feature} f the feature
    *	@return {string} the text to be used as search string
    *	@api
    */
    getSearchString(f: ol.Feature): string;
    source_: any;
    /** No history avaliable on features
     */
    restoreHistory(): void;
    /** No history avaliable on features
     */
    saveHistory(): void;
    /** Returns the text to be displayed in the menu
    *	@param {ol.Feature} f the feature
    *	@return {string} the text to be displayed in the index
    *	@api
    */
    getTitle(f: ol.Feature): string;
    /** Get the source
    *	@return {ol.source.Vector}
    *	@api
    */
    getSource(): ol.source.Vector;
    /** Get the source
    *	@param {ol.source.Vector} source
    *	@api
    */
    setSource(source: ol.source.Vector): void;
    /** Autocomplete function
    * @param {string} s search string
    * @param {int} max max
    * @param {function} cback a callback function that takes an array to display in the autocomplete field (for asynchronous search)
    * @return {Array<any>|false} an array of search solutions or false if the array is send with the cback argument (asnchronous)
    * @api
    */
    autocomplete(s: string): Array<any> | false;
}
