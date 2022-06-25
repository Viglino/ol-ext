export default ol_source_WikiCommons;
/**
* @constructor ol_source_WikiCommons
* @extends {ol_source_Vector}
* @param {olx.source.WikiCommons=} options
*/
declare class ol_source_WikiCommons {
    constructor(opt_options: any);
    /** Max resolution to load features  */
    _maxResolution: any;
    /** Result language */
    _lang: any;
    /** Query limit */
    _limit: any;
    /** Decode wiki attributes and choose to add feature to the layer
    * @param {feature} the feature
    * @param {attributes} wiki attributes
    * @return {boolean} true: add the feature to the layer
    * @API stable
    */
    readFeature(feature: any, attributes: any): boolean;
    /** Loader function used to load features.
    * @private
    */
    private _loaderFn;
}
