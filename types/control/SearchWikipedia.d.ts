export default ol_control_SearchWikipedia;
/**
 * Search places using the MediaWiki API.
 * @see https://www.mediawiki.org/wiki/API:Main_page
 *
 * @constructor
 * @extends {ol_control_SearchJSON}
 * @fires select
 * @param {Object=} Control options.
 *  @param {string} options.className control class name
 *  @param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {string | undefined} options.label Text label to use for the search button, default "search"
 *  @param {string | undefined} options.placeholder placeholder, default "Search..."
 *  @param {number | undefined} options.typing a delay on each typing to start searching (ms), default 1000.
 *  @param {integer | undefined} options.minLength minimum length to start searching, default 3
 *  @param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *  @param {function | undefined} options.handleResponse Handle server response to pass the features array to the list
 *
 *  @param {string|undefined} options.lang API language, default none
 */
declare class ol_control_SearchWikipedia {
    constructor(options: any);
    /** Returns the text to be displayed in the menu
    *	@param {ol.Feature} f the feature
    *	@return {string} the text to be displayed in the index
    *	@api
    */
    getTitle(f: ol.Feature): string;
    /** Set the current language
     * @param {string} lang the current language as ISO string (en, fr, de, es, it, ja, ...)
     */
    setLang(lang: string): void;
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
    /** A ligne has been clicked in the menu query for more info and disatch event
    *	@param {any} f the feature, as passed in the autocomplete
    *	@api
    */
    select(f: any): void;
}
