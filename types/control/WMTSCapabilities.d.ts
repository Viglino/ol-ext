export default ol_control_WMTSCapabilities;
/** WMTSCapabilities
 * @constructor
 * @fires load
 * @fires capabilities
 * @extends {ol_control_WMSCapabilities}
 * @param {*} options
 *  @param {string|Element} [options.target] the target to set the dialog, use document.body to have fullwindow dialog
 *  @param {string} [options.proxy] proxy to use when requesting Getcapabilites, default none (suppose the service use CORS)
 *  @param {string} [options.placeholder='service url...'] input placeholder, default 'service url...'
 *  @param {string} [options.title=WMTS] dialog title, default 'WMTS'
 *  @param {string} [options.searchLabel='search'] Label for search button, default 'search'
 *  @param {string} [options.loadLabel='load'] Label for load button, default 'load'
 *  @param {Array<string>} [options.srs] an array of supported srs, default map projection code or 'EPSG:3857'
 *  @param {number} [options.timeout=1000] Timeout for getCapabilities request, default 1000
 *  @param {boolean} [options.cors=false] Use CORS, default false
 *  @param {string} [options.optional] a list of optional url properties (when set in the request url), separated with ','
 *  @param {boolean} [options.trace=false] Log layer info, default false
 *  @param {*} [options.services] a key/url object of services for quick access in a menu
 */
declare class ol_control_WMTSCapabilities {
    constructor(options: any);
    /** Get service parser
     * @private
     */
    private _getParser;
    /** Get Capabilities request parameters
     * @param {*} options
     */
    getRequestParam(options: any): {
        SERVICE: string;
        REQUEST: string;
        VERSION: any;
    };
    /** Get tile grid options only for EPSG:3857 projection
     * @returns {*}
     * @private
     */
    private _getTG;
    /** Get WMTS tile grid (only EPSG:3857)
     * @param {sting} tileMatrixSet
     * @param {number} minZoom
     * @param {number} maxZoom
     * @returns {ol_tilegrid_WMTS}
     * @private
     */
    private getTileGrid;
    /** Return a WMTS options for the given capabilities
     * @param {*} caps layer capabilities (read from the capabilities)
     * @param {*} parent capabilities
     * @return {*} options
     */
    getOptionsFromCap(caps: any, parent: any): any;
    /** Get WMS options from control form
     * @return {*} original original options
     * @return {*} options
     * @private
     */
    private _getFormOptions;
    /** Create a new layer using options received by getOptionsFromCap method
     * @param {*} options
     */
    getLayerFromOptions(options: any): ol_layer_Tile<import("ol/source/Tile").default>;
}
import ol_layer_Tile from "ol/layer/Tile";
