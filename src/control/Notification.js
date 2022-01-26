/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_control_Control from 'ol/control/Control'
import ol_ext_element from '../util/element';

/** Control overlay for OL3
 * The overlay control is a control that display an overlay over the map
 *
 * @constructor
 * @extends {ol_control_Control}
 * @fire change:visible
 * @param {Object=} options Control options.
 *  @param {string} className class of the control
 *  @param {boolean} options.closeBox add a close button
 *  @param {boolean} options.hideOnClick close dialog when click
 */
var ol_control_Notification = function(options) {
  options = options || {};
	var element = document.createElement('DIV');
  this.contentElement = ol_ext_element.create('DIV', {
    click: function() {
      if (this.get('hideOnClick')) this.hide();
    }.bind(this),
    parent: element
  });

  var classNames = (options.className||"")+ " ol-notification";
	if (!options.target) {
    classNames += " ol-unselectable ol-control ol-collapsed";
  }
	element.setAttribute('class', classNames);

	ol_control_Control.call(this, {
    element: element,
    target: options.target
  });

  this.set('closeBox', options.closeBox);
  this.set('hideOnClick', options.hideOnClick);
};
ol_ext_inherits(ol_control_Notification, ol_control_Control);

/**
 * Display a notification on the map
 * @param {string|node|undefined} what the notification to show, default get the last one
 * @param {number} [duration=3000] duration in ms, if -1 never hide
 */
ol_control_Notification.prototype.show = function(what, duration) {
  var self = this;
  var elt = this.element;
  if (what) {
    if (what instanceof Node) {
      this.contentElement.innerHTML = '';
      this.contentElement.appendChild(what);
    } else {
      this.contentElement.innerHTML = what;
    }
    if (this.get('closeBox')) {
      this.contentElement.classList.add('ol-close')
      ol_ext_element.create('SPAN', {
        className: 'closeBox',
        click: function() { this.hide(); }.bind(this),
        parent: this.contentElement
      })
    } else {
      this.contentElement.classList.remove('ol-close')
    }
  }  

  if (this._listener) {
    clearTimeout(this._listener);
    this._listener = null;
  }
  elt.classList.add('ol-collapsed');
  this._listener = setTimeout(function() {
    elt.classList.remove('ol-collapsed');
    if (!duration || duration >= 0) {
      self._listener = setTimeout(function() {
        elt.classList.add('ol-collapsed');
        self._listener = null;
      }, duration || 3000);
    } else {
      self._listener = null;
    }
  }, 100);
};

/**
 * Remove a notification on the map
 */
ol_control_Notification.prototype.hide = function() {
  if (this._listener) {
    clearTimeout(this._listener);
    this._listener = null;
  }
  this.element.classList.add('ol-collapsed');
};

/**
 * Toggle a notification on the map
 * @param {number} [duration=3000] duration in ms
 */
ol_control_Notification.prototype.toggle = function(duration) {
  if (this.element.classList.contains('ol-collapsed')) {
    this.show(null, duration);
  } else {
    this.hide();
  }
};

export default ol_control_Notification
