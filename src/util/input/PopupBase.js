import ol_ext_inherits from '../ext'
import ol_ext_element from '../element';
import ol_ext_input_Base from './Base'

/** Base class for input popup
 * @constructor
 * @extends {ol_ext_input_Base}
 * @fires change:color
 * @fires color
 * @param {*} options
 *  @param {string} [options.className]
 *  @param {ol.colorLike} [options.color] default color
 *  @param {Element} [options.input] input element, if non create one
 *  @param {Element} [options.parent] parent element, if create an input
 *  @param {string} [options.position='popup'] fixed | popup | inline (no popup)
 *  @param {boolean} [options.autoClose=true] close when click on color
 *  @param {boolean} [options.hidden=false] display the input
 */
var ol_ext_input_PopupBase = function(options) {
  options = options || {};

  options.hidden = options.hidden!==false;
  ol_ext_input_Base.call(this, options);

  this.set('autoClose', options.autoClose !== false);

  this.element = ol_ext_element.create('DIV', {
    className: ('ol-ext-popup-input '  + (options.className || '')).trim(),
  });
  switch (options.position) {
    case 'inline': break;
    case 'fixed': {
      this.element.classList.add('ol-popup');
      this.element.classList.add('ol-popup-fixed');
      this._fixed = true;
      break;
    }
    default: {
      this.element.classList.add('ol-popup');
      break;
    }
  }

  var input = this.input;
  if (input.parentNode) input.parentNode.insertBefore(this.element, input);

  this.element.addEventListener('click', function() {
    if (this.isCollapsed()) setTimeout( function() { this.collapse(false); }.bind(this) );
  }.bind(this));
  document.addEventListener('click', function() {
    if (!this.moving) this.collapse(true);
  }.bind(this));

  this._elt = {};

  // Popup container
  this._elt.popup = ol_ext_element.create('DIV', { className: 'ol-popup', parent: this.element });
  this._elt.popup.addEventListener('click', function(e) { e.stopPropagation(); });
};
ol_ext_inherits(ol_ext_input_PopupBase, ol_ext_input_Base);


/** show/hide color picker
 * @param {boolean} [b=false]
 */
ol_ext_input_PopupBase.prototype.collapse = function(b) {
  if (b != this.isCollapsed()) {
    this.dispatchEvent({
      type: 'change:visible', 
      visible: !this.isCollapsed()
    });
  }
  this.dispatchEvent({
    type: 'collapse', 
    visible: !b
  });
  if (b) {
    this._elt.popup.classList.remove('ol-visible');
  } else {
    this._elt.popup.classList.add('ol-visible');
    if (this._fixed) {
      var pos = ol_ext_element.positionRect(this.element, true);
      var dh = pos.bottom + this._elt.popup.offsetHeight;
      if (dh > window.innerHeight) {
        this._elt.popup.style.top = Math.max(window.innerHeight - this._elt.popup.offsetHeight, 0) + 'px';
      } else {
        this._elt.popup.style.top = pos.bottom + 'px';
      }
      var dw = pos.left + this._elt.popup.offsetWidth;
      if (dw > window.innerWidth) {
        this._elt.popup.style.left = Math.max(window.innerWidth - this._elt.popup.offsetWidth, 0) + 'px';
      } else {
        this._elt.popup.style.left = pos.left + 'px';
      }
    }
  }
};

/** Is the popup collapsed ?
 * @returns {boolean}
 */
ol_ext_input_PopupBase.prototype.isCollapsed = function() {
  return !this._elt.popup.classList.contains('ol-visible');
};

/** Toggle the popup
 */
ol_ext_input_PopupBase.prototype.toggle = function() {
  this.collapse(!this.isCollapsed());
};

export default ol_ext_input_PopupBase
