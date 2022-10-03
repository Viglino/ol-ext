/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_control_Control from 'ol/control/Control.js'
import ol_ext_element from '../util/element.js'

/** A simple gauge control to display level information on the map.
 *
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 *  @param {String} options.className class of the control
 *  @param {String} options.title title of the control
 *  @param {number} options.max maximum value, default 100;
 *  @param {number} options.val the value, default 0
 */
var ol_control_Gauge = class olcontrolGauge extends ol_control_Control {
  constructor(options) {
    options = options || {};
    var element = ol_ext_element.create('DIV', {
      className: ((options.className || "") + ' ol-gauge ol-unselectable ol-control').trim()
    });
    super({
      element: element,
      target: options.target
    });

    this.title_ = ol_ext_element.create('SPAN', {
      parent: element
    });
    var div = ol_ext_element.create('DIV', {
      parent: element
    });
    this.gauge_ = ol_ext_element.create('BUTTON', {
      type: 'button',
      style: { width: '0px' },
      parent: div
    });

    this.setTitle(options.title);
    this.set("max", options.max || 100);
    this.val(options.val);
  }
  /** Set the control title
  * @param {string} title
  */
  setTitle(title) {
    this.title_.innerHTML = title || "";
    if (!title)
      this.title_.display = 'none';
    else
      this.title_.display = '';
  }
  /** Set/get the gauge value
  * @param {number|undefined} v the value or undefined to get it
  * @return {number} the value
  */
  val(v) {
    if (v !== undefined) {
      this.val_ = v;
      this.gauge_.style.width = (v / this.get('max') * 100) + "%";
    }
    return this.val_;
  }
}

export default ol_control_Gauge
