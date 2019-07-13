import { SearchJSON } from './SearchJSON';
/**
 * Search places using the French National Base Address (BAN) API.
 *
 * @constructor
 * @extends {contrSearchJSON}
 * @fires select
 * @param {any} options extend contrSearchJSON options
 *	@param {string} options.className control class name
 *	@param {boolean | undefined} options.apiKey the service api key.
 *	@param {string | undefined} options.authentication: basic authentication for the service API as btoa("login:pwd")
 *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {string | undefined} options.label Text label to use for the search button, default "search"
 *	@param {string | undefined} options.placeholder placeholder, default "Search..."
 *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 500.
 *	@param {number | undefined} options.minLength minimum length to start searching, default 3
 *	@param {number | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *
 *	@param {Number} options.pageSize item per page for parcelle list paging, use -1 for no paging, default 5
 * @see {@link https://geoservices.ign.fr/documentation/geoservices/geocodage.html}
 */
export class SearchGeoportailParcelle extends SearchJSON {
    constructor(options: {
        className: string;
        apiKey: boolean | undefined;
        authentication: string | undefined;
        target: Element | string | undefined;
        label: string | undefined;
        placeholder: string | undefined;
        typing: number | undefined;
        minLength: number | undefined;
        maxItems: number | undefined;
        pageSize: number;
    });
    /** Set the input parcelle
     * @param {*} p parcel
     * 	@param {string} p.Commune
     * 	@param {string} p.CommuneAbsorbee
     * 	@param {string} p.Section
     * 	@param {string} p.Numero
     * @param {boolean} search start a search
     */
    setParcelle(p: {
        Commune: string;
        CommuneAbsorbee: string;
        Section: string;
        Numero: string;
    }, search: boolean): void;
    /** Activate parcelle inputs
     * @param {bolean} b
     */
    activateParcelle(b: boolean): void;
    /** Autocomplete function (ajax request to the server)
    * @param {string} s search string
    * @param {function} cback a callback function that takes an array of {name, feature} to display in the autocomplete field
     */
    autocomplete(s: string, cback: (...params: any[]) => any): Array<any> | false;
    /** Send an ajax request (GET)
     * @param {string} url
     * @param {function} onsuccess callback
     * @param {function} onerror callback
     */
    ajax(url: string, onsuccess: (...params: any[]) => any, onerror: (...params: any[]) => any): void;
    /**
     * @param {string} s the search string
     * @return {Object} request data (as key:value)
     * @api
     */
    requestData(s: string): any;
    /**
     * Handle server response to pass the features array to the display list
     * @param {any} response server response
     * @return {Array<any>} an array of feature
     * @api
     */
    handleResponse(response: any): any[];
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
