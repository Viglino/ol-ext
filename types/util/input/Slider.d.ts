export default ol_ext_input_Slider;
/** Checkbox input
 * @constructor
 * @extends {ol_ext_input_Base}
 * @param {*} options
 *  @param {string} [options.className]
 *  @param {Element} [options.input] input element, if non create one (use parent to tell where)
 *  @param {Element} [options.parent] element to use as parent if no input option
 *  @param {boolean} [options.hover=true] show popup on hover
 *  @param {string} [options.align=left] align popup left/right
 *  @param {string} [options.type] a slide type as 'size'
 *  @param {number} [options.min] min value, default use input min
 *  @param {number} [options.max] max value, default use input max
 *  @param {number} [options.step] step value, default use input step
 *  @param {boolean} [options.overflow=false] enable values over min/max
 *  @param {string|Element} [options.before] an element to add before the slider
 *  @param {string|Element} [options.after] an element to add after the slider
 *  @param {boolean} [options.fixed=false] no pupop
 */
declare class ol_ext_input_Slider {
    constructor(options: any);
    element: HTMLElement | Text;
    slider: HTMLElement | Text;
}
