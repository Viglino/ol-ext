export default ol_style_Photo;
/**
 * @classdesc
 * Set Photo style for vector features.
 *
 * @constructor
 * @param {} options
 *  @param { default | square | circle | anchored | folio } options.kind
 *  @param {boolean} options.crop crop within square, default is false
 *  @param {Number} options.radius symbol size
 *  @param {boolean} options.shadow drop a shadow
 *  @param {ol_style_Stroke} options.stroke
 *  @param {String} options.src image src
 *  @param {String} options.crossOrigin The crossOrigin attribute for loaded images. Note that you must provide a crossOrigin value if you want to access pixel data with the Canvas renderer.
 *  @param {Number} options.offsetX Horizontal offset in pixels. Default is 0.
 *  @param {Number} options.offsetY Vertical offset in pixels. Default is 0.
 *  @param {function} options.onload callback when image is loaded (to redraw the layer)
 * @extends {ol_style_RegularShape}
 * @implements {ol.structs.IHasChecksum}
 * @api
 */
declare class ol_style_Photo implements ol.structs.IHasChecksum {
    constructor(options: any);
    sanchor_: number;
    _shadow: number;
    hitDetectionCanvas_: HTMLCanvasElement;
    getHitDetectionImage: () => HTMLCanvasElement;
    _stroke: any;
    _fill: any;
    _crop: any;
    _crossOrigin: any;
    _kind: any;
    _radius: any;
    _src: any;
    _offset: any[];
    _onload: any;
    /** Set photo offset
     * @param {ol.pixel} offset
     */
    setOffset(offset: ol.pixel): void;
    /**
     * Clones the style.
     * @return {ol_style_Photo}
     */
    clone(): ol_style_Photo;
    /**
     * Draw the form without the image
     * @private
     */
    private drawBack_;
    /**
     * @private
     */
    private renderPhoto_;
    img_: HTMLImageElement;
    /**
     * Draw an timage when loaded
     * @private
     */
    private drawImage_;
}
