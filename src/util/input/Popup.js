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
        title: option.value,
        className: 'ol-option',
        click: function() {
          this.setValue(option.value);
          popup.style.display = 'none';
          setTimeout(function() { popup.style.display = ''; }, 200);
        }.bind(this),
        parent: this.popup
      })
    })
  });

  this.input.addEventListener('change', function() {
    var v = this.input.value;
    opts.forEach(function(o) {
      if (o.value == v) o.element.classList.add('ol-selected');
      else o.element.classList.remove('ol-selected');
    });
    this.dispatchEvent({ type: 'change:value', value: this.getValue() });
  }.bind(this));
};
ol_ext_inherits(ol_ext_input_Popup, ol_ext_input_Base);

export default ol_ext_input_Popup
