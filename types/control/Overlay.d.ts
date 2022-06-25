export default ol_control_Overlay;
/** Control overlay for OL3
 * The overlay control is a control that display an overlay over the map
 *
 * @constructor
 * @extends {ol_control_Control}
 * @fire change:visible
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
*	@param {String|Element} options.content
*	@param {bool} options.hideOnClick hide the control on click, default false
*	@param {bool} options.closeBox add a closeBox to the control, default false
*/
declare class ol_control_Overlay {
    constructor(options: any);
    _timeout: boolean;
    /** Set the content of the overlay
    * @param {string|Element} html the html to display in the control
    */
    setContent(html: string | Element): void;
    /** Set the control visibility
    * @param {string|Element} html the html to display in the control
    * @param {ol.coordinate} coord coordinate of the top left corner of the control to start from
    */
    show(html: string | Element, coord: ol.coordinate): void;
    center_: any;
    /** Show an image
     * @param {string} src image url
     * @param {*} options
     *  @param {string} options.title
     *  @param {ol.coordinate} coordinate
     */
    showImage(src: string, options: any): void;
    /** Set the control visibility hidden
    */
    hide(): void;
    /** Toggle control visibility
    */
    toggle(): void;
    /** Get the control visibility
    * @return {boolean} b
    */
    getVisible(): boolean;
    /** Change class name
    * @param {String} className a class name or a list of class names separated by a space
    */
    setClass(className: string): void;
}
