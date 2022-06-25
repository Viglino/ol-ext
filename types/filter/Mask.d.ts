export default ol_filter_Mask;
/** Mask drawing using an ol.Feature
 * @constructor
 * @requires ol_filter
 * @extends {ol_filter_Base}
 * @param {Object} [options]
 *  @param {ol.Feature} [options.feature] feature to mask with
 *  @param {ol.style.Fill} [options.fill] style to fill with
 *  @param {boolean} [options.inner=false] mask inner, default false
 *  @param {boolean} [options.wrapX=false] wrap around the world, default false
 */
declare class ol_filter_Mask {
    constructor(options: any);
    feature_: any;
    fillColor_: string;
    /** Draw the feature into canvas */
    drawFeaturePath_(e: any, out: any): void;
    postcompose(e: any): void;
}
