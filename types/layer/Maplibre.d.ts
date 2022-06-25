export default ol_layer_Maplibre;
/** Layer that use Maplibre GL as render
 * @constructor
 * @extends {ol_layer_Layer}
 * @param {any} options layer options
 *  @param {string} options.layer Geoportail layer name
 *  @param {string} options.gppKey Geoportail API key
 *  @param {olx.source.WMTSOptions=} tileoptions WMTS options if not defined default are used
 */
declare class ol_layer_Maplibre {
    constructor(options: any);
    /** Get the Maplibre map
     * @return {Object}
     */
    getMapGL(): any;
    /** Set style
     * @param {Object|string} style Mapbox style Object or a URL to JSON
     */
    setStyle(style: any | string): void;
    /** Returns the map's Mapbox style object.
     * @returns {Object}
     */
    getStyle(): any;
    /** Create the map libre map
     * @param {Object|string} style Mapbox style Object or a URL to JSON
     * @private
     */
    private _create;
    _container: any;
    glMap: any;
}
