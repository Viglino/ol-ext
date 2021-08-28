import ol_ext_element from '../element';
import ol_ext_input_Slider from './Base'

/** Checkbox input
 * @constructor
 * @extends {ol_ext_input_Slider}
 * @param {*} options
 *  @param {string} [align=left] align popup left/right
 */
var ol_ext_input_Size = function(input, options) {
  options = options || {};

  ol_ext_input_Slider.call(this, input, options);

  this.element.classList.add('ol-size');
  ol_ext_element.create('DIV', {
    className: 'ol-back',
    parent: this.slider
  })
};
ol_ext_inherits(ol_ext_input_Size, ol_ext_input_Slider);
  
export default ol_ext_input_Size
