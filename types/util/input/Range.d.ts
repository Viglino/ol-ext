export default ol_ext_input_Range;
/** Checkbox input
 * @constructor
 * @extends {ol_ext_input_Base}
 * @param {*} options
 *  @param {string} [options.className]
 *  @param {Element} [options.input] input element, if non create one (use parent to tell where)
 *  @param {Element} [options.input2] input element
 *  @param {Element} [options.parent] element to use as parent if no input option
 *  @param {number} [options.min] min value, default use input min
 *  @param {number} [options.max] max value, default use input max
 *  @param {number} [options.step] step value, default use input step
 *  @param {boolean} [options.overflow=false] enable values over min/max
 */
declare class ol_ext_input_Range {
    constructor(options: any);
    element: HTMLElement | Text;
    slider: HTMLElement | Text;
    input2: any;
    /** Set the current value (second input)
     */
    setValue2(v: any): void;
    /** Get the current value (second input)
     */
    getValue2(): any;
    /** Get the current min value
     * @return {number}
     */
    getMin(): number;
    /** Get the current max value
     * @return {number}
     */
    getMax(): number;
}
