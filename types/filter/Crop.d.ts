export default ol_filter_Crop;
/** Crop drawing using an ol.Feature
* @constructor
* @requires ol.filter
* @requires ol_filter_Mask
* @extends {ol_filter_Mask}
* @param {Object} [options]
*  @param {ol.Feature} [options.feature] feature to crop with
*  @param {boolean} [options.inner=false] mask inner, default false
*/
declare class ol_filter_Crop {
    constructor(options: any);
    precompose(e: any): void;
    postcompose(e: any): void;
}
