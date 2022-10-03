/*	Copyright (c) 2016 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_control_Button from './Button.js'

/** A simple toggle control
 * The control can be created with an interaction to control its activation.
 *
 * @constructor
 * @extends {ol_control_Button}
 * @fires change:active, change:disable
 * @param {Object=} options Control options.
 *  @param {String} options.className class of the control
 *  @param {String} options.title title of the control
 *  @param {String} options.html html to insert in the control
 *  @param {ol.interaction} options.interaction interaction associated with the control
 *  @param {bool} options.active the control is created active, default false
 *  @param {bool} options.disable the control is created disabled, default false
 *  @param {ol.control.Bar} options.bar a subbar associated with the control (drawn when active if control is nested in a ol.control.Bar)
 *  @param {bool} options.autoActive the control will activate when shown in an ol.control.Bar, default false
 *  @param {function} options.onToggle callback when control is clicked (or use change:active event)
 */
var ol_control_Toggle = class olcontrolToggle extends ol_control_Button {
  constructor(options) {
    options = options || {};

    if (options.toggleFn) {
      options.onToggle = options.toggleFn; // compat old version
    }
    options.handleClick = function () {
      self.toggle();
      if (options.onToggle) {
        options.onToggle.call(self, self.getActive());
      }
    };
    options.className = (options.className || '') + ' ol-toggle';
    super(options);

    var self = this;

    this.interaction_ = options.interaction;
    if (this.interaction_) {
      this.interaction_.setActive(options.active);
      this.interaction_.on("change:active", function () {
        self.setActive(self.interaction_.getActive());
      });
    }

    this.set("title", options.title);

    this.set("autoActivate", options.autoActivate);
    if (options.bar)
      this.setSubBar(options.bar);

    this.setActive(options.active);
    this.setDisable(options.disable);
  }
  /**
   * Set the map instance the control is associated with
   * and add interaction attached to it to this map.
   * @param {_ol_Map_} map The map instance.
   */
  setMap(map) {
    if (!map && this.getMap()) {
      if (this.interaction_) {
        this.getMap().removeInteraction(this.interaction_);
      }
      if (this.subbar_)
        this.getMap().removeControl(this.subbar_);
    }

    super.setMap(map);

    if (map) {
      if (this.interaction_)
        map.addInteraction(this.interaction_);
      if (this.subbar_)
        map.addControl(this.subbar_);
    }
  }
  /** Get the subbar associated with a control
   * @return {ol_control_Bar}
   */
  getSubBar() {
    return this.subbar_;
  }
  /** Set the subbar associated with a control
   * @param {ol_control_Bar} [bar] a subbar if none remove the current subbar
   */
  setSubBar(bar) {
    var map = this.getMap();
    if (map && this.subbar_)
      map.removeControl(this.subbar_);
    this.subbar_ = bar;
    if (bar) {
      this.subbar_.setTarget(this.element);
      this.subbar_.element.classList.add("ol-option-bar");
      if (map)
        map.addControl(this.subbar_);
    }
  }
  /**
   * Test if the control is disabled.
   * @return {bool}.
   * @api stable
   */
  getDisable() {
    var button = this.element.querySelector("button");
    return button && button.disabled;
  }
  /** Disable the control. If disable, the control will be deactivated too.
  * @param {bool} b disable (or enable) the control, default false (enable)
  */
  setDisable(b) {
    if (this.getDisable() == b)
      return;
    this.element.querySelector("button").disabled = b;
    if (b && this.getActive())
      this.setActive(false);

    this.dispatchEvent({ type: 'change:disable', key: 'disable', oldValue: !b, disable: b });
  }
  /**
   * Test if the control is active.
   * @return {bool}.
   * @api stable
   */
  getActive() {
    return this.element.classList.contains("ol-active");
  }
  /** Toggle control state active/deactive
   */
  toggle() {
    if (this.getActive())
      this.setActive(false);
    else
      this.setActive(true);
  }
  /** Change control state
   * @param {bool} b activate or deactivate the control, default false
   */
  setActive(b) {
    if (this.interaction_)
      this.interaction_.setActive(b);
    if (this.subbar_)
      this.subbar_.setActive(b);
    if (this.getActive() === b)
      return;
    if (b)
      this.element.classList.add("ol-active");
    else
      this.element.classList.remove("ol-active");

    this.dispatchEvent({ type: 'change:active', key: 'active', oldValue: !b, active: b });
  }
  /** Set the control interaction
  * @param {_ol_interaction_} i interaction to associate with the control
  */
  setInteraction(i) {
    this.interaction_ = i;
  }
  /** Get the control interaction
  * @return {_ol_interaction_} interaction associated with the control
  */
  getInteraction() {
    return this.interaction_;
  }
}

export default ol_control_Toggle
