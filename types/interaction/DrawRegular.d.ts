export default ol_interaction_DrawRegular;
/** Interaction rotate
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @fires drawstart, drawing, drawend, drawcancel
 * @param {olx.interaction.TransformOptions} options
 *  @param {Array<ol.Layer>} options.source Destination source for the drawn features
 *  @param {ol.Collection<ol.Feature>} options.features Destination collection for the drawn features
 *  @param {ol.style.Style | Array.<ol.style.Style> | ol.style.StyleFunction | undefined} options.style style for the sketch
 *  @param {integer} options.sides number of sides, default 0 = circle
 *  @param { ol.events.ConditionType | undefined } options.condition A function that takes an ol.MapBrowserEvent and returns a boolean that event should be handled. By default module:ol/events/condition.always.
 *  @param { ol.events.ConditionType | undefined } options.squareCondition A function that takes an ol.MapBrowserEvent and returns a boolean to draw square features. Default test shift key
 *  @param { ol.events.ConditionType | undefined } options.centerCondition A function that takes an ol.MapBrowserEvent and returns a boolean to draw centered features. Default check Ctrl key
 *  @param { bool } options.canRotate Allow rotation when centered + square, default: true
 *  @param { string } [options.geometryName=geometry]
 *  @param { number } options.clickTolerance click tolerance on touch devices, default: 6
 *  @param { number } options.maxCircleCoordinates Maximum number of point on a circle, default: 100
 */
declare class ol_interaction_DrawRegular {
    constructor(options: any);
    squaredClickTolerance_: number;
    maxCircleCoordinates_: any;
    features_: any;
    source_: any;
    conditionFn_: any;
    squareFn_: any;
    centeredFn_: any;
    canRotate_: boolean;
    geometryName_: any;
    sketch_: ol_Collection<any>;
    overlayLayer_: ol_layer_Vector<ol_source_Vector<import("ol/geom/Geometry").default>>;
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {ol.Map} map Map.
     * @api stable
     */
    setMap(map: ol.Map): void;
    /**
     * Activate/deactivate the interaction
     * @param {boolean}
     * @api stable
     */
    setActive(b: any): void;
    /**
     * Reset the interaction
     * @api stable
     */
    reset(): void;
    started_: boolean;
    /**
     * Set the number of sides.
     * @param {int} number of sides.
     * @api stable
     */
    setSides(nb: any): void;
    sides_: any;
    /**
     * Allow rotation when centered + square
     * @param {bool}
     * @api stable
     */
    canRotate(b: any): boolean;
    /**
     * Get the number of sides.
     * @return {int} number of sides.
     * @api stable
     */
    getSides(): int;
    /** Get geom of the current drawing
    * @return {ol.geom.Polygon | ol.geom.Point}
    */
    getGeom_(): ol.geom.Polygon | ol.geom.Point;
    /** Draw sketch
    * @return {ol.Feature} The feature being drawn.
    */
    drawSketch_(evt: any): ol.Feature;
    square_: any;
    centered_: any;
    /** Draw sketch (Point)
    */
    drawPoint_(pt: any, noclear: any): void;
    /**
     * @param {ol.MapBrowserEvent} evt Map browser event.
     */
    handleEvent_(evt: ol.MapBrowserEvent): boolean;
    _eventTime: Date;
    downPx_: any;
    _longTouch: boolean;
    upPx_: any;
    lastEvent: any;
    /** Stop drawing.
     */
    finishDrawing(): void;
    /**
     * @param {ol.MapBrowserEvent} evt Event.
     */
    handleMoveEvent_(evt: ol.MapBrowserEvent): void;
    coord_: any;
    coordPx_: any;
    /** Start an new draw
     * @param {ol.MapBrowserEvent} evt Map browser event.
     * @return {boolean} `false` to stop the drag sequence.
     */
    start_(evt: ol.MapBrowserEvent): boolean;
    center_: any;
    feature_: ol_Feature<import("ol/geom/Geometry").default>;
    /** End drawing
     * @param {ol.MapBrowserEvent} evt Map browser event.
     * @return {boolean} `false` to stop the drag sequence.
     */
    end_(evt: ol.MapBrowserEvent): boolean;
    /** Default start angle array for each sides
    */
    startAngle: {
        default: number;
        3: number;
        4: number;
    };
}
import ol_Collection from "ol/Collection";
import ol_source_Vector from "ol/source/Vector";
import ol_layer_Vector from "ol/layer/Vector";
import ol_Feature from "ol/Feature";
