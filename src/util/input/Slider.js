import ol_ext_element from '../element.js';
import ol_ext_input_Base from './Base.js'

/** Checkbox input
 * @constructor
 * @extends {ol_ext_input_Base}
 * @param {*} options
 *  @param {string} [options.className]
 *  @param {Element} [options.input] input element, if non create one (use parent to tell where)
 *  @param {Element} [options.parent] element to use as parent if no input option
 *  @param {booelan} [options.hover=true] show popup on hover
 *  @param {string} [options.align=left] align popup left/right
 *  @param {string} [options.type] a slide type as 'size'
 *  @param {number} [options.min] min value, default use input min
 *  @param {number} [options.max] max value, default use input max
 *  @param {number} [options.step] step value, default use input step
 *  @param {boolean} [options.overflow=false] enable values over min/max
 *  @param {string|Element} [options.before] an element to add before the slider
 *  @param {string|Element} [options.after] an element to add after the slider
 *  @param {boolean} [options.fixed=false] no pupop
 */
var ol_ext_input_Slider = class olextinputSlider extends ol_ext_input_Base {
  constructor(options) {
    options = options || {};
    super(options);

    this.set('overflow', !!options.overflow);

    this.element = ol_ext_element.create('DIV', {
      className: 'ol-input-slider'
        + (options.hover !== false ? ' ol-hover' : '')
        + (options.type ? ' ol-' + options.type : '')
        + (options.className ? ' ' + options.className : '')
    });
    if (options.fixed)
      this.element.classList.add('ol-fixed');

    var input = this.input;
    if (input.parentNode)
      input.parentNode.insertBefore(this.element, input);
    this.element.appendChild(input);
    if (options.align === 'right')
      this.element.classList.add('ol-right');

    var popup = ol_ext_element.create('DIV', {
      className: 'ol-popup',
      parent: this.element
    });
    // Before  element
    if (options.before) {
      ol_ext_element.create('DIV', {
        className: 'ol-before',
        html: options.before,
        parent: popup
      });
    }
    // Slider
    var slider = this.slider = ol_ext_element.create('DIV', {
      className: 'ol-slider',
      parent: popup
    });
    ol_ext_element.create('DIV', {
      className: 'ol-back',
      parent: this.slider
    });
    // Cursor
    var cursor = ol_ext_element.create('DIV', {
      className: 'ol-cursor',
      parent: slider
    });
    // After element
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
    var dstep = 1 / step;

    // Handle popup drag
    this._listenDrag(slider, function (e) {
      var tx = Math.max(0, Math.min(e.offsetX / slider.clientWidth, 1));
      cursor.style.left = Math.max(0, Math.min(100, Math.round(tx * 100))) + '%';
      var v = input.value = Math.round((tx * (max - min) + min) * dstep) / dstep;
      this.dispatchEvent({ type: 'change:value', value: v });
    }.bind(this));

    // Set value
    var setValue = function () {
      var v = parseFloat(input.value) || 0;
      if (!this.get('overflow'))
        v = Math.max(min, Math.min(max, v));
      if (v != input.value)
        input.value = v;
      var tx = (v - min) / (max - min);
      cursor.style.left = Math.max(0, Math.min(100, Math.round(tx * 100))) + '%';
      this.dispatchEvent({ type: 'change:value', value: v });
    }.bind(this);

    input.addEventListener('change', setValue);

    setValue();

  }
}
  
export default ol_ext_input_Slider
