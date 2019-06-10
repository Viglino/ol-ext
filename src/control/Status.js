import ol_ext_inherits from '../util/ext'
import ol_control_Control from 'ol/control/Control'
import ol_ext_element from '../util/element'

/** A control with scroll-driven navigation to create narrative maps
 *
 * @constructor
 * @extends {ol.control.Control}
 * @fires 
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 */
var ol_control_Status = function(options) {
  options = options || {};
  
  // New element
  var element = ol_ext_element.create('DIV', {
    className: (options.className || '') + ' ol-status'
      + (options.target ? '': ' ol-unselectable ol-control')
  });

  // Initialize
  ol_control_Control.call(this, {
    element: element,
    target: options.target
  });
};
ol_ext_inherits(ol_control_Status, ol_control_Control);

/** Show status on the map
 * @param {string|Element} html status text or DOM element
 */
ol_control_Status.prototype.status = function(html) {
  var s = html || '';
  if (typeof(s)==='object' && !(s instanceof String)) {
    s = '';
    for (var i in html) {
      s += '<label>'+i+':</label> '+html[i]+'<br/>';
    }
  }
  ol_ext_element.setHTML(this.element, s);
};

/** Set status position
 * @param {string} position position of the status 'top', 'left', 'bottom' or 'right', default top
 */
ol_control_Status.prototype.setPosition = function(position) {
  this.element.classList.remove('ol-left');
  this.element.classList.remove('ol-right');
  this.element.classList.remove('ol-bottom');
  if (/^left$|^right$|^bottom$/.test(position)) {
    this.element.classList.add('ol-'+position);
  }
};

/** Show the status
 * @param {boolean} show show or hide the control, default true
 */
ol_control_Status.prototype.show = function(show) {
  if (show===false) ol_ext_element.hide(this.element);
  else ol_ext_element.show(this.element);
};

/** Hide the status
 */
ol_control_Status.prototype.hide = function() {
  ol_ext_element.hide(this.element);
};

/** Toggle the status
 */
ol_control_Status.prototype.toggle = function() {
  ol_ext_element.toggle(this.element);
};

/** Is status visible
 */
ol_control_Status.prototype.isShown = function() {
  return this.element.style.display==='none';
};

export default ol_control_Status
