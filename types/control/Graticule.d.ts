import { Map as _ol_Map_ } from 'ol';
import { CanvasBase } from './CanvasBase';
/**
 * Draw a graticule on the map.
 *
 * @constructor
 * @extends {contrCanvasBase}
 * @param {Object=} _ol_control_ options.
 *  @param {projectionLike} options.projection projection to use for the graticule, default EPSG:4326
 *  @param {number} options.maxResolution max resolution to display the graticule
 *  @param {Style} options.style Style to use for drawing the graticule, default black.
 *  @param {number} options.step step beetween lines (in proj units), default 1
 *  @param {number} options.stepCoord show a coord every stepCoord, default 1
 *  @param {number} options.spacing spacing beetween lines (in px), default 40px
 *  @param {number} options.borderWidthwidth of the border (in px), default 5px
 *  @param {number} options.marginmargin of the border (in px), default 0px
 */
export class Graticule extends CanvasBase {
    constructor(_ol_control_?: any);
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
