import ol_control_Control from 'ol/control/Control';
/** A simple control to disable all actions on the map.
 * The control will create an invisible div over the map.
 * @constructor
 * @extends {contrControl}
 * @param {Object=} options Control options.
 *		@param {String} options.class class of the control
 *		@param {String} options.html html code to insert in the control
 *		@param {bool} options.on the control is on
 *		@param {function} options.toggleFn callback when control is clicked
 */
export class Disable extends ol_control_Control {
    constructor(options?: {
        class: string;
        html: string;
        on: boolean;
        toggleFn: (...params: any[]) => any;
    });
    /** Test if the control is on
     * @return {bool}
     * @api stable
     */
    isOn(): boolean;
    /** Disable all action on the map
     * @param {bool} b, default false
     * @api stable
     */
    disableMap(b: boolean): void;
}
