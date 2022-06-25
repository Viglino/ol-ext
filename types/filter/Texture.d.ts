export default ol_filter_Texture;
export type FilterTextureOptions = {
    /**
     * Image object for the texture
     */
    img: (new (width?: number, height?: number) => HTMLImageElement) | undefined;
    /**
     * Image source URI
     */
    src: string;
    /**
     * scale to draw the image. Default 1.
     */
    scale: number;
    opacity?: number;
    /**
     * Whether to rotate the texture with the view (may cause animation lags on mobile or slow devices). Default is true.
     */
    rotate: boolean;
    /**
     * The crossOrigin attribute for loaded images.
     */
    crossOrigin: null | string | undefined;
};
/** @typedef {Object} FilterTextureOptions
 *  @property {Image | undefined} img Image object for the texture
 *  @property {string} src Image source URI
 *  @property {number} scale scale to draw the image. Default 1.
 *  @property {number} [opacity]
 *  @property {boolean} rotate Whether to rotate the texture with the view (may cause animation lags on mobile or slow devices). Default is true.
 *  @property {null | string | undefined} crossOrigin The crossOrigin attribute for loaded images.
 */
/** Add texture effects on maps or layers
 * @constructor
 * @requires ol.filter
 * @extends {ol_filter_Base}
 * @param {FilterTextureOptions} options
 */
declare class ol_filter_Texture {
    constructor(options: any);
    /** Set texture
     * @param {FilterTextureOptions} [options]
     */
    setFilter(options?: FilterTextureOptions): void;
    /** Get translated pattern
     *	@param {number} offsetX x offset
     *	@param {number} offsetY y offset
     */
    getPattern(offsetX: number, offsetY: number): any;
    /** Draw pattern over the map on postcompose */
    postcompose(e: any): void;
}
