export default ol_control_CanvasAttribution;
/**
 * @classdesc
 *   OpenLayers 3 Attribution Control integrated in the canvas (for jpeg/png export purposes).
 * @see http://www.kreidefossilien.de/webgis/dokumentation/beispiele/export-map-to-png-with-scale
 *
 * @constructor
 * @extends ol_control_Attribution
 * @param {Object=} options extend the ol_control_Attribution options.
 * 	@param {ol_style_Style} options.style  option is usesd to draw the text.
 *  @paream {boolean} [options.canvas=false] draw on canvas
 */
declare class ol_control_CanvasAttribution {
    constructor(options: any);
    /**
     * Draw attribution on canvas
     * @param {boolean} b draw the attribution on canvas.
     */
    setCanvas(b: boolean): void;
    isCanvas_: boolean;
    /**
     * Change the control style
     * @param {ol_style_Style} style
     */
    setStyle(style: ol_style_Style): void;
    font_: string;
    fontStrokeStyle_: string;
    fontFillStyle_: string;
    fontStrokeWidth_: number;
    /**
     * Remove the control from its current map and attach it to the new map.
     * Subclasses may set up event handlers to get notified about changes to
     * the map here.
     * @param {ol.Map} map Map.
     * @api stable
     */
    setMap(map: ol.Map): void;
    _listener: any;
    /**
     * Draw attribution in the final canvas
     * @private
     */
    private drawAttribution_;
    /** Get map Canvas
     * @private
     */
    private getContext;
}
import ol_style_Style from "ol/style/Style";
