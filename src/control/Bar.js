/*	Copyright (c) 2016 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_ext_inherits from '../util/ext'
import ol_control_Control from 'ol/control/Control'

/** Control bar for OL3
 * The control bar is a container for other controls. It can be used to create toolbars.
 * Control bars can be nested and combined with ol.control.Toggle to handle activate/deactivate.
 * @class
 * @constructor
 * @extends ol_control_Control
 * @param {Object=} options Control options.
 *  @param {String} options.className class of the control
 *  @param {boolean} options.group is a group, default false
 *  @param {boolean} options.toggleOne only one toggle control is active at a time, default false
 *  @param {boolean} options.autoDeactivate used with subbar to deactivate all control when top level control deactivate, default false
 *  @param {Array<ol_control_Control> } options.controls a list of control to add to the bar
 */
var ol_control_Bar = function(options) {
  if (!options) options={};
  var element = document.createElement("div");
      element.classList.add('ol-unselectable', 'ol-control', 'ol-bar');
  if (options.className) {
    var classes = options.className.split(' ').filter(function(className) {
      return className.length > 0;
    });
    element.classList.add.apply(element.classList, classes)
  }
  if (options.group) element.classList.add('ol-group');

  ol_control_Control.call(this, {
    element: element,
    target: options.target
  });

  this.set('toggleOne', options.toggleOne);
  this.set('autoDeactivate', options.autoDeactivate);

  this.controls_ = [];
  if (options.controls instanceof Array) {
    for (var i=0; i<options.controls.length; i++) {
      this.addControl(options.controls[i]);
    }
  }
};
ol_ext_inherits(ol_control_Bar, ol_control_Control);

/** Set the control visibility
 * @param {boolean} val
 */
ol_control_Bar.prototype.setVisible = function (val) {
  if (val) this.element.style.display = '';
  else this.element.style.display = 'none';
}

/** Get the control visibility
 * @return {boolean} b
 */
ol_control_Bar.prototype.getVisible = function () {
  return this.element.style.display != 'none';
}

/**
 * Set the map instance the control is associated with
 * and add its controls associated to this map.
 * @param {ol_Map} map The map instance.
 */
ol_control_Bar.prototype.setMap = function (map) {
  ol_control_Control.prototype.setMap.call(this, map);

  for (var i=0; i<this.controls_.length; i++) {
    var c = this.controls_[i];
    // map.addControl(c);
    c.setMap(map);
  }
};

/** Get controls in the panel
 *	@param {Array<ol_control_Control>}
 */
ol_control_Bar.prototype.getControls = function () {
  return this.controls_;
};

/** Set tool bar position
 * @param {string} pos a combinaison of top|left|bottom|right
 */
ol_control_Bar.prototype.setPosition = function (pos) {
  this.element.classList.remove('ol-left', 'ol-top', 'ol-bottom', 'ol-right');
  pos = pos.split ('-');
  for (var i=0; i<pos.length; i++) {
    switch (pos[i]) {
      case 'top':
      case 'left':
      case 'bottom':
      case 'right':
        this.element.classList.add("ol-"+pos[i]);
        break;
      default: break;
    }
  }
};

/** Add a control to the bar
 *	@param {ol_control_Control} c control to add
 */
ol_control_Bar.prototype.addControl = function (c) {
  this.controls_.push(c);
  c.setTarget(this.element);
  if (this.getMap()) {
    this.getMap().addControl(c);
  }
  // Activate and toogleOne
  c.on ('change:active', function(e) { this.onActivateControl_(e, c); }.bind(this));
  if (c.getActive) {
    // c.dispatchEvent({ type:'change:active', key:'active', oldValue:false, active:true });
    this.onActivateControl_({ target: c, active: c.getActive() }, c);
  }
};

/** Deativate all controls in a bar
 * @param {ol_control_Control} [except] a control
 */
ol_control_Bar.prototype.deactivateControls = function (except) {
  for (var i=0; i<this.controls_.length; i++) {
  if (this.controls_[i] !== except && this.controls_[i].setActive) {
      this.controls_[i].setActive(false);
    }
  }
};

/** Get active control in the bar
 * @returns {Array<ol_control_Control>}
 */
ol_control_Bar.prototype.getActiveControls = function () {
  var active = [];
  for (var i=0, c; c=this.controls_[i]; i++) {
    if (c.getActive && c.getActive()) active.push(c);
  }
  return active;
}

/** Auto activate/deactivate controls in the bar
 * @param {boolean} b activate/deactivate
 */
ol_control_Bar.prototype.setActive = function (b) {
  if (!b && this.get("autoDeactivate")) {
    this.deactivateControls();
  }
  if (b) {
    var ctrls = this.getControls();
    for (var i=0, sb; (sb = ctrls[i]); i++) {
      if (sb.get("autoActivate")) sb.setActive(true);
    }
  }
}

/** Post-process an activated/deactivated control
 *	@param {ol.event} e :an object with a target {_ol_control_} and active flag {bool}
 */
ol_control_Bar.prototype.onActivateControl_ = function (e, ctrl) {
  if (this.get('toggleOne')) {
    if (e.active) {
      var n;
      //var ctrl = e.target;
      for (n=0; n<this.controls_.length; n++) {
        if (this.controls_[n]===ctrl) break;
      }
      // Not here!
      if (n==this.controls_.length) return;
      this.deactivateControls (this.controls_[n]);
    } else {
      // No one active > test auto activate
      if (!this.getActiveControls().length) {
        for (var i=0, c; c=this.controls_[i]; i++) {
          if (c.get("autoActivate")) {
            c.setActive(true);
            break;
          }
        }
      }
    }
  }
};

/**
 * @param {string} name of the control to search
 * @return {ol.control.Control}
 */
ol_control_Bar.prototype.getControlsByName = function(name) {
  var controls = this.getControls();
  return controls.filter(
    function(control) {
      return (control.get('name') === name);
    }
  );
};

export default ol_control_Bar
