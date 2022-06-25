export default ol_control_CanvasBase;
/**
 * @classdesc
 *   Attribution Control integrated in the canvas (for jpeg/png export purposes).
 * @see http://www.kreidefossilien.de/webgis/dokumentation/beispiele/export-map-to-png-with-scale
 *
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options extend the ol.control options.
 *  @param {ol_style_Style} options.style style used to draw the title.
 */
declare class ol_control_CanvasBase {
    constructor(options: any);
    /**
     * Remove the control from its current map and attach it to the new map.
     * Subclasses may set up event handlers to get notified about changes to
     * the map here.
     * @param {ol_Map} map Map.
     * @api stable
     */
    setMap(map: ol_Map): void;
    _listener: any;
    /** Get canvas overlay
     */
    getCanvas(map: any): any;
    /** Get map Canvas
     * @private
     */
    private getContext;
    /** Set Style
     * @api
     */
    setStyle(style: any): void;
    _style: any;
    /** Get style
     * @api
     */
    getStyle(): any;
    /** Get stroke
     * @api
     */
    getStroke(): any;
    /** Get fill
     * @api
     */
    getFill(): any;
    /** Get stroke
     * @api
     */
    getTextStroke(): any;
    /** Get text fill
     * @api
     */
    getTextFill(): any;
    /** Get text font
     * @api
     */
    getTextFont(): any;
    /** Draw the control on canvas
     * @protected
     */
    protected _draw(): void;
}
