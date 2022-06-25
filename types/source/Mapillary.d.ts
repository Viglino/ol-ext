export default ol_source_Mapillary;
/**
* @constructor ol_source_Mapillary
* @extends {ol_source_Vector}
* @param {olx.source.Mapillary=} options
*/
declare class ol_source_Mapillary {
    constructor(opt_options: any);
    /** Max resolution to load features  */
    _maxResolution: any;
    /** Query limit */
    _limit: any;
    /** Decode wiki attributes and choose to add feature to the layer
    * @param {feature} the feature
    * @param {attributes} wiki attributes
    * @return {boolean} true: add the feature to the layer
    * @API stable
    */
    readFeature(): boolean;
    /** Loader function used to load features.
    * @private
    */
    private _loaderFn;
}
