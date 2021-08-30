import ol_ext_inherits from '../ext'
import ol_ext_element from '../element';
import ol_ext_input_Base from './Base'

/** Checkbox input
 * @constructor
 * @extends {ol_ext_input_Base}
 * @param {*} options
 *  @param {string} [align=left] align popup left/right
 */
var ol_ext_input_Popup = function(input, options) {
  options = options || {};

  ol_ext_input_Base.call(this, input, options);

  this.element = ol_ext_element.create('DIV', {
    className: 'ol-input-popup'
  });
  if (options.className) this.element.classList.add(options.className);
  input.parentNode.insertBefore(this.element, input);
  this.element.appendChild(input);

  this.popup = ol_ext_element.create('UL', {
    className: 'ol-popup',
    parent: this.element
  });
  options.options.forEach(option => {
    ol_ext_element.create('li', {
      html: option.html,
      className: 'ol-option',
      parent: this.popup
    });
  });

};
ol_ext_inherits(ol_ext_input_Popup, ol_ext_input_Base);
  
export default ol_ext_input_Popup
