export default ol_interaction_DrawTouch;
/** Interaction DrawTouch : pointer is deferred to the center of the viewport and a target is drawn to materialize this point
 * The interaction modifies map browser event coordinate and pixel properties to force pointer on the viewport center to any interaction that them.
 * @constructor
 * @fires drawstart
 * @fires drawend
 * @fires drawabort
 * @extends {ol_interaction_CenterTouch}
 * @param {olx.interaction.DrawOptions} options
 *  @param {ol.source.Vector | undefined} options.source Destination source for the drawn features.
 *  @param {ol.geom.GeometryType} options.type Drawing type ('Point', 'LineString', 'Polygon') not ('MultiPoint', 'MultiLineString', 'MultiPolygon' or 'Circle'). Required.
 *	@param {boolean} [options.tap=true] enable point insertion on tap, default true
 *  @param {ol.style.Style|Array<ol.style.Style>} [options.style] Drawing style
 *  @param {ol.style.Style|Array<ol.style.Style>} [options.sketchStyle] Sketch style
 *  @param {ol.style.Style|Array<ol.style.Style>} [options.targetStyle] a style to draw the target point, default cross style
 *  @param {string} [options.composite] composite operation : difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
 */
declare class ol_interaction_DrawTouch {
    constructor(options: any);
    sketch: ol_layer_SketchOverlay;
    _source: any;
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {ol.Map} map Map.
     * @api stable
     */
    setMap(map: ol.Map): void;
    _listener: {};
    /** Set geometry type
     * @param {ol.geom.GeometryType} type
     */
    setGeometryType(type: ol.geom.GeometryType): string;
    /** Get geometry type
     * @return {ol.geom.GeometryType}
     */
    getGeometryType(): ol.geom.GeometryType;
    /** Start drawing and add the sketch feature to the target layer.
     * The ol.interaction.Draw.EventType.DRAWEND event is dispatched before inserting the feature.
     */
    finishDrawing(): void;
    /** Add a new Point to the drawing
     */
    addPoint(): void;
    /** Remove last point of the feature currently being drawn.
     */
    removeLastPoint(): void;
    /**
     * Activate or deactivate the interaction.
     * @param {boolean} active Active.
     * @observable
     * @api
     */
    setActive(b: any): void;
}
import ol_layer_SketchOverlay from "../layer/SketchOverlay";
