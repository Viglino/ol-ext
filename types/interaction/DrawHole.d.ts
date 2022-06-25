export default ol_interaction_DrawHole;
/** Interaction to draw holes in a polygon.
 * It fires a drawstart, drawend event when drawing the hole
 * and a modifystart, modifyend event before and after inserting the hole in the feature geometry.
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @fires drawstart
 * @fires drawend
 * @fires modifystart
 * @fires modifyend
 * @param {olx.interaction.DrawHoleOptions} options extend olx.interaction.DrawOptions
 * 	@param {Array<ol.layer.Vector> | function | undefined} options.layers A list of layers from which polygons should be selected. Alternatively, a filter function can be provided. default: all visible layers
 * 	@param {Array<ol.Feature> | ol.Collection<ol.Feature> | function | undefined} options.features An array or a collection of features the interaction applies on or a function that takes a feature and a layer and returns true if the feature is a candidate
 * 	@param { ol.style.Style | Array<ol.style.Style> | StyleFunction | undefined }	Style for the selected features, default: default edit style
 */
declare class ol_interaction_DrawHole {
    constructor(options: any);
    _select: ol_interaction_Select;
    layers_: any;
    _features: any;
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
     * Remove last point of the feature currently being drawn
     * (test if points to remove before).
     */
    removeLastPoint(): void;
    /**
     * Get the current polygon to hole
     * @return {ol.Feature}
     */
    getPolygon(): ol.Feature;
    /**
     * Get current feature to add a hole and start drawing
     * @param {ol_interaction_Draw.Event} e
     * @private
     */
    private _startDrawing;
    _feature: any;
    _current: any;
    /**
     * Stop drawing and add the sketch feature to the target feature.
     * @param {ol_interaction_Draw.Event} e
     * @private
     */
    private _finishDrawing;
    /**
     * Function that is called when a geometry's coordinates are updated.
     * @param {Array<ol.coordinate>} coordinates
     * @param {ol_geom_Polygon} geometry
     * @return {ol_geom_Polygon}
     * @private
     */
    private _geometryFn;
    lastOKCoord: any[];
}
import ol_interaction_Select from "ol/interaction/Select";
