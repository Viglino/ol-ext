export default ol_interaction_FocusMap;
/** An interaction to focus on the map on click. Usefull when using keyboard event on the map.
 * @constructor
 * @fires focus
 * @extends {ol_interaction_Interaction}
 */
declare class ol_interaction_FocusMap {
    focusBt: HTMLElement | Text;
    /** Set the map > add the focus button and focus on the map when pointerdown to enable keyboard events.
     */
    setMap(map: any): void;
    _listener: any;
}
