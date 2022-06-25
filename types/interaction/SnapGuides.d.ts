export default ol_interaction_SnapGuides;
/** Interaction to snap to guidelines
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @param {*} options
 *  @param {number | undefined} options.pixelTolerance distance (in px) to snap to a guideline, default 10 px
 *  @param {bool | undefined} options.enableInitialGuides whether to draw initial guidelines based on the maps orientation, default false.
 *  @param {ol_style_Style | Array<ol_style_Style> | undefined} options.style Style for the sektch features.
 *  @param {*} options.vectorClass a vector layer class to create the guides with ol6, use ol/layer/VectorImage using ol6
 */
declare class ol_interaction_SnapGuides {
    constructor(options: any);
    snapDistance_: any;
    enableInitialGuides_: any;
    overlaySource_: ol_source_Vector<import("ol/geom/Geometry").default>;
    overlayLayer_: any;
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {ol.Map} map Map.
     * @api stable
     */
    setMap(map: ol.Map): void;
    projExtent_: any;
    /** Activate or deactivate the interaction.
     * @param {boolean} active
     */
    setActive(active: boolean): void;
    /** Clear previous added guidelines
     * @param {Array<ol.Feature> | undefined} features a list of feature to remove, default remove all feature
     */
    clearGuides(features: Array<ol.Feature> | undefined): void;
    /** Get guidelines
     * @return {ol.Collection} guidelines features
     */
    getGuides(): ol.Collection;
    /** Add a new guide to snap to
     * @param {Array<ol.coordinate>} v the direction vector
     * @return {ol.Feature} feature guide
     */
    addGuide(v: Array<ol.coordinate>, ortho: any): ol.Feature;
    /** Add a new orthogonal guide to snap to
     * @param {Array<ol.coordinate>} v the direction vector
     * @return {ol.Feature} feature guide
     */
    addOrthoGuide(v: Array<ol.coordinate>): ol.Feature;
    /** Listen to draw event to add orthogonal guidelines on the first and last point.
     * @param {_ol_interaction_Draw_} drawi a draw interaction to listen to
     * @api
     */
    setDrawInteraction(drawi: _ol_interaction_Draw_): void;
    /** Listen to modify event to add orthogonal guidelines relative to the currently dragged point
     * @param {_ol_interaction_Modify_} modifyi a modify interaction to listen to
     * @api
     */
    setModifyInteraction(modifyi: _ol_interaction_Modify_): void;
}
import ol_source_Vector from "ol/source/Vector";
