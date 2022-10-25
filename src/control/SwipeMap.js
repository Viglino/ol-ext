/*
  Copyright (c) 2015 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_control_Control from 'ol/control/Control.js'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable.js'

/** A control that use a CSS clip rect to swipe the map
 * @classdesc Swipe Control.
 * @fires moving
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} Control options.
 *  @param {string} options.className control class name
 *  @param {number} options.position position property of the swipe [0,1], default 0.5
 *  @param {string} options.orientation orientation property (vertical|horizontal), default vertical
 *  @param {boolean} options.right true to position map on right side (resp. bottom for horizontal orientation), default false
 */
var ol_control_SwipeMap = class olcontrolSwipeMap extends ol_control_Control {
  constructor(options) {
    options = options || {};

    var button = document.createElement('button');

    var element = document.createElement('div');
    element.className = (options.className || "ol-swipe") + " ol-unselectable ol-control";
    super({
      element: element
    });
    
    element.appendChild(button);
    element.addEventListener("mousedown", this.move.bind(this));
    element.addEventListener("touchstart", this.move.bind(this));

    this.on('propertychange', function (e) {
      if (this.get('orientation') === "horizontal") {
        this.element.style.top = this.get('position') * 100 + "%";
        this.element.style.left = "";
      } else {
        if (this.get('orientation') !== "vertical")
          this.set('orientation', "vertical");
        this.element.style.left = this.get('position') * 100 + "%";
        this.element.style.top = "";
      }
      if (e.key === 'orientation') {
        this.element.classList.remove("horizontal", "vertical");
        this.element.classList.add(this.get('orientation'));
      }
      this._clip();
    }.bind(this));
    this.on('change:active', this._clip.bind(this));

    this.set('position', options.position || 0.5);
    this.set('orientation', options.orientation || 'vertical');
    this.set('right', options.right);
  }
  /** Set the map instance the control associated with.
   * @param {ol_Map} map The map instance.
   */
  setMap(map) {
    if (this.getMap()) {
      if (this._listener)
        ol_Observable_unByKey(this._listener);
      var layerDiv = this.getMap().getViewport().querySelector('.ol-layers');
      layerDiv.style.clip = '';
    }

    super.setMap(map);

    if (map) {
      this._listener = map.on('change:size', this._clip.bind(this));
    }
  }
  /** Clip
   * @private
   */
  _clip() {
    if (this.getMap()) {
      var layerDiv = this.getMap().getViewport().querySelector('.ol-layers');
      var rect = this.getRectangle();
      layerDiv.style.clip = 'rect('
        + rect[1] + 'px,' // top
        + rect[2] + 'px,' // right
        + rect[3] + 'px,' // bottom
        + rect[0] + 'px' //left
        + ')';
    }
  }
  /** Get visible rectangle
   * @returns {ol.extent}
   */
  getRectangle() {
    var s = this.getMap().getSize();
    if (this.get('orientation') === 'vertical') {
      if (this.get('right')) {
        return [s[0] * this.get('position'), 0, s[0], s[1]];
      } else {
        return [0, 0, s[0] * this.get('position'), s[1]];
      }
    } else {
      if (this.get('right')) {
        return [0, s[1] * this.get('position'), s[0], s[1]];
      } else {
        return [0, 0, s[0], s[1] * this.get('position')];
      }
    }
  }
  /** @private
  */
  move(e) {
    var self = this;
    var l;
    if (!this._movefn)
      this._movefn = this.move.bind(this);
    switch (e.type) {
      case 'touchcancel':
      case 'touchend':
      case 'mouseup': {
        self.isMoving = false;
        ["mouseup", "mousemove", "touchend", "touchcancel", "touchmove"]
          .forEach(function (eventName) {
            document.removeEventListener(eventName, self._movefn);
          });
        break;
      }
      case 'mousedown':
      case 'touchstart': {
        self.isMoving = true;
        ["mouseup", "mousemove", "touchend", "touchcancel", "touchmove"]
          .forEach(function (eventName) {
            document.addEventListener(eventName, self._movefn);
          });
      }
      // fallthrough
      case 'mousemove':
      case 'touchmove': {
        if (self.isMoving) {
          if (self.get('orientation') === 'vertical') {
            var pageX = e.pageX
              || (e.touches && e.touches.length && e.touches[0].pageX)
              || (e.changedTouches && e.changedTouches.length && e.changedTouches[0].pageX);
            if (!pageX)
              break;
            pageX -= self.getMap().getTargetElement().getBoundingClientRect().left +
              window.pageXOffset - document.documentElement.clientLeft;

            l = self.getMap().getSize()[0];
            var w = l - Math.min(Math.max(0, l - pageX), l);
            l = w / l;
            self.set('position', l);
            self.dispatchEvent({ type: 'moving', size: [w, self.getMap().getSize()[1]], position: [l, 0] });
          } else {
            var pageY = e.pageY
              || (e.touches && e.touches.length && e.touches[0].pageY)
              || (e.changedTouches && e.changedTouches.length && e.changedTouches[0].pageY);
            if (!pageY)
              break;
            pageY -= self.getMap().getTargetElement().getBoundingClientRect().top +
              window.pageYOffset - document.documentElement.clientTop;

            l = self.getMap().getSize()[1];
            var h = l - Math.min(Math.max(0, l - pageY), l);
            l = h / l;
            self.set('position', l);
            self.dispatchEvent({ type: 'moving', size: [self.getMap().getSize()[0], h], position: [0, l] });
          }
        }
        break;
      }
      default: break;
    }
  }
}

export default ol_control_SwipeMap
