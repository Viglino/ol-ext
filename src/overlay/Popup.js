/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_Overlay from 'ol/Overlay'
import ol_ext_element from '../util/element'


/**
 * @classdesc
 * A popup element to be displayed over the map and attached to a single map
 * location. The popup are customized using CSS.
 *
 * @example
var popup = new ol_Overlay_Popup();
map.addOverlay(popup);
popup.show(coordinate, "Hello!");
popup.hide();
*
* @constructor
* @extends {ol_Overlay}
* @param {} options Extend Overlay options 
*	@param {String} options.popupClass the a class of the overlay to style the popup.
*	@param {bool} options.closeBox popup has a close box, default false.
*	@param {function|undefined} options.onclose: callback function when popup is closed
*	@param {function|undefined} options.onshow callback function when popup is shown
*	@param {Number|Array<number>} options.offsetBox an offset box
*	@param {ol.OverlayPositioning | string | undefined} options.positioning 
*		the 'auto' positioning var the popup choose its positioning to stay on the map.
* @api stable
*/
var ol_Overlay_Popup = function (options) {
  var self = this;
  options = options || {};
  
  if (typeof(options.offsetBox)==='number') this.offsetBox = [options.offsetBox,options.offsetBox,options.offsetBox,options.offsetBox];
  else this.offsetBox = options.offsetBox;

  // Popup div
  var element = document.createElement("div");
  //element.classList.add('ol-overlaycontainer-stopevent');
  options.element = element;
  // Anchor div
  var anchorElement = document.createElement("div");
  anchorElement.classList.add("anchor");
  element.appendChild(anchorElement);

  // Content
  this.content = ol_ext_element.create("div", { 
    html: options.html || '',
    className: "ol-popup-content",
    parent: element
  });
  // Closebox
  this.closeBox = options.closeBox;
  this.onclose = options.onclose;
  this.onshow = options.onshow;
  var button = document.createElement("button");
  button.classList.add("closeBox");
  if (options.closeBox) button.classList.add('hasclosebox');
  button.setAttribute('type', 'button');
  element.insertBefore(button, anchorElement);
  button.addEventListener("click", function() {
    self.hide();
  });
  // Stop event
  if (options.stopEvent) {
    element.addEventListener("mousedown", function(e){ e.stopPropagation(); });
    element.addEventListener("touchstart", function(e){ e.stopPropagation(); });
  }

  ol_Overlay.call(this, options);
  this._elt = this.element;

  // call setPositioning first in constructor so getClassPositioning is called only once
  this.setPositioning(options.positioning || 'auto');
  this.setPopupClass(options.popupClass || options.className || 'default');

  // Show popup on timeout (for animation purposes)
  if (options.position) {
    setTimeout(function(){ this.show(options.position); }.bind(this));
  }
};
ol_ext_inherits(ol_Overlay_Popup, ol_Overlay);

/**
 * Get CSS class of the popup according to its positioning.
 * @private
 */
ol_Overlay_Popup.prototype.getClassPositioning = function () {
  var c = "";
  var pos = this.getPositioning();
  if (/bottom/.test(pos)) c += "ol-popup-bottom ";
  if (/top/.test(pos)) c += "ol-popup-top ";
  if (/left/.test(pos)) c += "ol-popup-left ";
  if (/right/.test(pos)) c += "ol-popup-right ";
  if (/^center/.test(pos)) c += "ol-popup-middle ";
  if (/center$/.test(pos)) c += "ol-popup-center ";
  return c;
};

/**
 * Set a close box to the popup.
 * @param {bool} b
 * @api stable
 */
ol_Overlay_Popup.prototype.setClosebox = function (b) {
  this.closeBox = b;
  if (b) this._elt.classList.add("hasclosebox");
  else this._elt.classList.remove("hasclosebox");
};

/**
 * Set the CSS class of the popup.
 * @param {string} c class name.
 * @api stable
 */
ol_Overlay_Popup.prototype.setPopupClass = function (c) {
  this._elt.className = "";
    var classesPositioning = this.getClassPositioning().split(' ')
      .filter(function(className) {
        return className.length > 0;
      });
    var classes = ["ol-popup"];
    if (c) {
      c.split(' ').filter(function(className) {
        return className.length > 0;
      })
      .forEach(function(className) {
        classes.push(className);
      });
    } else {
      classes.push("default");
    }
      classesPositioning.forEach(function(className) {
        classes.push(className);
      });
    if (this.closeBox) {
      classes.push("hasclosebox");
    }
    this._elt.classList.add.apply(this._elt.classList, classes);
};

/**
 * Add a CSS class to the popup.
 * @param {string} c class name.
 * @api stable
 */
