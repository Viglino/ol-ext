import ol_ext_inherits from '../ext'
import ol_ext_element from '../element';
import ol_ext_input_Base from './Base'

/** Checkbox input
 * @constructor
 * @extends {ol_ext_input_Base}
 */
var ol_ext_input_Checkbox = function(options) {
  options = options || {};

  ol_ext_input_Base.call(this, options);

  var label = this.element = ol_ext_element.create('LABEL',{ 
    html: options.html,
    className: ('ol-ext-check ol-ext-checkbox'  + (options.className || '')).trim()
  });
  if (this.input.parentNode) this.input.parentNode.insertBefore(label, this.input);
  label.appendChild(this.input);
  ol_ext_element.create('SPAN', { parent: label });
  if (options.after) {
    label.appendChild(document.createTextNode(options.after));
  }

};
ol_ext_inherits(ol_ext_input_Checkbox, ol_ext_input_Base);
  
export default ol_ext_input_Checkbox
