import ol_ext_inherits from '../ext'
import ol_ext_element from '../element';
import ol_ext_input_Popup from './Popup'

/** Checkbox input
 * @constructor
 * @extends {ol_ext_input_Slider}
 * @param {*} options
 *  @param {Array<number>} [options.size] a list of size (default 0,2,3,5,8,13,21,34,55)
 */
var ol_ext_input_Size = function(input, options) {
  options = options || {};

  options.options = [];
  (options.size || [0,2,3,5,8,13,21,34,55]).forEach(function(i) {
    options.options.push({
      value: i,
      html: ol_ext_element.create('DIV', {
        className: 'ol-option-'+i,
        style: {
          fontSize: i ? i+'px' : undefined
        }
      })
    })
  })
  ol_ext_input_Popup.call(this, input, options);

  this.element.classList.add('ol-size');

};
ol_ext_inherits(ol_ext_input_Size, ol_ext_input_Popup);
  
/** Get the current value
 * @returns {number}
 */
ol_ext_input_Size.prototype.getValue = function() {
  return parseFloat(ol_ext_input_Base.prototype.getValue.call(this));
}

export default ol_ext_input_Size
