export default ol_control_Button;
/** A simple push button control
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 *  @param {String} options.className class of the control
 *  @param {String} options.title title of the control
 *  @param {String} options.name an optional name, default none
 *  @param {String} options.html html to insert in the control
 *  @param {function} options.handleClick callback when control is clicked (or use change:active event)
 */
declare class ol_control_Button {
    constructor(options: any);
    button_: HTMLButtonElement | HTMLDivElement;
    /** Set the control visibility
    * @param {boolean} b
    */
    setVisible(val: any): void;
    /**
     * Set the button title
     * @param {string} title
     */
    setTitle(title: string): void;
    /**
     * Set the button html
     * @param {string} html
     */
    setHtml(html: string): void;
    /**
     * Get the button element
     * @returns {Element}
     */
    getButtonElement(): Element;
}
