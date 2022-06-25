export default ol_Overlay_Tooltip;
/** A tooltip element to be displayed over the map and attached on the cursor position.
 * @constructor
 * @extends {ol_Overlay_Popup}
 * @param {} options Extend Popup options
 *	@param {String} options.popupClass the a class of the overlay to style the popup.
 *  @param {number} options.maximumFractionDigits maximum digits to display on measure, default 2
 *  @param {function} options.formatLength a function that takes a number and returns the formated value, default length in meter
 *  @param {function} options.formatArea a function that takes a number and returns the formated value, default length in square-meter
 *  @param {function} options.getHTML a function that takes a feature and the info string and return a formated info to display in the tooltip, default display feature measure & info
 *	@param {Number|Array<number>} options.offsetBox an offset box
 *	@param {ol.OverlayPositioning | string | undefined} options.positionning
 *		the 'auto' positioning var the popup choose its positioning to stay on the map.
 * @api stable
 */
declare class ol_Overlay_Tooltip {
    constructor(options: any);
    /** Format area to display in the popup
     * Can be overwritten to display measure in different unit (default: meter).
     * @param {number} length length in m
     * @return {string} the formated length
     * @api
     */
    formatLength(length: number): string;
    /** Format area to display in the popup.
     * Can be overwritten to display measure in a different unit (default: square-metter).
     * @param {number} area area in m2
     * @return {string} the formated area
     * @api
     */
    formatArea(area: number): string;
    /** Get the information to show in the tooltip
     * The area/length will be added if a feature is attached.
     * @param {ol.Feature|undefined} feature the feature
     * @param {string} info the info string
     * @api
     */
    getHTML(feature: ol.Feature | undefined, info: string): string;
    _interaction: ol_interaction_Interaction;
    /**
     * Set the map instance the control is associated with
     * and add its controls associated to this map.
     * @param {_ol_Map_} map The map instance.
     */
    setMap(map: _ol_Map_): void;
    /** Set the Tooltip info
     * If information is not null it will be set with a delay,
     * thus watever the information is inserted, the significant information will be set.
     * ie. ttip.setInformation('ok'); ttip.setInformation(null); will set 'ok'
     * ttip.set('info','ok'); ttip.set('info', null); will set null
     * @param {string} what The information to display in the tooltip, default remove information
     */
    setInfo(what: string): void;
    /** Remove the current featue attached to the tip
     * Similar to setFeature() with no argument
     */
    removeFeature(): void;
    /** Set a feature associated with the tooltips, measure info on the feature will be added in the tooltip
     * @param {ol.Feature|ol.Event} feature an ol.Feature or an event (object) with a feature property
     */
    setFeature(feature: ol.Feature | ol.Event): void;
    _feature: any;
    _listener: any[];
}
import ol_interaction_Interaction from "ol/interaction/Interaction";
