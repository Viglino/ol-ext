import {inherits as ol_inherits} from 'ol'
import ol_control_Control from 'ol/control/Control'
import ol_has_TOUCH from 'ol/has'
import ol_ext_element from '../util/element'

/** A control with scroll-driven navigation to create narrative maps
 *
 * @constructor
 * @extends {ol.control.Control}
 * @fires 
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 */
var ol_control_Storymap = function(options) {

  var element = ol_ext_element.create('DIV', {
    className: (options.className || '') + ' ol-storymap'
      + (options.target ? '': ' ol-unselectable ol-control')
      + (ol_has_TOUCH ? ' ol-touch' : ''),
    html: options.html || ''
  });


  // Initialize
  ol_control_Control.call(this, {
    element: element,
    target: options.target
  });

  var currentDiv = this.element.querySelectorAll('.step')[0];
  setTimeout (function (){
    this.dispatchEvent({ type: 'current', element: currentDiv, name: currentDiv.getAttribute('name') });
  }.bind(this));

  this.element.addEventListener("scroll", function(e) {
    var current, step = this.element.querySelectorAll('.step');
    var height = ol_ext_element.getStyle(this.element, 'height');
    for (var i=0, s; s=step[i]; i++) {
      var p = s.offsetTop - this.element.scrollTop;
      if (p > height/3) break;
      current = s;
    }
    if (current && current!==currentDiv) {
      currentDiv = current;
      this.dispatchEvent({ type: 'current', element: currentDiv, name: currentDiv.getAttribute('name') });
    }
  }.bind(this));

  
};
ol_inherits(ol_control_Storymap, ol_control_Control);

export default ol_control_Storymap