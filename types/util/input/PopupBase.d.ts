export default ol_ext_input_PopupBase;
/** Base class for input popup
 * @constructor
 * @extends {ol_ext_input_Base}
 * @fires change:color
 * @fires color
 * @param {*} options
 *  @param {string} [options.className]
 *  @param {ol.colorLike} [options.color] default color
 *  @param {Element} [options.input] input element, if non create one
 *  @param {Element} [options.parent] parent element, if create an input
 *  @param {string} [options.position='popup'] fixed | static | popup | inline (no popup)
 *  @param {boolean} [options.autoClose=true] close when click on color
 *  @param {boolean} [options.hidden=false] display the input
 */
declare class ol_ext_input_PopupBase {
    constructor(options: any);
    element: HTMLElement | Text;
    _fixed: boolean;
    _elt: {};
    /** show/hide color picker
     * @param {boolean} [b=false]
     */
    collapse(b?: boolean): void;
    /** Is the popup collapsed ?
     * @returns {boolean}
     */
    isCollapsed(): boolean;
    /** Toggle the popup
     */
    toggle(): void;
}
