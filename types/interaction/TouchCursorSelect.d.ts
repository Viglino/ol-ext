export default ol_interaction_TouchCursorSelect;
/** A TouchCursor to select objects on hovering the cursor
 * @constructor
 * @extends {ol_interaction_DragOverlay}
 * @param {olx.interaction.InteractionOptions} options Options
 *  @param {string} options.className cursor class name
 *  @param {ol.coordinate} options.coordinate position of the cursor
 */
declare class ol_interaction_TouchCursorSelect {
    constructor(options: any);
    _selection: {
        feature: any;
        style: any;
    };
    _layerFilter: any;
    _filter: any;
    _style: any;
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {_ol_Map_} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
    /** Get current selection
     * @return {ol.Feature|null}
     */
    getSelection(): ol.Feature | null;
    /** Set position
     * @param {ol.coordinate} coord
     */
    setPosition(coord: ol.coordinate): void;
    /** Select feature
     * @param {ol.Feature|undefined} f a feature to select or select at the cursor position
     */
    select(f: ol.Feature | undefined): void;
}
