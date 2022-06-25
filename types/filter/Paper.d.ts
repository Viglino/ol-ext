export default ol_filter_Paper;
export type FilterPointillismOptions = {
    /**
     * saturation, default 2
     */
    saturate: number;
};
/** @typedef {Object} FilterPointillismOptions
 * @property {number} saturate saturation, default 2
 */
/** A pointillism filter to turn maps into pointillism paintings
 * @constructor
 * @extends {ol_filter_Base}
 * @param {object} options
 *  @param {boolean} [options.active]
 *  @param {number} [options.scale=1]
 */
declare class ol_filter_Paper {
    constructor(options: any);
    _svgfilter: ol_ext_SVGFilter_Paper;
    /** @private
     */
    private precompose;
    /** @private
     */
    private postcompose;
    /** Set filter light
     * @param {number} light light option. 0: darker, 100: lighter
     */
    setLight(light: number): void;
}
import ol_ext_SVGFilter_Paper from "../util/SVGFilter/Paper";
