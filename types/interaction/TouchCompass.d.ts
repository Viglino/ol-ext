export default ol_interaction_TouchCompass;
/** Interaction splitter: acts as a split feature agent while editing vector features (LineString).
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @param {olx.interaction.TouchCompass}
 *	- onDrag {function|undefined} Function handling "drag" events. It provides a dpixel and a traction (in projection) vector form the center of the compas
 *	- size {Number} size of the compass in px, default 80
 *	- alpha {Number} opacity of the compass, default 0.5
 */
declare class ol_interaction_TouchCompass {
    constructor(options: any);
    ondrag_: any;
    size: any;
    alpha: any;
    /**
     * Remove the interaction from its current map, if any,  and attach it to a new
     * map, if any. Pass `null` to just remove the interaction from the current map.
     * @param {_ol_Map_} map Map.
     * @api stable
     */
    setMap(map: _ol_Map_): void;
    _listener: any;
    /**
     * Activate or deactivate the interaction.
     * @param {boolean} active Active.
     * @observable
     * @api
     */
    setActive(b: any): void;
    /**
     * Get the center of the compass
     * @param {_ol_coordinate_}
     * @private
     */
    private getCenter_;
    /**
     * Draw the compass on post compose
     * @private
     */
    private drawCompass_;
    /** Compass Image as a JS Image object
    * @api
    */
    compass: any;
}
