export default ol_control_Bar;
/** Control bar for OL3
 * The control bar is a container for other controls. It can be used to create toolbars.
 * Control bars can be nested and combined with ol.control.Toggle to handle activate/deactivate.
 * @class
 * @constructor
 * @extends ol_control_Control
 * @param {Object=} options Control options.
 *  @param {String} options.className class of the control
 *  @param {boolean} options.group is a group, default false
 *  @param {boolean} options.toggleOne only one toggle control is active at a time, default false
 *  @param {boolean} options.autoDeactivate used with subbar to deactivate all control when top level control deactivate, default false
 *  @param {Array<ol_control_Control> } options.controls a list of control to add to the bar
 */
declare class ol_control_Bar {
    constructor(options: any);
    controls_: any[];
    /** Set the control visibility
     * @param {boolean} val
     */
    setVisible(val: boolean): void;
    /** Get the control visibility
     * @return {boolean} b
     */
    getVisible(): boolean;
    /**
     * Set the map instance the control is associated with
     * and add its controls associated to this map.
     * @param {ol_Map} map The map instance.
     */
    setMap(map: ol_Map): void;
    /** Get controls in the panel
     *	@param {Array<ol_control_Control>}
     */
    getControls(): any[];
    /** Set tool bar position
     * @param {string} pos a combinaison of top|left|bottom|right
     */
    setPosition(pos: string): void;
    /** Add a control to the bar
     *	@param {ol_control_Control} c control to add
     */
    addControl(c: ol_control_Control): void;
    /** Deativate all controls in a bar
     * @param {ol_control_Control} [except] a control
     */
    deactivateControls(except?: ol_control_Control): void;
    /** Get active control in the bar
     * @returns {Array<ol_control_Control>}
     */
    getActiveControls(): Array<ol_control_Control>;
    /** Auto activate/deactivate controls in the bar
     * @param {boolean} b activate/deactivate
     */
    setActive(b: boolean): void;
    /** Post-process an activated/deactivated control
     *	@param {ol.event} e :an object with a target {_ol_control_} and active flag {bool}
     */
    onActivateControl_(e: ol.event, ctrl: any): void;
    /**
     * @param {string} name of the control to search
     * @return {ol.control.Control}
     */
    getControlsByName(name: string): ol.control.Control;
}
import ol_control_Control from "ol/control/Control";
