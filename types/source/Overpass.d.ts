export default ol_source_Overpass;
/**
 * OSM layer using the Ovepass API
 * @constructor ol_source_Overpass
 * @extends {ol.source.Vector}
 * @param {any} options
 *  @param {string} options.url service url, default: https://overpass-api.de/api/interpreter
 *  @param {Array<string>} options.filter an array of tag filters, ie. ["key", "key=value", "key~value", ...]
 *  @param {boolean} options.node get nodes, default: true
 *  @param {boolean} options.way get ways, default: true
 *  @param {boolean} options.rel get relations, default: false
 *  @param {number} options.maxResolution maximum resolution to load features
 *  @param {string|ol.Attribution|Array<string>} options.attributions source attribution, default OSM attribution
 *  @param {ol.loadingstrategy} options.strategy loading strategy, default ol.loadingstrategy.bbox
 */
declare class ol_source_Overpass {
    constructor(options: any);
    /** Ovepass API Url */
    _url: any;
    /** Max resolution to load features  */
    _maxResolution: any;
    _types: {
        node: boolean;
        way: boolean;
        rel: boolean;
    };
    _filter: any;
    /** Loader function used to load features.
    * @private
    */
    private _loaderFn;
    /**
     * Search if feature is allready loaded
     * @param {ol.Feature} feature
     * @return {boolean}
     * @private
     */
    private hasFeature;
}
