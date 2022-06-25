export default ol_interaction_Offset;
/** Offset interaction for offseting feature geometry
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @fires offsetstart
 * @fires offsetting
 * @fires offsetend
 * @param {any} options
 *	@param {ol.layer.Vector | Array<ol.layer.Vector>} options.layers list of feature to transform
 *	@param {ol.Collection.<ol.Feature>} options.features collection of feature to transform
 *	@param {ol.source.Vector | undefined} options.source source to duplicate feature when ctrl key is down
 *	@param {boolean} options.duplicate force feature to duplicate (source must be set)
 *  @param {ol.style.Style | Array.<ol.style.Style> | ol.style.StyleFunction | undefined} style style for the sketch
 */
declare class ol_interaction_Offset {
    constructor(options: any);
    features_: any;
    layers_: any;
    source_: any;
    _style: any;
    previousCursor_: boolean;
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {ol.Map} map Map.
     * @api stable
     */
    setMap(map: ol.Map): void;
    /** Get Feature at pixel
     * @param {ol.MapBrowserEvent} evt Map browser event.
     * @return {any} a feature and the hit point
     * @private
     */
    private getFeatureAtPixel_;
    /**
     * @param {ol.MapBrowserEvent} e Map browser event.
     * @return {boolean} `true` to start the drag sequence.
     * @private
     */
    private handleDownEvent_;
    current_: any;
    currentStyle_: any;
    _modifystart: boolean;
    /**
     * @param {ol.MapBrowserEvent} e Map browser event.
     * @private
     */
    private handleDragEvent_;
    /**
     * @param {ol.MapBrowserEvent} e Map browser event.
     * @private
     */
    private handleUpEvent_;
    /**
     * @param {ol.MapBrowserEvent} e Event.
     * @private
     */
    private handleMoveEvent_;
}
