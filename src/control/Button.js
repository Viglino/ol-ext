/*	Copyright (c) 2016 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_ext_inherits from '../util/ext'
import ol_control_Control from 'ol/control/Control'

import ol_ext_element from '../util/element'

/** A simple push button control
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options.
 *  @param {String} options.className class of the control
 *  @param {String} options.title title of the control
 *  @param {String} options.name an optional name, default none
 *  @param {String} options.html html to insert in the control
 *  @param {function} options.handleClick callback when control is clicked (or use change:active event)
 */
var ol_control_Button = function(options){
  options = options || {};

  var element = document.createElement("div");
  element.className = (options.className || '') + " ol-button ol-unselectable ol-control";
  var self = this;

  var bt = this.button_ = document.createElement(/ol-text-button/.test(options.className) ? "div": "button");
  bt.type = "button";
  if (options.title) bt.title = options.title;
  if (options.name) bt.name = options.name;
  if (options.html instanceof Element) bt.appendChild(options.html)
  else bt.innerHTML = options.html || "";
  var evtFunction = function(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (options.handleClick) {
      options.handleClick.call(self, e);
    }
  };
  bt.addEventListener("click", evtFunction);
  // bt.addEventListener("touchstart", evtFunction);
  element.appendChild(bt);

  // Try to get a title in the button content
  if (!options.title && bt.firstElementChild) {
    bt.title = bt.firstElementChild.title;
  }

  ol_control_Control.call(this, {
    element: element,
    target: options.target
  });

  if (options.title) {
    this.set("title", options.title);
  }
  if (options.title) this.set("title", options.title);
  if (options.name) this.set("name", options.name);
};
ol_ext_inherits(ol_control_Button, ol_control_Control);

/** Set the control visibility
* @param {boolean} b 
*/
ol_control_Button.prototype.setVisible = function (val) {
  if (val) ol_ext_element.show(this.element);
  else ol_ext_element.hide(this.element);
};

/**
 * Set the button title
 * @param {string} title
 */
ol_control_Button.prototype.setTitle = function(title) {
  this.button_.setAttribute('title', title);
};

/**
 * Set the button html
 * @param {string} html
 */
ol_control_Button.prototype.setHtml = function(html) {
  ol_ext_element.setHTML (this.button_, html);
};

/**
 * Get the button element
 * @returns {Element}
 */
ol_control_Button.prototype.getButtonElement = function() {
  return this.button_;
};

export default ol_control_Button
