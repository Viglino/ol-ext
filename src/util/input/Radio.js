import ol_ext_inherits from '../ext'
import ol_ext_input_Checkbox from './Checkbox'

/** Switch input
 * @constructor
 * @extends {ol_ext_input_Checkbox}
 * @fires check
 * @param {*} options
 *  @param {string} [options.className]
 *  @param {Element} [options.input] input element, if non create one
 *  @param {Element} [options.parent] parent element, if create an input
 */
var ol_ext_input_Radio = function(options) {
  options = options || {};

  ol_ext_input_Checkbox.call(this, options);

  this.element.className = ('ol-ext-check ol-ext-radio ' + (options.className || '')).trim();
};
ol_ext_inherits(ol_ext_input_Radio, ol_ext_input_Checkbox);
  
export default ol_ext_input_Radio
