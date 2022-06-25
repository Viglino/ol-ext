export default ol_source_IDW;
/** Inverse distance weighting interpolated source - Shepard's method
 * @see https://en.wikipedia.org/wiki/Inverse_distance_weighting
 * @constructor
 * @extends {ol_source_ImageCanvas}
 * @param {*} [options]
 *  @param {ol.source.vector} options.source a source to interpolate
 *  @param {number} [options.scale=4] scale factor, use large factor to enhance performances (but minor accuracy)
 *  @param {string|function} options.weight The feature attribute to use for the weight or a function that returns a weight from a feature. Weight values should range from 0 to 100. Default use the weight attribute of the feature.
 */
declare class ol_source_IDW {
    constructor(options: any);
    _source: any;
    _canvas: HTMLElement;
    _weight: any;
    /** Get the source
     */
    getSource(): any;
    /** Convert hue to rgb factor
     * @param {number} h
     * @return {number}
     * @private
     */
    private hue2rgb;
    /** Get color for a value. Return an array of RGBA values.
     * @param {number} v value
     * @returns {Array<number>}
     * @api
     */
    getColor(v: number): Array<number>;
    /** Apply the value to the map RGB. Overwrite this function to set your own colors.
     * @param {number} v value
     * @param {Uint8ClampedArray} data RGBA array
     * @param {number} i index in the RGBA array
     * @api
     */
    setData(v: number, data: Uint8ClampedArray, i: number): void;
    /** Get image value at coord (RGBA)
     * @param {l.coordinate} coord
     * @return {Uint8ClampedArray}
     */
    getValue(coord: l.coordinate): Uint8ClampedArray;
    /** Calculate IDW at extent / resolution
     * @param {ol/extent/Extent} extent
     * @param {number} resolution
     * @param {number} pixelRatio
     * @param {ol/size/Size} size
     * @return {HTMLCanvasElement}
     * @private
     */
    private calculateImage;
    transform: (xy: any, v: any) => any[];
}
