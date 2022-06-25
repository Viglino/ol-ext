export default ol_filter_Pointillism;
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
 * @param {FilterPointillismOptions} options
 */
declare class ol_filter_Pointillism {
    constructor(options: any);
    pixels: any[];
    /** Create points to place on the map
     * @private
     */
    private _getPixels;
    /** @private
     */
    private precompose;
    /** @private
     */
    private postcompose;
}
