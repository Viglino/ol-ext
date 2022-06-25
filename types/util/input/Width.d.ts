export default ol_ext_input_Width;
/** Checkbox input
 * @constructor
 * @extends {ol_ext_input_List}
 * @param {*} options
 *  @param {string} [options.className]
 *  @param {Element} [options.input] input element, if non create one
 *  @param {Element} [options.parent] parent element, if create an input
 *  @param {Array<number>} [options.size] a list of size (default 0,1,2,3,5,10,15,20)
 */
declare class ol_ext_input_Width {
    constructor(options: any);
    /** Get the current value
     * @returns {number}
     */
    getValue(): number;
}
