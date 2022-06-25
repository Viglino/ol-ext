export default ol_filter_Colorize;
export type FilterColorizeOptions = {
    /**
     * style to fill with
     */
    color: ol.Color;
    /**
     * 'enhance' or a CanvasRenderingContext2D.globalCompositeOperation
     */
    operation: string;
    /**
     * a value to modify the effect value [0-1]
     */
    value: number;
    /**
     * mask inner, default false
     */
    inner: boolean;
    /**
     * preserve alpha channel, default false
     */
    preserveAlpha: boolean;
};
/** @typedef {Object} FilterColorizeOptions
 * @property {ol.Color} color style to fill with
 * @property {string} operation 'enhance' or a CanvasRenderingContext2D.globalCompositeOperation
 * @property {number} value a value to modify the effect value [0-1]
 * @property {boolean} inner mask inner, default false
 * @property {boolean} preserveAlpha preserve alpha channel, default false
 */
/** Colorize map or layer
 * @constructor
 * @requires ol.filter
 * @extends {ol_filter_Base}
 * @author Thomas Tilak https://github.com/thhomas
 * @author Jean-Marc Viglino https://github.com/viglino
 * @param {FilterColorizeOptions} options
 */
declare class ol_filter_Colorize {
    constructor(options: any);
    /** Set options to the filter
     * @param {FilterColorizeOptions} [options]
     */
    setFilter(options?: FilterColorizeOptions): void;
    /** Set the filter value
     * @param {ol.Color} options.color style to fill with
     */
    setValue(v: any): void;
    /** Set the color value
     * @param {number} options.value a [0-1] value to modify the effect value
     */
    setColor(c: any): void;
    /** @private
     */
    private precompose;
    /** @private
     */
    private postcompose;
}
