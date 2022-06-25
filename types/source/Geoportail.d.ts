export default ol_source_Geoportail;
/** IGN's Geoportail WMTS source
 * @constructor
 * @extends {ol.source.WMTS}
 * @param {olx.source.Geoportail=} options WMTS options
 *  @param {string=} options.layer Geoportail layer name
 *  @param {number} options.minZoom
 *  @param {number} options.maxZoom
 *  @param {string} options.server
 *  @param {string} options.gppKey api key, default 'choisirgeoportail'
 *  @param {string} options.authentication basic authentication associated with the gppKey as btoa("login:pwd")
 *  @param {string} options.format image format, default 'image/jpeg'
 *  @param {string} options.style layer style, default 'normal'
 *  @param {string} options.crossOrigin default 'anonymous'
 *  @param {string} options.wrapX default true
 */
declare class ol_source_Geoportail {
    /** Get a tile load function to load tiles with basic authentication
     * @param {string} authentication as btoa("login:pwd")
     * @param {string} format mime type
     * @return {function} tile load function to load tiles with basic authentication
     */
    static tileLoadFunctionWithAuthentication(authentication: string, format: string): Function;
    constructor(layer: any, options: any);
    _server: any;
    _gppKey: any;
    /** Get service URL according to server url or standard url
    */
    serviceURL(): any;
    /**
     * Return the associated API key of the Map.
     * @function
     * @return the API key.
     * @api stable
     */
    getGPPKey(): any;
    /**
     * Set the associated API key to the Map.
     * @param {String} key the API key.
     * @param {String} authentication as btoa("login:pwd")
     * @api stable
     */
    setGPPKey(key: string, authentication: string): void;
    /** Return the GetFeatureInfo URL for the passed coordinate, resolution, and
     * projection. Return `undefined` if the GetFeatureInfo URL cannot be
     * constructed.
     * @param {ol.Coordinate} coord
     * @param {Number} resolution
     * @param {ol.proj.Projection} projection default the source projection
     * @param {Object} options
     *  @param {string} options.INFO_FORMAT response format text/plain, text/html, application/json, default text/plain
     * @return {String|undefined} GetFeatureInfo URL.
     */
    getFeatureInfoUrl(coord: ol.Coordinate, resolution: number, projection: ol.proj.Projection, options: {
        INFO_FORMAT: string;
    }): string | undefined;
    /** Get feature info
     * @param {ol.Coordinate} coord
     * @param {Number} resolution
     * @param {ol.proj.Projection} projection default the source projection
     * @param {Object} options
     *  @param {string} options.INFO_FORMAT response format text/plain, text/html, application/json, default text/plain
     *  @param {function} options.callback a function that take the response as parameter
     *  @param {function} options.error function called when an error occurred
     */
    getFeatureInfo(coord: ol.Coordinate, resolution: number, options: {
        INFO_FORMAT: string;
        callback: Function;
        error: Function;
    }): void;
    /** Standard IGN-GEOPORTAIL attribution
    */
    attribution: string;
}
