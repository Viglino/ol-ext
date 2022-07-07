export default ol_control_SearchGeoportailParcelle;
/**
 * Search places using the French National Base Address (BAN) API.
 *
 * @constructor
 * @extends {ol.control.SearchJSON}
 * @fires select
 * @param {any} options extend ol.control.SearchJSON options
 *	@param {string} options.className control class name
 *	@param {boolean | undefined} [options.apiKey] the service api key.
 *	@param {string | undefined} options.authentication: basic authentication for the service API as btoa("login:pwd")
 *	@param {Element | string | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *	@param {string | undefined} options.label Text label to use for the search button, default "search"
 *	@param {string | undefined} options.placeholder placeholder, default "Search..."
 *	@param {number | undefined} options.typing a delay on each typing to start searching (ms), default 500.
 *	@param {integer | undefined} options.minLength minimum length to start searching, default 3
 *	@param {integer | undefined} options.maxItems maximum number of items to display in the autocomplete list, default 10
 *
 *	@param {Number} options.pageSize item per page for parcelle list paging, use -1 for no paging, default 5
 * @see {@link https://geoservices.ign.fr/documentation/geoservices/geocodage.html}
 */
declare class ol_control_SearchGeoportailParcelle {
    constructor(options: any);
    _inputParcelle: {
        prefix: HTMLElement;
        section: HTMLElement;
        numero: HTMLElement;
    };
    /** Select a commune => start searching parcelle
     * @param {any} e
     * @private
     */
    private selectCommune;
    _commune: any;
    /** Set the input parcelle
     * @param {*} p parcel
     * 	@param {string} p.Commune
     * 	@param {string} p.CommuneAbsorbee
     * 	@param {string} p.Section
     * 	@param {string} p.Numero
     * @param {boolean} search start a search
     */
    setParcelle(p: any, search: boolean): void;
    /** Activate parcelle inputs
     * @param {bolean} b
     */
    activateParcelle(b: bolean): void;
    /** Send search request for the parcelle
     * @private
     */
    private autocompleteParcelle;
    /** Send search request for a parcelle number
     * @param {string} search search parcelle number
     * @param {function} success callback function called on success
     * @param {function} error callback function called on error
     */
    searchParcelle(search: string, success: Function): void;
    /**
     * Draw the autocomplete list
     * @param {*} resp
     * @private
     */
    private _listParcelle;
    _listParc: any[];
    /**
     * Handle parcelle section
     * @param {*} parc
     * @private
     */
    private _handleParcelle;
}
