import ol_ext_element from '../element';
import ol_ext_input_Base from './Base'

/** Checkbox input
 * @constructor
 * @extends {ol_ext_input_Base}
 * @param {*} options
 *  @param {string} [align=left] align popup left/right
 */
var ol_ext_input_Size = function(input, options) {
  options = options || {};

  ol_ext_input_Base.call(this, input, options);

  this.element = ol_ext_element.create('DIV', {
    className: 'ol-input-size'
  })
  input.parentNode.insertBefore(this.element, input);
  this.element.appendChild(input);
  if (options.align==='right') this.element.classList.add('ol-right');

  var popup = ol_ext_element.create('DIV', {
    className: 'ol-popup',
    parent: this.element
  })
  var cursor = ol_ext_element.create('DIV', {
    parent: popup
  })

  var min = parseFloat(input.min) || 0;
  var max = parseFloat(input.max) || 1;
  var step = parseFloat(input.step) || 1;

  // Handle popup drag
  this._listenDrag(popup, function(e) {
    var tx = Math.max(0, Math.min(e.offsetX / popup.clientWidth, 1));
    cursor.style.left = Math.max(0, Math.min(100, Math.round(tx*100) )) + '%';
    input.value = Math.round((tx * (max - min) + min) / step) * step;
  }.bind(this));

  function setValue() {
    var v = parseFloat(input.value) || 0;
    if (v != input.value) input.value = v;
    var tx = (v - min) / (max - min);
    cursor.style.left = Math.max(0, Math.min(100, Math.round(tx*100) )) + '%';
  }
  input.addEventListener('change', setValue);
  setValue();

};
ol_ext_inherits(ol_ext_input_Size, ol_ext_input_Base);
  
export default ol_ext_input_Size
