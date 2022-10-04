import ol_ext_element from '../element.js';
import ol_ext_input_Base from './Base.js'

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
 *  @param {string} [options.position='popup'] fixed | static | popup | inline (no popup)
 *  @param {boolean} [options.autoClose=true] close when click on color
 *  @param {boolean} [options.hidden=false] display the input
 */
var ol_ext_input_PopupBase = class olextinputPopupBase extends ol_ext_input_Base {
  constructor(options) {
    options = options || {};

    options.hidden = options.hidden !== false;
    super(options);

    this.set('autoClose', options.autoClose !== false);

    this.element = ol_ext_element.create('DIV', {
      className: ('ol-ext-popup-input ' + (options.className || '')).trim(),
    });
    switch (options.position) {
      case 'inline': break;
      case 'static':
      case 'fixed': {
        this.element.classList.add('ol-popup');
        this.element.classList.add('ol-popup-fixed');
        this._fixed = (options.position === 'fixed');
        break;
      }
      default: {
        this.element.classList.add('ol-popup');
        break;
      }
    }

    var input = this.input;
    if (input.parentNode)
      input.parentNode.insertBefore(this.element, input);

    // Show on element click
    this.element.addEventListener('click', function () {
      if (this.isCollapsed())
        setTimeout(function () { this.collapse(false); }.bind(this));
    }.bind(this));

    this._elt = {};
    // Popup container
    this._elt.popup = ol_ext_element.create('DIV', { className: 'ol-popup', parent: this.element });
    this._elt.popup.addEventListener('click', function (e) { e.stopPropagation(); });

    // Hide on click outside
    var down = false;
    this._elt.popup.addEventListener('pointerdown', function () {
      down = true;
    });
    this._elt.popup.addEventListener('click', function () {
      down = false;
    });
    document.addEventListener('click', function () {
      if (!this.moving && !down)
        this.collapse(true);
      down = false;
    }.bind(this));

    // Hide on window resize
    window.addEventListener('resize', function () {
      this.collapse(true);
    }.bind(this));
  }
  /** show/hide color picker
   * @param {boolean} [b=false]
   */
  collapse(b) {
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
        // Get fixed position
        var pos = this.element.getBoundingClientRect();
        var offset = ol_ext_element.getFixedOffset(this.element);
        pos = {
          bottom: pos.bottom - offset.top,
          left: pos.left - offset.left
        };
        // Test window overflow + recenter
        var dh = pos.bottom + this._elt.popup.offsetHeight + offset.top;
        if (dh > document.documentElement.clientHeight) {
          this._elt.popup.style.top = Math.max(document.documentElement.clientHeight - this._elt.popup.offsetHeight - offset.top, 0) + 'px';
        } else {
          this._elt.popup.style.top = pos.bottom + 'px';
        }
        var dw = pos.left + this._elt.popup.offsetWidth + offset.left;
        if (dw > document.documentElement.clientWidth) {
          this._elt.popup.style.left = Math.max(document.documentElement.clientWidth - this._elt.popup.offsetWidth - offset.left, 0) + 'px';
        } else {
          this._elt.popup.style.left = pos.left + 'px';
        }
      }
    }
  }
  /** Is the popup collapsed ?
   * @returns {boolean}
   */
  isCollapsed() {
    return !this._elt.popup.classList.contains('ol-visible');
  }
  /** Toggle the popup
   */
  toggle() {
    this.collapse(!this.isCollapsed());
  }
}

export default ol_ext_input_PopupBase
