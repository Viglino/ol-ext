export default ol_source_DBPedia;
export var ol_style_clearDBPediaStyleCache: any;
export var ol_style_dbPediaStyleFunction: any;
/**
* @constructor ol_source_DBPedia
* @extends {ol.source.Vector}
* @param {olx.source.DBPedia=} opt_options
*/
declare class ol_source_DBPedia {
    constructor(opt_options: any);
    /** Url for DBPedia SPARQL */
    _url: any;
    /** Max resolution to load features  */
    _maxResolution: any;
    /** Result language */
    _lang: any;
    /** Query limit */
    _limit: any;
    /** Decode RDF attributes and choose to add feature to the layer
    * @param {feature} the feature
    * @param {attributes} RDF attributes
    * @param {lastfeature} last feature added (null if none)
    * @return {boolean} true: add the feature to the layer
    * @API stable
    */
    readFeature(feature: any, attributes: any, lastfeature: any): boolean;
    /** Set RDF query subject, default: select label, thumbnail, abstract and type
    * @API stable
    */
    querySubject(): string;
    /** Set RDF query filter, default: select language
    * @API stable
    */
    queryFilter(): string;
    /** Loader function used to load features.
    * @private
    */
    private _loaderFn;
}
