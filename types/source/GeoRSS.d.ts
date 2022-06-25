export default ol_source_GeoRSS;
/** ol_source_GeoRSS is a source that load Wikimedia Commons content in a vector layer.
 * @constructor
 * @extends {ol_source_Vector}
 * @param {*} options source options
 *  @param {string} options.url GeoRSS feed url
 */
declare class ol_source_GeoRSS {
    constructor(options: any);
    /** Loader function used to load features.
    * @private
    */
    private _loaderFn;
}
