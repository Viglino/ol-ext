export default ol_ext_input_Checkbox;
/** Checkbox input
 * @constructor
 * @extends {ol_ext_input_Base}
 * @fires check
 * @param {*} options
 *  @param {string} [options.className]
 *  @param {Element|string} [options.html] label content
 *  @param {string} [options.after] label garnish (placed after)
 *  @param {Element} [options.input] input element, if non create one
 *  @param {Element} [options.parent] parent element, if create an input
 *  @param {boolean} [options.autoClose=true]
 *  @param {boolean} [options.visible=false] display the input
 */
declare class ol_ext_input_Checkbox {
    constructor(options: any);
    element: HTMLElement;
    isChecked(): any;
}
