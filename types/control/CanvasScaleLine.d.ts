export default ol_control_CanvasScaleLine;
/**
 * @classdesc
 *    OpenLayers Scale Line Control integrated in the canvas (for jpeg/png export purposes).
 * @see http://www.kreidefossilien.de/webgis/dokumentation/beispiele/export-map-to-png-with-scale
 *
 * @constructor
 * @extends {ol_control_ScaleLine}
 * @param {Object=} options extend the ol_control_ScaleLine options.
 * 	@param {ol_style_Style} options.style used to draw the scale line (default is black/white, 10px Arial).
 */
declare class ol_control_CanvasScaleLine {
    constructor(options: any);
    scaleHeight_: number;
    /**
     * Remove the control from its current map and attach it to the new map.
     * Subclasses may set up event handlers to get notified about changes to
     * the map here.
     * @param {ol_Map} map Map.
     * @api stable
     */
    setMap(map: ol_Map): void;
    _listener: any;
    olscale: any;
    /**
     * Change the control style
     * @param {ol_style_Style} style
     */
    setStyle(style: ol_style_Style): void;
    strokeStyle_: string;
    strokeWidth_: number;
    fillStyle_: string;
    font_: string;
    fontStrokeStyle_: string;
    fontStrokeWidth_: number;
    fontFillStyle_: string;
    /**
     * Draw attribution in the final canvas
     * @param {ol_render_Event} e
     * @private
     */
    private drawScale_;
    /** Get map Canvas
     * @private
     */
    private getContext;
}
import ol_style_Style from "ol/style/Style";
