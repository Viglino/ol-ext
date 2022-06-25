export default ol_control_Permalink;
/**
 * Set an hyperlink that will return the user to the current map view.
 * Just add a `permalink`property to layers to be handled by the control (and added in the url).
 * The layer's permalink property is used to name the layer in the url.
 * The control must be added after all layer are inserted in the map to take them into acount.
 *
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options
 *  @param {boolean} options.urlReplace replace url or not, default true
 *  @param {boolean|string} [options.localStorage=false] save current map view in localStorage, if 'position' only store map position
 *  @param {boolean} options.geohash use geohash instead of lonlat, default false
 *  @param {integer} options.fixed number of digit in coords, default 6
 *  @param {boolean} options.anchor use "#" instead of "?" in href
 *  @param {boolean} options.visible hide the button on the map, default true
 *  @param {boolean} options.hidden hide the button on the map, default false DEPRECATED: use visible instead
 *  @param {function} options.onclick a function called when control is clicked
*/
declare class ol_control_Permalink {
    constructor(opt_options: any);
    replaceState_: boolean;
    fixed_: any;
    hash_: string;
    _localStorage: any;
    search_: {};
    /**
     * Get the initial position passed by the url
     */
    getInitialPosition(): any;
    /**
     * Set the map instance the control associated with.
     * @param {ol.Map} map The map instance.
     */
    setMap(map: ol.Map): void;
    _listener: {
        change: any;
        moveend: any;
    };
    /** Get layer given a permalink name (permalink propertie in the layer)
    *	@param {string} the permalink to search for
    *	@param {Array<ol.layer>|undefined} an array of layer to search in
    *	@return {ol.layer|false}
    */
    getLayerByLink(id: any, layers: any): ol.layer | false;
    /** Set coordinates as geohash
     * @param {boolean}
     */
    setGeohash(b: any): void;
    /** Set map position according to the current link
     * @param {boolean} [force=false] if true set the position even if urlReplace is disabled
     */
    setPosition(force?: boolean): void;
    /**
     * Get the parameters added to the url. The object can be changed to add new values.
     * @return {Object} a key value object added to the url as &key=value
     * @api stable
     */
    getUrlParams(): any;
    /**
     * Set a parameter to the url.
     * @param {string} key the key parameter
     * @param {string|undefined} value the parameter's value, if undefined or empty string remove the parameter
     * @api stable
     */
    setUrlParam(key: string, value: string | undefined): void;
    /**
     * Get a parameter url.
     * @param {string} key the key parameter
     * @return {string} the parameter's value or empty string if not set
     * @api stable
     */
    getUrlParam(key: string): string;
    /**
     * Has a parameter url.
     * @param {string} key the key parameter
     * @return {boolean}
     * @api stable
     */
    hasUrlParam(key: string): boolean;
    /** Get the permalink
     * @param {boolean|string} [search=false] false: return full link | true: return the search string only | 'position': return position string
     * @return {permalink}
     */
    getLink(search?: boolean | string): permalink;
    /** Check if urlreplace is on
     * @return {boolean}
     */
    getUrlReplace(): boolean;
    /** Enable / disable url replacement (replaceSate)
     *	@param {bool}
     */
    setUrlReplace(replace: any): void;
    /**
     * On view change refresh link
     * @param {ol.event} The map instance.
     * @private
     */
    private viewChange_;
    /**
     * Layer change refresh link
     * @private
     */
    private layerChange_;
    _tout: any;
}
