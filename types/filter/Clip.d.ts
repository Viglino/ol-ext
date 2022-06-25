export default ol_filter_Clip;
/** Clip layer or map
*  @constructor
* @requires ol.filter
* @extends {ol_filter_Base}
* @param {Object} [options]
*  @param {Array<ol.Coordinate>} [options.coords]
*  @param {ol.Extent} [options.extent]
*  @param {string} [options.units] coords units percent (%) or pixel (px)
*  @param {boolean} [options.keepAspectRatio] keep aspect ratio
*  @param {string} [options.color] backgroundcolor
*/
declare class ol_filter_Clip {
    constructor(options: any);
    clipPath_(e: any): void;
    /**
     * @private
     */
    private precompose;
    /**
     * @private
     */
    private postcompose;
}
