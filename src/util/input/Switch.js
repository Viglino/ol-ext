import ol_ext_inherits from '../ext'
import ol_ext_input_Checkbox from './Checkbox'

/** Switch input
 * @constructor
 * @extends {ol_ext_input_Checkbox}
 */
var ol_ext_input_Switch = function(input, options) {
  options = options || {};

  ol_ext_input_Checkbox.call(this, input, options);

  this.element.className = ('ol-ext-toggle-switch ' + (options.className || '')).trim();
};
ol_ext_inherits(ol_ext_input_Switch, ol_ext_input_Checkbox);
  
export default ol_ext_input_Switch
