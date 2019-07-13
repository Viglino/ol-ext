import { Map as _ol_Map_ } from 'ol';
import { Interaction } from 'ol/interaction';
import Event from 'ol/events/Event';
/** Interaction hover do to something when hovering a feature
 * @constructor
 * @extends {Interaction}
 * @fires hover, enter, leave
 * @param {olx.interaction.HoverOptions}
 *	@param { string | undefined } options.cursor css cursor propertie or a function that gets a feature, default: none
 *	@param {function | undefined} optionsfeatureFilter filter a function with two arguments, the feature and the layer of the feature. Return true to select the feature
 *	@param {function | undefined} options.layerFilter filter a function with one argument, the layer to test. Return true to test the layer
 *	@param {number | undefined} options.hitTolerance Hit-detection tolerance in pixels.
 *	@param { function | undefined } options.handleEvent Method called by the map to notify the interaction that a browser event was dispatched to the map. The function may return false to prevent the propagation of the event to other interactions in the map's interactions chain.
 */
export class Hover extends Interaction {
    constructor(options: {
        cursor: string | undefined;
        layerFilter: ((...params: any[]) => any) | undefined;
        hitTolerance: number | undefined;
        handleEvent: ((...params: any[]) => any) | undefined;
    }, optionsfeatureFilter: ((...params: any[]) => any) | undefined);
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {Map} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
    /**
     * Set cursor on hover
     * @param { string } cursor css cursor propertie or a function that gets a feature, default: none
     * @api stable
     */
    setCursor(cursor: string): void;
    /** Feature filter to get only one feature
    * @param {function} filter a function with two arguments, the feature and the layer of the feature. Return true to select the feature
     */
    setFeatureFilter(filter: (...params: any[]) => any): void;
    /** Feature filter to get only one feature
    * @param {function} filter a function with one argument, the layer to test. Return true to test the layer
     */
    setLayerFilter(filter: (...params: any[]) => any): void;
    /** Get features whenmove
    * @param {event} e "move" event
     */
    handleMove_(e: Event): void;
}
