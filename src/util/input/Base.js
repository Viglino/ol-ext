/** Vanilla JS geographic inputs
 * color, size, width, font, symboles, dash, arrow, pattern
 */
import ol_ext_inherits from '../ext'
import ol_Object from 'ol/Object'

/** @namespace  ol.ext.input
 */
/*global ol*/
if (window.ol) {
  ol.ext.input = {};
}

/** Abstract base class; normally only used for creating subclasses and not instantiated in apps.    
 * @constructor
 * @extends {ol_Object}
 * @param {Element} input input element
 */
var ol_ext_input_Base = function(input, options) {
  options = options || {};

  ol_Object.call(this);
  
  this.input = input;
  if (options.checked !== undefined) input.checked = !!options.checked;
  if (options.val !== undefined) input.value = !!options.val;
};
ol_ext_inherits(ol_ext_input_Base, ol_Object);

/** Listen to drag event
 * @param {Element} elt 
 * @param {function} cback when draggin on the element
 * @private
 */
ol_ext_input_Base.prototype._listenDrag = function(elt, cback) {
  var handle = function(e) {
    this.moving = true;
    var listen = function(e) {
      if (e.type==='pointerup') {
        document.removeEventListener('pointermove', listen);
        document.removeEventListener('pointerup', listen);
        document.removeEventListener('pointercancel', listen);
        setTimeout(function() {
          this.moving = false;
        }.bind(this));
      }
      if (e.target === elt) cback(e);
      e.stopPropagation();
      e.preventDefault();
    }.bind(this);
    document.addEventListener('pointermove', listen, false);
    document.addEventListener('pointerup', listen, false);
    document.addEventListener('pointercancel', listen, false);
    e.stopPropagation();
    e.preventDefault();
  }.bind(this)
  elt.addEventListener('mousedown', handle, false);
  elt.addEventListener('touchstart', handle, false);
}
export default ol_ext_input_Base
