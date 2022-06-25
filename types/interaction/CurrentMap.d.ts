export default ol_interaction_CurrentMap;
/** An interaction to check the current map and add key events listeners.
 * It will fire a 'focus' event on the map when map is focused (use mapCondition option to handle the condition when the map is focused).
 * @constructor
 * @fires focus
 * @param {*} options
 *  @param {function} condition a function that takes a mapBrowserEvent and returns true if the map must be activated, default always true
 *  @param {function} onKeyDown a function that takes a keydown event is fired on the active map
 *  @param {function} onKeyPress a function that takes a keypress event is fired on the active map
 *  @param {function} onKeyUp a function that takes a keyup event is fired on the active map
 * @extends {ol_interaction_Interaction}
 */
declare class ol_interaction_CurrentMap {
    constructor(options: any);
    /** Check if is the current map
     * @return {boolean}
     */
    isCurrentMap(): boolean;
    /** Get the current map
     * @return {ol.Map}
     */
    getCurrentMap(): ol.Map;
    /** Set the current map
     * @param {ol.Map} map
     */
    setCurrentMap(map: ol.Map): void;
    /** The current map */
    _currentMap: any;
}
