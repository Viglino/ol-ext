/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_ext_element from '../util/element'

/**
 * A popup element to be displayed over the map and attached to a single map
 * location. The popup are customized using CSS.
 *
 * @constructor
 * @extends {ol_Overlay_Popup}
 * @fires show
 * @fires hide
 * @param {} options Extend Overlay options 
 *	@param {String} options.popupClass the a class of the overlay to style the popup.
 *	@param {ol.style.Style} options.style a style to style the link on the map.
 *	@param {bool} options.closeBox popup has a close box, default false.
 *	@param {function|undefined} options.onclose: callback function when popup is closed
 *	@param {function|undefined} options.onshow callback function when popup is shown
 *	@param {Number|Array<number>} options.offsetBox an offset box
 *	@param {ol.OverlayPositioning | string | undefined} options.positioning 
 *		the 'auto' positioning var the popup choose its positioning to stay on the map.
 * @api stable
 */
var ol_Overlay_FixedPopup = function (options) {
  options.anchor = false;
  options.positioning = options.positioning || 'center-center';
  options.className = (options.className || '') + ' ol-fixPopup';
  ol_Overlay_Popup.call(this, options);

  var canvas = document.createElement('canvas');
   
  this._overlay = new ol_layer_Image({
    source: new ol_source_ImageCanvas({
      canvasFunction: function(extent, res, ratio, size, proj) {
        canvas.width  = size[0];
        canvas.height = size[1];
        return canvas
      }
    })
  });
  this._style = options.style || new ol_style_Style({
    fill: new ol_style_Fill({ color: [102,153,255] })
  });

  this._overlay.on(['postcompose','postrender'], function(e) {
    if (this.getVisible() && this._pixel) {
      var map = this.getMap();
      var position = this.getPosition();
      var pixel = map.getPixelFromCoordinate(position);
      var r1 = this.element.getBoundingClientRect()
      var r2 = this.getMap().getTargetElement().getBoundingClientRect();
      var pixel2 = [r1.left-r2.left+r1.width/2, r1.top-r2.top+r1.height/2]
      var ratio = e.frameState.pixelRatio;
      e.context.save();
        e.context.scale(ratio,ratio);
        e.context.beginPath();
        e.context.moveTo(pixel[0], pixel[1]);
        if (Math.abs(pixel2[0]-pixel[0]) > Math.abs(pixel2[1]-pixel[1])) {
          e.context.lineTo(pixel2[0],pixel2[1]-8);
          e.context.lineTo(pixel2[0],pixel2[1]+8);
        } else {
          e.context.lineTo(pixel2[0]-8,pixel2[1]);
          e.context.lineTo(pixel2[0]+8,pixel2[1]);
        }
        e.context.moveTo(pixel[0], pixel[1]);
        if (this._style.getFill()) {
          e.context.fillStyle = ol_color_asString(this._style.getFill().getColor());
          e.context.fill();
        }
        if (this._style.getStroke()) {
          e.context.strokeStyle = ol_color_asString(this._style.getStroke().getColor());
          e.context.lineWidth = this._style.getStroke().width();
          e.context.stroke();
        }
      e.context.restore();
    }
  }.bind(this));
  var update = function() { 
    this.setPixelPosition();
  }.bind(this);
  this.on(['hide', 'show'], function() {
    setTimeout(update)
  }.bind(this))

  // Get events centroid
  function centroid(pevents) {
    var clientX = 0;
    var clientY = 0;
    var length = 0;
    for (var i in pevents) {
      clientX += pevents[i].clientX;
      clientY += pevents[i].clientY;
      length++;
    }
    return [clientX / length, clientY / length];
  }
  // Get events angle
  function angle(pevents) {
    var v = Object.keys(pevents);
    if (v.length<2) return false;
    var touch0 = pevents[v[0]];
    var touch1 = pevents[v[1]];
    return Math.atan2(touch1.clientY - touch0.clientY, touch1.clientX - touch0.clientX) * 180 / Math.PI;
  }

  // Handle popup move
  var pointerEvents = {};
  var pointerEvents2 = {};
  var pixelPosition = [];
  var angleIni, rotIni, move;
  this.element.addEventListener('pointerdown', function(e) {
    e.preventDefault();
    e.stopPropagation();
    pointerEvents[e.pointerId] = e;
    pixelPosition = this._pixel;
    rotIni = this.get('rotation');
    angleIni = angle(pointerEvents) || 0;
    move = false;
  }.bind(this));
  this.element.addEventListener('click', function(e) {
    // Prevent click
    if (move) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
  var removePointer = function(e) {
    if (pointerEvents[e.pointerId]) {
      delete pointerEvents[e.pointerId];
      e.preventDefault();
    }
    if (pointerEvents2[e.pointerId]) {
      delete pointerEvents2[e.pointerId];
    }
  }.bind(this);
  document.addEventListener('pointerup', removePointer);
  document.addEventListener('pointercancel', removePointer);
  document.addEventListener('pointermove', function(e) {
    if (pointerEvents[e.pointerId]) {
      e.preventDefault();
      pointerEvents2[e.pointerId] = e;
      var c1 = centroid(pointerEvents);
      var c2 = centroid(pointerEvents2);
      var dx = c2[0] - c1[0];
      var dy = c2[1] - c1[1];
      move = move || (Math.abs(dx) < 3 && Math.abs(dy) < 3);
      this.setPixelPosition([pixelPosition[0]+dx, pixelPosition[1]+dy]);
      var a = angle(pointerEvents2);
      if (a!==false && angleIni!==false) {
        this.setRotation(rotIni + a - angleIni);
      }
    }
  }.bind(this));
};
ol_ext_inherits(ol_Overlay_FixedPopup, ol_Overlay_Popup);

/**
 * Set the map instance the control is associated with
 * and add its controls associated to this map.
 * @param {_ol_Map_} map The map instance.
 */
ol_Overlay_FixedPopup.prototype.setMap = function (map) {
  ol_Overlay_Popup.prototype.setMap.call(this, map);
  this._overlay.setMap(this.getMap());
  if (this._listener) {
    ol_Observable_unByKey(this._listener);
  }
  if (map) {
    // Force popup inside the viewport
    this._listener = map.on('change:size', function() {
      this.setPixelPosition();
    }.bind(this))
  }
};

/** Update pixel position
 * @return {boolean}
 * @private
 */
ol_Overlay_FixedPopup.prototype.updatePixelPosition = function () {
  var map = this.getMap();
  var position = this.getPosition();
  if (!map || !map.isRendered() || !position) {
      this.setVisible(false);
      return;
  }
  if (!this._pixel) {
    this._pixel = map.getPixelFromCoordinate(position);
    var mapSize = map.getSize();
    this.updateRenderedPosition(this._pixel, mapSize);
  } else {
    this.setVisible(true);
  }
};

/** updateRenderedPosition
 * @private
 */
ol_Overlay_FixedPopup.prototype.updateRenderedPosition = function (pixel, mapsize) {
  ol_Overlay_Popup.prototype.updateRenderedPosition.call(this, pixel, mapsize);
  this.setRotation();
};

/** Set pixel position
 * @param {ol.pixel} pix
 * @param {string} position top/bottom/middle-left/right/center
 */
ol_Overlay_FixedPopup.prototype.setPixelPosition = function (pix, position) {
  var r, map = this.getMap();
  var mapSize = map ? map.getSize() : [0,0];
  if (position) {
    this.setPositioning(position);
    r = ol_ext_element.offsetRect(this.element);
    r.width = r.height = 0;
    if (/top/.test(position)) pix[1] += r.height/2;
    else if (/bottom/.test(position)) pix[1] = mapSize[1] - r.height/2 - pix[1];
    else pix[1] = mapSize[1]/2 + pix[1];
    if (/left/.test(position)) pix[0] += r.width/2;
    else if (/right/.test(position)) pix[0] = mapSize[0] - r.width/2 - pix[0];
    else pix[0] = mapSize[0]/2 + pix[0];
  }
  if (pix) this._pixel = pix;
  if (map && this._pixel) {
    this.updateRenderedPosition(this._pixel, mapSize);
    // Prevent outside
    var outside = false;
    r = ol_ext_element.offsetRect(this.element);
    var rmap = ol_ext_element.offsetRect(map.getTargetElement());
    if (r.left < rmap.left) {
      this._pixel[0] = this._pixel[0] + rmap.left - r.left;
      outside = true;
    } else if (r.left + r.width > rmap.left + rmap.width) {
      this._pixel[0] = this._pixel[0] + rmap.left - r.left + rmap.width - r.width;
      outside = true;
    } 
    if (r.top < rmap.top) {
      this._pixel[1] = this._pixel[1] + rmap.top - r.top;
      outside = true;
    } else if (r.top + r.height > rmap.top + rmap.height) {
      this._pixel[1] = this._pixel[1] + rmap.top - r.top + rmap.height - r.height;
      outside = true;
    }
    if (outside) this.updateRenderedPosition(this._pixel, mapSize);
    this._overlay.changed();
  }
};

/** Set pixel position
 * @returns {ol.pixel}
 */
ol_Overlay_FixedPopup.prototype.getPixelPosition = function () {
  return this._pixel;
};

/**
 * Set the CSS class of the popup.
 * @param {string} c class name.
 * @api stable
 */
ol_Overlay_FixedPopup.prototype.setPopupClass = function (c) {
  ol_Overlay_Popup.prototype.setPopupClass.call(this, c);
  this.addPopupClass('ol-fixPopup');
};

/** Set poppup rotation
 * @param {number} angle
 * @api
 */
ol_Overlay_FixedPopup.prototype.setRotation = function (angle) {
  if (typeof(angle) === 'number') this.set('rotation', angle);
  if (/rotate/.test(this.element.style.transform)) {
    this.element.style.transform = this.element.style.transform.replace(/rotate\((-?\d+)deg\)/,'rotate('+(this.get('rotation')||0)+'deg)')
  } else {
    this.element.style.transform = this.element.style.transform + ' rotate('+(this.get('rotation')||0)+'deg)';
  }
};

/** Set link style
 * @param {ol.style.Style} style
 */
ol_Overlay_FixedPopup.prototype.setLinkStyle = function (style) {
  this._style = style;
  this._overlay.changed();
};

/** Get link style
 * @return {ol.style.Style} style
 */
ol_Overlay_FixedPopup.prototype.getLinkStyle = function () {
  return this._style;
};

export  default ol_Overlay_FixedPopup
