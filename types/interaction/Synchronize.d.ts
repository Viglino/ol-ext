import { Map as _ol_Map_ } from 'ol';
import { Interaction } from 'ol/interaction';
import Event from 'ol/events/Event';
/** Interaction synchronize
 * @constructor
 * @extends {Interaction}
 * @param {olx.interaction.SynchronizeOptions}
 *  - maps {Array<Map>} An array of maps to synchronize with the map of the interaction
 */
export class Synchronize extends Interaction {
    constructor(options: {
        map: _ol_Map_[];
    });
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {Map} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
    /** Synchronize the maps
     */
    syncMaps(): void;
    /** Cursor move > tells other maps to show the cursor
    * @param {event} e "move" event
     */
    handleMove_(e: Event): void;
    /** Cursor out of map > tells other maps to hide the cursor
    * @param {event} e "mouseOut" event
     */
    handleMouseOut_(e: Event): void;
}
