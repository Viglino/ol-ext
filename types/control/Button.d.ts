import ol_control_Control from 'ol/control/Control';
/** A simple push button control
* @constructor
* @extends {contrControl}
* @param {Object=} options Control options.
*	@param {String} options.className class of the control
*	@param {String} options.title title of the control
*	@param {String} options.name an optional name, default none
*	@param {String} options.html html to insert in the control
*	@param {function} options.handleClick callback when control is clicked (or use change:active event)
 */
export class Button extends ol_control_Control {
    constructor(options?: {
        className: string;
        title: string;
        name: string;
        html: string;
        handleClick: (...params: any[]) => any;
    });
    /** Set the control visibility
    * @param {boolean} b
     */
    setVisible(b: boolean): void;
    /**
     * Set the button title
     * @param {string} title
     * @returns {undefined}
     */
    setTitle(title: string): undefined;
    /**
     * Set the button html
     * @param {string} html
     * @returns {undefined}
     */
    setHtml(html: string): undefined;
}
