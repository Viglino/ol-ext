import ol_ext_input_Checkbox from './Checkbox.js'

/** Switch input
 * @constructor
 * @extends {ol_ext_input_Checkbox}
 * @fires check
 * @param {*} options
 *  @param {string} [options.className]
 *  @param {Element} [options.input] input element, if non create one
 *  @param {Element} [options.parent] parent element, if create an input
 */
var ol_ext_input_Switch = class olextinputSwitch extends ol_ext_input_Checkbox {
  constructor(options) {
    options = options || {};

    super(options);

    this.element.className = ('ol-ext-toggle-switch ' + (options.className || '')).trim();
  }
};
  
export default ol_ext_input_Switch
