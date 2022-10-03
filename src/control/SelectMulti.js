/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_control_SelectBase from './SelectBase.js'
import ol_ext_element from '../util/element.js'

/**
 * A multiselect control. 
 * A container that manage other control Select 
 *
 * @constructor
 * @extends {ol_control_SelectBase}
 * @fires select
 * @param {Object=} options
 *  @param {string} options.className control class name
 *  @param {Element | undefined} options.target Specify a target if you want the control to be rendered outside of the map's viewport.
 *  @param {ol/source/Vector | Array<ol/source/Vector>} options.source the source to search in
 *  @param {Array<ol.control.SelectBase>} options.controls an array of controls
 */
var ol_control_SelectMulti = class olcontrolSelectMulti extends ol_control_SelectBase {
  constructor(options) {
    options = options || {};

    // Container
    options.content = ol_ext_element.create('DIV');
    var container = ol_ext_element.create('UL', {
      parent: options.content
    });

    options.className = options.className || 'ol-select-multi';
    super(options);

    this._container = container;
    this._controls = [];
    options.controls.forEach(this.addControl.bind(this));
  }
  /**
  * Set the map instance the control associated with.
  * @param {o.Map} map The map instance.
  */
  setMap(map) {
    if (this.getMap()) {
      this._controls.forEach(function (c) {
        this.getMap().remveControl(c);
      }.bind(this));
    }
    super.setMap(map);
    if (this.getMap()) {
      this._controls.forEach(function (c) {
        this.getMap().addControl(c);
      }.bind(this));
    }
  }
  /** Add a new control
   * @param {ol.control.SelectBase} c
   */
  addControl(c) {
    if (c instanceof ol_control_SelectBase) {
      this._controls.push(c);
      c.setTarget(ol_ext_element.create('LI', {
        parent: this._container
      }));
      c._selectAll = true;
      c._onchoice = this.doSelect.bind(this);
      if (this.getMap()) {
        this.getMap().addControl(c);
      }
    }
  }
  /** Get select controls
   * @return {Aray<ol.control.SelectBase>}
   */
  getControls() {
    return this._controls;
  }
  /** Select features by condition
   */
  doSelect() {
    var features = [];
    this.getSources().forEach(function (s) {
      features = features.concat(s.getFeatures());
    });
    this._controls.forEach(function (c) {
      features = c.doSelect({ features: features });
    });
    this.dispatchEvent({ type: "select", features: features });
    return features;
  }
}

export default ol_control_SelectMulti
