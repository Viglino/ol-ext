import { Map as _ol_Map_ } from 'ol';
import ol_control_Control from 'ol/control/Control';
/**
 * Scale Contr
 * A control to display the scale of the center on the map
 *
 * @constructor
 * @extends {contrControl}
 * @fires select
 * @fires change:input
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {string} options.ppi screen ppi, default 96
 * 	@param {string} options.editable make the control editable, default true
 */
export class Scale extends ol_control_Control {
    constructor(options?: {
        className: string;
        ppi: string;
        editable: string;
    });
    /**
     * Remove the control from its current map and attach it to the new map.
     * Subclasses may set up event handlers to get notified about changes to
     * the map here.
     * @param {Map} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
    /** Display the scale
     */
    _showScale(): void;
    /** Format the scale 1/d
     * @param {Number} d
     * @return {string} formated string
     */
    formatScale(d: number): string;
    /** Set the current scale (will change the scale of the map)
     * @param {Number} value the scale factor
     */
    setScale(value: number): void;
}
