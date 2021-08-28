import ol_ext_element from '../element';
import ol_ext_input_Base from './Base'

/** Checkbox input
 * @constructor
 * @extends {ol_ext_input_Base}
 * @param {*} options
 *  @param {string} [align=left] align popup left/right
 *  @param {number} [min] min value, default use input min
 *  @param {number} [max] max value, default use input max
 *  @param {number} [step] step value, default use input step
 *  @param {boolean} [overflow=false] enable values over min/max
 *  @param {string|Element} [before] an element to add before the slider
 *  @param {string|Element} [after] an element to add after the slider
 */
var ol_ext_input_Slider = function(input, options) {
  options = options || {};

  ol_ext_input_Base.call(this, input, options);
  this.set('overflow', !!options.overflow)

  this.element = ol_ext_element.create('DIV', {
    className: 'ol-input-slider'
  })
  input.parentNode.insertBefore(this.element, input);
  this.element.appendChild(input);
  if (options.align==='right') this.element.classList.add('ol-right');

  var popup = ol_ext_element.create('DIV', {
    className: 'ol-popup',
    parent: this.element
  })
  if (options.before) {
    ol_ext_element.create('DIV', {
      className: 'ol-before',
      html: options.before,
      parent: popup
    });
  }
  var slider = this.slider = ol_ext_element.create('DIV', {
    className: 'ol-slider',
    parent: popup
  });
  var cursor = ol_ext_element.create('DIV', {
    className: 'ol-cursor',
    parent: slider
  })
  if (options.after) {
    ol_ext_element.create('DIV', {
      className: 'ol-after',
      html: options.after,
      parent: popup
    });
  }

  var min = (options.min !== undefined) ? options.min : parseFloat(input.min) || 0;
  var max = (options.max !== undefined) ? options.max : parseFloat(input.max) || 1;
  var step = (options.step !== undefined) ? options.step : parseFloat(input.step) || 1;

  // Handle popup drag
  this._listenDrag(slider, function(e) {
    var tx = Math.max(0, Math.min(e.offsetX / slider.clientWidth, 1));
    cursor.style.left = Math.max(0, Math.min(100, Math.round(tx*100) )) + '%';
    var v = input.value = Math.round((tx * (max - min) + min) / step) * step;
    this.dispatchEvent({ type: 'change:value', value: v });
  }.bind(this));

  var setValue = function() {
    var v = parseFloat(input.value) || 0;
    if (!this.get('overflow')) v = Math.max(min, Math.min(max, v));
    if (v != input.value) input.value = v;
    var tx = (v - min) / (max - min);
    cursor.style.left = Math.max(0, Math.min(100, Math.round(tx*100) )) + '%';
    this.dispatchEvent({ type: 'change:value', value: v });
  }.bind(this);

  input.addEventListener('change', setValue);

  setValue();

};
ol_ext_inherits(ol_ext_input_Slider, ol_ext_input_Base);

/** Set the slider value
 */
ol_ext_input_Slider.prototype.setValue = function(v) {
  if (v !== undefined) this.input.value = v;
  this.input.dispatchEvent(new Event('change'));
}
  
export default ol_ext_input_Slider
