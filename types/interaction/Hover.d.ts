export default ol_interaction_Hover;
/** Interaction hover do to something when hovering a feature
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @fires hover, enter, leave
 * @param {olx.interaction.HoverOptions}
 *  @param { string | undefined } options.cursor css cursor propertie or a function that gets a feature, default: none
 *  @param {function | undefined} options.featureFilter filter a function with two arguments, the feature and the layer of the feature. Return true to select the feature
 *  @param {function | undefined} options.layerFilter filter a function with one argument, the layer to test. Return true to test the layer
 *  @param {Array<ol.layer> | undefined} options.layers a set of layers to test
 *  @param {number | undefined} options.hitTolerance Hit-detection tolerance in pixels.
 *  @param { function | undefined } options.handleEvent Method called by the map to notify the interaction that a browser event was dispatched to the map. The function may return false to prevent the propagation of the event to other interactions in the map's interactions chain.
 */
declare class ol_interaction_Hover {
    constructor(options: any);
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {ol.Map} map Map.
     * @api stable
     */
    setMap(map: ol.Map): void;
    previousCursor_: any;
    /** Activate / deactivate interaction
     * @param {boolean} b
     */
    setActive(b: boolean): void;
    /**
     * Set cursor on hover
     * @param { string } cursor css cursor propertie or a function that gets a feature, default: none
     * @api stable
     */
    setCursor(cursor: string): void;
    cursor_: string;
    /** Feature filter to get only one feature
    * @param {function} filter a function with two arguments, the feature and the layer of the feature. Return true to select the feature
    */
    setFeatureFilter(filter: Function): void;
    featureFilter_: Function | (() => boolean);
    /** Feature filter to get only one feature
    * @param {function} filter a function with one argument, the layer to test. Return true to test the layer
    */
    setLayerFilter(filter: Function): void;
    layerFilter_: Function | (() => boolean);
    /** Get features whenmove
    * @param {ol.event} e "move" event
    */
    handleMove_(e: ol.event): void;
    feature_: any;
    layer_: any;
}
