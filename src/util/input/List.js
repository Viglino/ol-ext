import ol_ext_inherits from '../ext'
import ol_ext_element from '../element';
import ol_ext_input_Base from './Base'

/** Checkbox input
 * @constructor
 * @extends {ol_ext_input_Base}
 * @param {*} options
 *  @param {string} [options.className]
 *  @param {Array<Object>} options.options an array of options to place in the popup { html:, title:, value: }
 *  @param {Element} [options.input] input element, if non create one
 *  @param {Element} [options.parent] parent element, if create an input
 *  @param {boolean} [options.hover=false] show popup on hover, default false or true if disabled or hidden
 *  @param {boolean} [options.hidden] the input is display:none
 *  @param {boolean} [options.disabled] disable input
 *  @param {boolean} [options.fixed=false] don't use a popup, default use a popup
 *  @param {string} [options.align=left] align popup left/right/middle
 */
var ol_ext_input_List = function(options) {
  options = options || {};

  ol_ext_input_Base.call(this, options);

  this._content = ol_ext_element.create('DIV');
  if (options.hidden || options.disabled) options.hover = true;
  this.element = ol_ext_element.create('DIV', {
    html: this._content,
    className: 'ol-input-popup' + (options.hover ? ' ol-hover' : '' )
  });
  this.set('hideOnClick', options.hideOnClick !== false);
  if (options.className) this.element.classList.add(options.className);
  if (options.fixed) {
    this.element.classList.add('ol-fixed');
    this.set('hideOnClick', false);
  }
  switch (options.align) {
    case 'middle':
      this.set('hideOnClick', false);
    // fall through
    case 'rigth':
      this.element.classList.add('ol-' + options.align);
      break;
    default: 
      break;
  }
  
  var input = this.input;
  if (input.parentNode) input.parentNode.insertBefore(this.element, input);
  this.element.appendChild(input);

  var popup = this.popup = ol_ext_element.create('UL', {
    className: 'ol-popup',
    parent: this.element
  });
  var opts = [];
  options.options.forEach(option => {
    opts.push({
      value: option.value,
      element: ol_ext_element.create('LI', {
        html: option.html,
        title: option.title || option.value,
        className: 'ol-option',
        on: { 
          pointerdown: function() {
            this.setValue(option.value);
            if (this.get('hideOnClick')) {
              popup.style.display = 'none';
              setTimeout(function() { popup.style.display = ''; }, 200);
            }
          }.bind(this)
        },
        parent: this.popup
      })
    })
  });

  this.input.addEventListener('change', function() {
    var v = this.input.value;
    var val;
    opts.forEach(function(o) {
      if (o.value == v) {
        o.element.classList.add('ol-selected');
        val = o.element;
      } else {
        o.element.classList.remove('ol-selected');
      }
    });
    this.dispatchEvent({ type: 'change:value', value: this.getValue() });
    this._content.innerHTML = val ? val.innerHTML : '';
  }.bind(this));

  // Initial value
  var event = new Event('change');
  setTimeout(function() { this.input.dispatchEvent(event); }.bind(this));
};
ol_ext_inherits(ol_ext_input_List, ol_ext_input_Base);

export default ol_ext_input_List
