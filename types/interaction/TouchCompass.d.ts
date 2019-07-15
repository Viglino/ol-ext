import { Map as _ol_Map_ } from 'ol';
import { Pointer } from 'ol/interaction';
/** Interaction splitter: acts as a split feature agent while editing vector features (LineString).
 * @constructor
 * @extends {interaction.Pointer}
 * @param {olx.interaction.TouchCompass}
 *	- onDrag {function|undefined} Function handling "drag" events. It provides a dpixel and a traction (in projection) vector form the center of the compas
 *	- Size {Number} Size of the compass in px, default 80
 *	- alpha {Number} opacity of the compass, default 0.5
 */
export class TouchCompass extends Pointer {
    constructor(options: {
        onDrag: undefined;
        Size: number;
        alpha: number;
    });
    /** Compass Image as a JS Image object
    * @api
     */
    compass: any;
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {_ol_Map_} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
    /**
     * Activate or deactivate the interaction.
     * @param {boolean} active Active.
     * @observable
     * @api
     */
    setActive(active: boolean): void;
}
