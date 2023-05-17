/** Vanilla JS geographic inputs
 * color, size, width, font, symboles, dash, arrow, pattern
 */
import ol_Object from 'ol/Object.js'

/** Abstract base class; normally only used for creating subclasses and not instantiated in apps.    
 * @constructor
 * @extends {ol_Object}
 * @param {*} options
 *  @param {Element} [options.input] input element, if none create one
 *  @param {string} [options.type] input type, if no input
 *  @param {number} [options.min] input min, if no input
 *  @param {number} [options.max] input max, if no input
 *  @param {number} [options.step] input step, if no input
 *  @param {string|number} [options.val] input value
 *  @param {boolean} [options.checked] check input
 *  @param {boolean} [options.hidden] the input is display:none
 *  @param {boolean} [options.disabled] disable input
 *  @param {Element} [options.parent] parent element, if no input
 */
var ol_ext_input_Base = class olextinputBase extends ol_Object {
  constructor(options) {
    options = options || {};
    super();

    var input = this.input = options.input;
    if (!input) {
      input = this.input = document.createElement('INPUT');
      if (options.type)
        input.setAttribute('type', options.type);
      if (options.min !== undefined)
        input.setAttribute('min', options.min);
      if (options.max !== undefined)
        input.setAttribute('max', options.max);
      if (options.step !== undefined)
        input.setAttribute('step', options.step);
      if (options.parent)
        options.parent.appendChild(input);
    }
    if (options.disabled)
      input.disabled = true;
    if (options.checked !== undefined)
      input.checked = !!options.checked;
    if (options.val !== undefined)
      input.value = options.val;
    if (options.hidden)
      input.style.display = 'none';
    input.addEventListener('focus', function () {
      if (this.element)
        this.element.classList.add('ol-focus');
    }.bind(this));
    var tout;
    input.addEventListener('focusout', function () {
      if (this.element) {
        if (tout)
          clearTimeout(tout);
        tout = setTimeout(function () {
          this.element.classList.remove('ol-focus');
        }.bind(this), 0);
      }
    }.bind(this));
  }
  /** Listen to drag event
   * @param {Element} elt
   * @param {function} cback when draggin on the element
   * @private
   */
  _listenDrag(elt, cback) {
    var handle = function (e) {
      this.moving = true;
      this.element.classList.add('ol-moving');
      var listen = function (e) {
        if (e.type === 'pointerup') {
          document.removeEventListener('pointermove', listen);
          document.removeEventListener('pointerup', listen);
          document.removeEventListener('pointercancel', listen);
          setTimeout(function () {
            this.moving = false;
            this.element.classList.remove('ol-moving');
          }.bind(this));
        }
        if (e.target === elt)
          cback(e);
        e.stopPropagation();
        e.preventDefault();
      }.bind(this);
      document.addEventListener('pointermove', listen, false);
      document.addEventListener('pointerup', listen, false);
      document.addEventListener('pointercancel', listen, false);
      e.stopPropagation();
      e.preventDefault();
    }.bind(this);
    elt.addEventListener('mousedown', handle, false);
    elt.addEventListener('touchstart', handle, false);
  }
  /** Set the current value
   */
  setValue(v) {
    if (v !== undefined)
      this.input.value = v;
    this.input.dispatchEvent(new Event('change'));
  }
  /** Get the current getValue
   * @returns {string}
   */
  getValue() {
    return this.input.value;
  }
  /** Get the input element
   * @returns {Element}
   */
  getInputElement() {
    return this.input;
  }
}

export default ol_ext_input_Base
