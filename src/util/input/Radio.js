import ol_ext_input_Checkbox from './Checkbox'

/** Switch input
 * @constructor
 * @extends {ol_ext_input_Checkbox}
 */
var ol_ext_input_Radio = function(input, options) {
  options = options || {};

  ol_ext_input_Checkbox.call(this, input, options);

  this.element.className = ('ol-ext-check ol-ext-radio' + (options.className || '')).trim();
};
ol_ext_inherits(ol_ext_input_Radio, ol_ext_input_Checkbox);
  
export default ol_ext_input_Radio
