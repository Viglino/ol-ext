import { Map as _ol_Map_ } from 'ol';
import { Stroke, Image } from 'ol/style';
import { CanvasBase } from './CanvasBase';
/**
 * Draw a compass on the map. The position/Size of the control is defined in the css.
 *
 * @constructor
 * @extends {contrCanvasBase}
 * @param {Object=} options Control options. The style {Stroke} option is usesd to draw the text.
 *  @param {string} options.className class name for the control
 *  @param {Image} options.image an image, default use the src option or a default image
 *  @param {string} options.src image src, default use the image option or a default image
 *  @param {boolean} options.rotateVithView rotate vith view (false to show watermark), default true
 *  @param {style.Stroke} options.style style to draw the lines, default draw no lines
 */
export class Compass extends CanvasBase {
    constructor(options?: {
        className: string;
        image: Image;
        src: string;
        rotateVithView: boolean;
        style: Stroke;
    });
    /**
     * Remove the control from its current map and attach it to the new map.
     * Subclasses may set up event handlers to get notified about changes to
     * the map here.
     * @param {_ol_Map_} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
    /** Get canvas overlay
     */
    getCanvas(): void;
    /** Set Style
     * @api
     */
    setStyle(): void;
    /** Get style
     * @api
     */
    getStyle(): void;
    /** Get stroke
     * @api
     */
    getStroke(): void;
    /** Get fill
     * @api
     */
    getFill(): void;
    /** Get stroke
     * @api
     */
    getTextStroke(): void;
    /** Get text fill
     * @api
     */
    getTextFill(): void;
    /** Get text font
     * @api
     */
    getTextFont(): void;
}
