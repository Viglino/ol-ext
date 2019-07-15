import { Map as _ol_Map_ } from 'ol';
import { default as ol_control_Attribution } from 'ol/control/Attribution';
import { Style } from 'ol/style';
/**
 * @classdesc
 *   OpenLayers 3 Attribution Control integrated in the canvas (for jpeg/png
 * @see http://www.kreidefossilien.de/webgis/dokumentation/beispiele/export-map-to-png-with-scale
 *
 * @constructor
 * @extends {contrAttribution}
 * @param {Object=} options extend the contrAttribution options.
 * 	@param {Style} options.style  option is usesd to draw the text.
 */
export class CanvasAttribution extends ol_control_Attribution {
    constructor(options?: {
        style: Style;
    });
    /**
     * Draw attribution on canvas
     * @param {boolean} b draw the attribution on canvas.
     */
    setCanvas(b: boolean): void;
    /**
     * Change the control style
     * @param {Style} style
     */
    setStyle(style: Style): void;
    /**
     * Remove the control from its current map and attach it to the new map.
     * Subclasses may set up event handlers to get notified about changes to
     * the map here.
     * @param {Map} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
}
