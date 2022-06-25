export default ol_control_GeolocationBar;
/** Geolocation bar
 * The control bar is a container for other controls. It can be used to create toolbars.
 * Control bars can be nested and combined with ol.control.Toggle to handle activate/deactivate.
 *
 * @constructor
 * @extends {ol_control_Bar}
 * @param {Object=} options Control bar options.
 *  @param {String} options.className class of the control
 *  @param {String} options.centerLabel label for center button, default center
 *  @param {String} options.position position of the control, default bottom-right
 */
declare class ol_control_GeolocationBar {
    constructor(options: any);
    _geolocBt: ol_control_Toggle;
    /**
     * Remove the control from its current map and attach it to the new map.
     * Subclasses may set up event handlers to get notified about changes to
     * the map here.
     * @param {ol.Map} map Map.
     * @api stable
     */
    setMap(map: ol.Map): void;
    _listener: any;
    /** Get the ol.interaction.GeolocationDraw associatedwith the bar
     * @return {ol.interaction.GeolocationDraw}
     */
    getInteraction(): ol.interaction.GeolocationDraw;
}
import ol_control_Toggle from "./Toggle";
