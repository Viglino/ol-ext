export default ol_interaction_Split;
/** Interaction split interaction for splitting feature geometry
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @fires  beforesplit, aftersplit, pointermove
 * @param {*}
 *  @param {ol.source.Vector|Array<ol.source.Vector>} [options.sources] a list of source to split (configured with useSpatialIndex set to true), if none use map visible layers.
 *  @param {ol.Collection.<ol.Feature>} options.features collection of feature to split (instead of a list of sources)
 *  @param {integer} options.snapDistance distance (in px) to snap to an object, default 25px
 *	@param {string|undefined} options.cursor cursor name to display when hovering an objet
 *  @param {function|undefined} opttion.filter a filter that takes a feature and return true if it can be clipped, default always split.
 *  @param Style | Array<ol_style_Style> | false | undefined} options.featureStyle Style for the selected features, choose false if you don't want feature selection. By default the default edit style is used.
 *  @param {ol_style_Style | Array<ol_style_Style> | undefined} options.sketchStyle Style for the sektch features.
 *  @param {number} options.tolerance Distance between the calculated intersection and a vertex on the source geometry below which the existing vertex will be used for the split.  Default is 1e-10.
 */
declare class ol_interaction_Split {
    constructor(options: any);
    snapDistance_: any;
    tolerance_: any;
    cursor_: any;
    sources_: void;
    filterSplit_: any;
    overlayLayer_: ol_layer_Vector<ol_source_Vector<import("ol/geom/Geometry").default>>;
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {ol.Map} map Map.
     * @api stable
     */
    setMap(map: ol.Map): void;
    /** Get sources to split features in
     * @return {Array<ol.source.Vector>}
     */
    getSources(): Array<ol.source.Vector>;
    /** Set sources to split features in
     * @param {ol.source.Vector|Array<ol.source.Vector>} [sources]
     */
    setSources(sources?: ol.source.Vector | Array<ol.source.Vector>): void;
    /** Get closest feature at pixel
     * @param {ol.Pixel}
     * @return {ol.feature}
     * @private
     */
    private getClosestFeature;
    /** Get nearest coordinate in a list
    * @param {ol.coordinate} pt the point to find nearest
    * @param {Array<ol.coordinate>} coords list of coordinates
    * @return {ol.coordinate} the nearest coordinate in the list
    */
    getNearestCoord(pt: ol.coordinate, coords: Array<ol.coordinate>): ol.coordinate;
    /**
     * @param {ol.MapBrowserEvent} evt Map browser event.
     * @return {boolean} `true` to start the drag sequence.
     */
    handleDownEvent(evt: ol.MapBrowserEvent): boolean;
    /**
     * @param {ol.MapBrowserEvent} evt Event.
     */
    handleMoveEvent(e: any): void;
    previousCursor_: any;
}
import ol_source_Vector from "ol/source/Vector";
import ol_layer_Vector from "ol/layer/Vector";
