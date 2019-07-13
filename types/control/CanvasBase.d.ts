import { Map as _ol_Map_ } from 'ol';
import ol_control_Control from 'ol/control/Control';
import { Style } from 'ol/style';
/** A control is a visible widget with a DOM element in a fixed position on the screen.
 * They can involve user input (buttons), or be informational only;
 * the position is determined using CSS. B
 * y default these are placed in the container with CSS class name ol-overlaycontainer-stopevent,
 * but can use any outside DOM element.
 * @namespace control
 * @see {@link https://openlayers.org/en/master/apidoc/module-ol_contrhtml}
 */
/** Openlayers base class for controls.
 * A control is a visible widget with a DOM element in a fixed position on the screen.
 * They can involve user input (buttons), or be informational only; the position is determined using CSS.
 * @namespace ol_control_Control
 * @see {@link http://openlayers.org/en/latest/apidoc/module-ol_control_Contrhtml}
 */
/**
 * @classdesc
 *   Attribution Control integrated in the canvas (for jpeg/png
 * @see http://www.kreidefossilien.de/webgis/dokumentation/beispiele/export-map-to-png-with-scale
 *
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options extend the control options.
 *  @param {Style} options.style style used to draw the title.
 */
export class CanvasBase extends ol_control_Control {
    constructor(options?: {
        style: Style;
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
    setStyle(style: Style): void;
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
