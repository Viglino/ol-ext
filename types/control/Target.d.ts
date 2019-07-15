import { Map as _ol_Map_ } from 'ol';
import { Style } from 'ol/style';
import { CanvasBase } from './CanvasBase';
/** contrTarget draw a target at the center of the map.
 * @constructor
 * @extends {contrCanvasBase}
 * @param {Object} options
 *  @param {Style|Array<Style>} options.style
 *  @param {string} options.composite composite operation = difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
 */
export class Target extends CanvasBase {
    constructor(options: {
        style: Style | Style[];
        composite: string;
    });
    /** Set the control visibility
     * @paraam {boolean} b
     */
    setVisible(): void;
    /** Get the control visibility
     * @return {boolean} b
     */
    getVisible(): boolean;
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
