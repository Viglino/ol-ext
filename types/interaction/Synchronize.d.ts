export default ol_interaction_Synchronize;
/** Interaction synchronize
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @param {*} options
 *  @param {Array<ol.Map>} options maps An array of maps to synchronize with the map of the interaction
 */
declare class ol_interaction_Synchronize {
    constructor(options: any);
    maps: any;
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {ol_Map} map Map.
     * @api stable
     */
    setMap(map: ol_Map): void;
    _listener: {};
    /** Auto activate/deactivate controls in the bar
     * @param {boolean} b activate/deactivate
     */
    setActive(b: boolean): void;
    /** Synchronize the maps
     */
    syncMaps(): void;
    /** Cursor move > tells other maps to show the cursor
    * @param {ol.event} e "move" event
    */
    handleMove_(e: ol.event): void;
    /** Cursor out of map > tells other maps to hide the cursor
    * @param {event} e "mouseOut" event
    */
    handleMouseOut_(): void;
}
import ol_Map from "ol/Map";