ol_Overlay_Popup.prototype.addPopupClass = function (c) {
  this._elt.classList.add(c);
};

/**
 * Remove a CSS class to the popup.
 * @param {string} c class name.
 * @api stable
 */
ol_Overlay_Popup.prototype.removePopupClass = function (c) {
  this._elt.classList.remove(c);
};

/**
 * Set positionning of the popup
 * @param {ol.OverlayPositioning | string | undefined} pos an ol.OverlayPositioning 
 * 		or 'auto' to var the popup choose the best position
 * @api stable
 */
ol_Overlay_Popup.prototype.setPositioning = function (pos) {
  if (pos === undefined)
    return;
  if (/auto/.test(pos)) {
    this.autoPositioning = pos.split('-');
    if (this.autoPositioning.length==1) this.autoPositioning[1]="auto";
  }
  else this.autoPositioning = false;
  pos = pos.replace(/auto/g,"center");
  if (pos=="center") pos = "bottom-center";
  this.setPositioning_(pos);
};

/** @private
 * @param {ol.OverlayPositioning | string | undefined} pos
 */
ol_Overlay_Popup.prototype.setPositioning_ = function (pos) {
  if (this._elt) {
    ol_Overlay.prototype.setPositioning.call(this, pos);
    this._elt.classList.remove("ol-popup-top", "ol-popup-bottom", "ol-popup-left", "ol-popup-right", "ol-popup-center", "ol-popup-middle");
    var classes = this.getClassPositioning().split(' ')
      .filter(function(className) {
        return className.length > 0;
      });
    this._elt.classList.add.apply(this._elt.classList, classes);
  }
};

/** Check if popup is visible
* @return {boolean}
*/
ol_Overlay_Popup.prototype.getVisible = function () {
  return this._elt.classList.contains("visible");
};

/**
 * Set the position and the content of the popup.
 * @param {ol.Coordinate|string} coordinate the coordinate of the popup or the HTML content.
 * @param {string|undefined} html the HTML content (undefined = previous content).
 * @example
var popup = new ol_Overlay_Popup();
// Show popup
popup.show([166000, 5992000], "Hello world!");
// Move popup at coord with the same info
popup.show([167000, 5990000]);
// set new info
popup.show("New informations");
* @api stable
*/
ol_Overlay_Popup.prototype.show = function (coordinate, html) {
  if (!html && typeof(coordinate)=='string') {
    html = coordinate; 
    coordinate = null;
  }
  if (coordinate===true) {
    coordinate = this.getPosition();
  }
  
  var self = this;
  var map = this.getMap();
  if (!map) return;
  
  if (html && html !== this.prevHTML) {
    // Prevent flickering effect
    this.prevHTML = html;
    this.content.innerHTML = "";
    if (html instanceof Element) {
      this.content.appendChild(html);
    } else {
      this.content.insertAdjacentHTML('beforeend', html);
    }
    // Refresh when loaded (img)
    Array.prototype.slice.call(this.content.querySelectorAll('img'))
      .forEach(function(image) {
        image.addEventListener("load", function() {
          map.renderSync();
        });
      });
  }

  if (coordinate) {
    // Auto positionning
    if (this.autoPositioning) {
      var p = map.getPixelFromCoordinate(coordinate);
      var s = map.getSize();
      var pos=[];
      if (this.autoPositioning[0]=='auto') {
        pos[0] = (p[1]<s[1]/3) ? "top" : "bottom";
      }
      else pos[0] = this.autoPositioning[0];
      pos[1] = (p[0]<2*s[0]/3) ? "left" : "right";
      this.setPositioning_(pos[0]+"-"+pos[1]);
      if (this.offsetBox) {
        this.setOffset([this.offsetBox[pos[1]=="left"?2:0], this.offsetBox[pos[0]=="top"?3:1] ]);
      }
    } else {
      if (this.offsetBox){
        this.setOffset(this.offsetBox);
      }
    }
    // Show
    this.setPosition(coordinate);
    // Set visible class (wait to compute the size/position first)
    this._elt.parentElement.style.display = '';
    if (typeof (this.onshow) == 'function') this.onshow();
    this._tout = setTimeout (function() {
      self._elt.classList.add("visible"); 
    }, 0);
  }
};

/**
 * Hide the popup
 * @api stable
 */
ol_Overlay_Popup.prototype.hide = function () {
  if (this.getPosition() == undefined) return;
  if (typeof (this.onclose) == 'function') this.onclose();
  this.setPosition(undefined);
  if (this._tout) clearTimeout(this._tout);
  this._elt.classList.remove("visible");
};

export  default ol_Overlay_Popup
