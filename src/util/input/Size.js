import ol_ext_inherits from '../ext'
import ol_ext_element from '../element';
import ol_ext_input_Popup from './Pop'

/** Checkbox input
 * @constructor
 * @extends {ol_ext_input_Slider}
 * @param {*} options
 *  @param {string} [align=left] align popup left/right
 */
var ol_ext_input_Size = function(input, options) {
  options = options || {};

  options.options = [];
  [0,2,3,5,8,13,21,34,55].forEach(function(i) {
    options.options.push({
      value: i,
      html: ol_ext_element.create('DIV', {
        className: 'ol-option-'+i,
        style: {
          width: i,
          height: i
        }
      })
    })
  })
  ol_ext_input_Popup.call(this, input, options);
  this.set('overflow', !!options.overflow)

};
ol_ext_inherits(ol_ext_input_Size, ol_ext_input_Popup);
  
export default ol_ext_input_Size
