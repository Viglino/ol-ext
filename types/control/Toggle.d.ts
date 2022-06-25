export default ol_control_Toggle;
/** A simple toggle control
 * The control can be created with an interaction to control its activation.
 *
 * @constructor
 * @extends {ol_control_Button}
 * @fires change:active, change:disable
 * @param {Object=} options Control options.
 *  @param {String} options.className class of the control
 *  @param {String} options.title title of the control
 *  @param {String} options.html html to insert in the control
 *  @param {ol.interaction} options.interaction interaction associated with the control
 *  @param {bool} options.active the control is created active, default false
 *  @param {bool} options.disable the control is created disabled, default false
 *  @param {ol.control.Bar} options.bar a subbar associated with the control (drawn when active if control is nested in a ol.control.Bar)
 *  @param {bool} options.autoActive the control will activate when shown in an ol.control.Bar, default false
 *  @param {function} options.onToggle callback when control is clicked (or use change:active event)
 */
declare class ol_control_Toggle {
    constructor(options: any);
    interaction_: any;
    /**
     * Set the map instance the control is associated with
     * and add interaction attached to it to this map.
     * @param {_ol_Map_} map The map instance.
     */
    setMap(map: _ol_Map_): void;
    /** Get the subbar associated with a control
     * @return {ol_control_Bar}
     */
    getSubBar(): ol_control_Bar;
    /** Set the subbar associated with a control
     * @param {ol_control_Bar} [bar] a subbar if none remove the current subbar
     */
    setSubBar(bar?: ol_control_Bar): void;
    subbar_: ol_control_Bar;
    /**
     * Test if the control is disabled.
     * @return {bool}.
     * @api stable
     */
    getDisable(): bool;
    /** Disable the control. If disable, the control will be deactivated too.
    * @param {bool} b disable (or enable) the control, default false (enable)
    */
    setDisable(b: bool): void;
    /**
     * Test if the control is active.
     * @return {bool}.
     * @api stable
     */
    getActive(): bool;
    /** Toggle control state active/deactive
     */
    toggle(): void;
    /** Change control state
     * @param {bool} b activate or deactivate the control, default false
     */
    setActive(b: bool): void;
    /** Set the control interaction
    * @param {_ol_interaction_} i interaction to associate with the control
    */
    setInteraction(i: _ol_interaction_): void;
    /** Get the control interaction
    * @return {_ol_interaction_} interaction associated with the control
    */
    getInteraction(): _ol_interaction_;
}
