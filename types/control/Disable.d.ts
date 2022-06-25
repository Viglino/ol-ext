export default ol_control_Disable;
/** A simple control to disable all actions on the map.
 * The control will create an invisible div over the map.
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 *		@param {String} options.class class of the control
 *		@param {String} options.html html code to insert in the control
 *		@param {bool} options.on the control is on
 *		@param {function} options.toggleFn callback when control is clicked
 */
declare class ol_control_Disable {
    constructor(options: any);
    /** Test if the control is on
     * @return {bool}
     * @api stable
     */
    isOn(): bool;
    /** Disable all action on the map
     * @param {bool} b, default false
     * @api stable
     */
    disableMap(b: bool): void;
}
