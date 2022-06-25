export default ol_interaction_ModifyFeature;
/** Interaction for modifying feature geometries. Similar to the core ol/interaction/Modify.
 * The interaction is more suitable to use to handle feature modification: only features concerned
 * by the modification are passed to the events (instead of all feature with ol/interaction/Modify)
 * - the modifystart event is fired before the feature is modified (no points still inserted)
 * - the modifyend event is fired after the modification
 * - it fires a modifying event
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @fires modifystart
 * @fires modifying
 * @fires modifyend
 * @fires select
 * @param {*} options
 *	@param {ol.source.Vector} options.source a source to modify (configured with useSpatialIndex set to true)
 *	@param {ol.source.Vector|Array<ol.source.Vector>} options.sources a list of source to modify (configured with useSpatialIndex set to true)
 *  @param {ol.Collection.<ol.Feature>} options.features collection of feature to modify
 *  @param {integer} options.pixelTolerance Pixel tolerance for considering the pointer close enough to a segment or vertex for editing. Default is 10.
 *  @param {function|undefined} options.filter a filter that takes a feature and return true if it can be modified, default always true.
 *  @param {ol.style.Style | Array<ol.style.Style> | undefined} options.style Style for the sketch features.
 *  @param {ol.EventsConditionType | undefined} options.condition A function that takes an ol.MapBrowserEvent and returns a boolean to indicate whether that event will be considered to add or move a vertex to the sketch. Default is ol.events.condition.primaryAction.
 *  @param {ol.EventsConditionType | undefined} options.deleteCondition A function that takes an ol.MapBrowserEvent and returns a boolean to indicate whether that event should be handled. By default, ol.events.condition.singleClick with ol.events.condition.altKeyOnly results in a vertex deletion.
 *  @param {ol.EventsConditionType | undefined} options.insertVertexCondition A function that takes an ol.MapBrowserEvent and returns a boolean to indicate whether a new vertex can be added to the sketch features. Default is ol.events.condition.always
 *  @param {boolean} options.wrapX Wrap the world horizontally on the sketch overlay, default false
 */
declare class ol_interaction_ModifyFeature {
    constructor(options: any);
    snapDistance_: any;
    tolerance_: number;
    cursor_: any;
    sources_: any;
    filterSplit_: any;
    _condition: any;
    _deleteCondition: any;
    _insertVertexCondition: any;
    overlayLayer_: ol_layer_Vector<ol_source_Vector<import("ol/geom/Geometry").default>>;
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {ol.Map} map Map.
     * @api stable
     */
    setMap(map: ol.Map): void;
    /**
     * Activate or deactivate the interaction + remove the sketch.
     * @param {boolean} active.
     * @api stable
     */
    setActive(active: any): void;
    /** Change the filter function
     * @param {function|undefined} options.filter a filter that takes a feature and return true if it can be modified, default always true.
     */
    setFilter(filter: any): void;
    /** Get closest feature at pixel
     * @param {ol.Pixel}
     * @return {*}
     * @private
     */
    private getClosestFeature;
    currentFeature: any;
    /** Get nearest coordinate in a list
    * @param {ol.coordinate} pt the point to find nearest
    * @param {ol.geom} coords list of coordinates
    * @return {*} the nearest point with a coord (projected point), dist (distance to the geom), ring (if Polygon)
    */
    getNearestCoord(pt: ol.coordinate, geom: any): any;
    /** Get arcs concerned by a modification
     * @param {ol.geom} geom the geometry concerned
     * @param {ol.coordinate} coord pointed coordinates
     */
    getArcs(geom: ol.geom, coord: ol.coordinate): boolean;
    /**
     * @param {ol.MapBrowserEvent} evt Map browser event.
     * @return {boolean} `true` to start the drag sequence.
     */
    handleDownEvent(evt: ol.MapBrowserEvent): boolean;
    arcs: any[];
    _modifiedFeatures: any[];
    /** Get modified features
     * @return {Array<ol.Feature>} list of modified features
     */
    getModifiedFeatures(): Array<ol.Feature>;
    /** Removes the vertex currently being pointed.
     */
    removePoint(): void;
    /**
     * @private
     */
    private _getModification;
    /** Removes the vertex currently being pointed.
     * @private
     */
    private _removePoint;
    /**
     * @private
     */
    private handleUpEvent;
    /**
     * @private
     */
    private setArcCoordinates;
    /**
     * @private
     */
    private handleDragEvent;
    /**
     * @param {ol.MapBrowserEvent} evt Event.
     * @private
     */
    private handleMoveEvent;
    previousCursor_: any;
    /** Get the current feature to modify
     * @return {ol.Feature}
     */
    getCurrentFeature(): ol.Feature;
}
import ol_source_Vector from "ol/source/Vector";
import ol_layer_Vector from "ol/layer/Vector";
