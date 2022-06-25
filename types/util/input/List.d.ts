export default ol_ext_input_List;
/** Checkbox input
 * @constructor
 * @extends {ol_ext_input_Base}
 * @param {*} options
 *  @param {string} [options.className]
 *  @param {Array<Object>} options.options an array of options to place in the popup { html:, title:, value: }
 *  @param {Element} [options.input] input element, if non create one
 *  @param {Element} [options.parent] parent element, if create an input
 *  @param {boolean} [options.hover=false] show popup on hover, default false or true if disabled or hidden
 *  @param {boolean} [options.hidden] the input is display:none
 *  @param {boolean} [options.disabled] disable input
 *  @param {boolean} [options.fixed=false] don't use a popup, default use a popup
 *  @param {string} [options.align=left] align popup left/right/middle
 */
declare class ol_ext_input_List {
    constructor(options: any);
    _content: HTMLElement | Text;
    element: HTMLElement | Text;
    popup: HTMLElement | Text;
}
