export default ol_ext_input_Base;
/** Abstract base class; normally only used for creating subclasses and not instantiated in apps.
 * @constructor
 * @extends {ol_Object}
 * @param {*} options
 *  @param {Element} [options.input] input element, if none create one
 *  @param {string} [options.type] input type, if no input
 *  @param {number} [options.min] input min, if no input
 *  @param {number} [options.max] input max, if no input
 *  @param {number} [options.step] input step, if no input
 *  @param {string|number} [options.val] input value
 *  @param {boolean} [options.checked] check input
 *  @param {boolean} [options.hidden] the input is display:none
 *  @param {boolean} [options.disabled] disable input
 *  @param {Element} [options.parent] parent element, if no input
 */
declare class ol_ext_input_Base {
    constructor(options: any);
    input: any;
    /** Listen to drag event
     * @param {Element} elt
     * @param {function} cback when draggin on the element
     * @private
     */
    private _listenDrag;
    /** Set the current value
     */
    setValue(v: any): void;
    /** Get the current getValue
     * @returns {string}
     */
    getValue(): string;
    /** Get the input element
     * @returns {Element}
     */
    getInputElement(): Element;
}
