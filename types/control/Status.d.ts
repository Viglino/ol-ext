export default ol_control_Status;
/** A control to display status information on top of the map
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *  @param {string} options.status status, default none
 *  @param {string} options.position position of the status 'top', 'left', 'bottom' or 'right', default top
 *  @param {boolean} options.visible default true
 */
declare class ol_control_Status {
    constructor(options: any);
    /** Set visiblitity
     * @param {boolean} visible
     */
    setVisible(visible: boolean): void;
    /** Show status on the map
     * @param {string|Element} html status text or DOM element
     */
    status(html: string | Element): void;
    /** Set status position
     * @param {string} position position of the status 'top', 'left', 'bottom' or 'right', default top
     */
    setPosition(position: string): void;
    /** Show the status
     * @param {boolean} show show or hide the control, default true
     */
    show(show: boolean): void;
    /** Hide the status
     */
    hide(): void;
    /** Toggle the status
     */
    toggle(): void;
    /** Is status visible
     */
    isShown(): boolean;
}
