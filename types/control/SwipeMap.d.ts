export default ol_control_SwipeMap;
/** A control that use a CSS clip rect to swipe the map
 * @classdesc Swipe Control.
 * @fires moving
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} Control options.
 *  @param {ol.layer} options.layers layer to swipe
 *  @param {ol.layer} options.rightLayer layer to swipe on right side
 *  @param {string} options.className control class name
 *  @param {number} options.position position propertie of the swipe [0,1], default 0.5
 *  @param {string} options.orientation orientation propertie (vertical|horizontal), default vertical
 */
declare class ol_control_SwipeMap {
    constructor(options: any);
    /** Set the map instance the control associated with.
     * @param {ol_Map} map The map instance.
     */
    setMap(map: ol_Map): void;
    _listener: any;
    /** Clip
     * @private
     */
    private _clip;
    /** Get visible rectangle
     * @returns {ol.extent}
     */
    getRectangle(): ol.extent;
    /** @private
    */
    private move;
    _movefn: any;
}
