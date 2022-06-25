export default ol_control_Compass;
/**
 * Draw a compass on the map. The position/size of the control is defined in the css.
 *
 * @constructor
 * @extends {ol_control_CanvasBase}
 * @param {Object=} options Control options. The style {_ol_style_Stroke_} option is usesd to draw the text.
 *  @param {string} options.className class name for the control
 *  @param {boolean} [options.visible=true]
 *  @param {Image} options.image an image, default use the src option or a default image
 *  @param {string} options.src image src or 'default' or 'compact', default use the image option or a default image
 *  @param {boolean} options.rotateVithView rotate vith view (false to show watermark), default true
 *  @param {ol_style_Stroke} options.style style to draw the lines, default draw no lines
 */
declare class ol_control_Compass {
    constructor(options: any);
    /** Set compass image
     * @param {Image|string} [img=default] the image or an url or 'compact' or 'default'
     */
    setImage(img?: (new (width?: number, height?: number) => HTMLImageElement) | string): void;
    img_: HTMLCanvasElement | HTMLImageElement | ((string | (new (width?: number, height?: number) => HTMLImageElement)) & HTMLImageElement);
    /** Create a default image.
     * @param {number} s the size of the compass
     * @private
     */
    private compactCompass_;
    /** Create a default image.
     * @param {number} s the size of the compass
     * @private
     */
    private defaultCompass_;
    /** Get control visibility
     * @return {boolean}
     */
    getVisible(): boolean;
    /** Set visibility
     * @param {boolean} b
     */
    setVisible(b: boolean): void;
    /** Draw compass
    * @param {ol.event} e postcompose event
    * @private
    */
    private _draw;
}
