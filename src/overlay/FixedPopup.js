/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import ol_layer_Image from 'ol/layer/Image'
import ol_source_ImageCanvas from 'ol/source/ImageCanvas'
import ol_style_Style from 'ol/style/Style'
import ol_style_Fill from 'ol/style/Fill'
import {asString as ol_color_asString} from 'ol/color'

import ol_ext_inherits from '../util/ext'
import ol_ext_element from '../util/element'
import ol_Overlay_Popup from './Popup'
import {ol_coordinate_dist2d} from "../geom/GeomUtils";

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
 *	@param {number} options.minScale min scale for the popup, default .5
 *	@param {number} options.maxScale max scale for the popup, default 2
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

  this.set('minScale', options.minScale || .5);
  this.set('maxScale', options.maxScale || 2);

  var canvas = document.createElement('canvas');
   
  this._overlay = new ol_layer_Image({
    source: new ol_source_ImageCanvas({
      canvasFunction: function(extent, res, ratio, size) {
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
      e.context.save();
        var tr = e.inversePixelTransform;
        if (tr) {
          e.context.transform(tr[0],tr[1],tr[2],tr[3],tr[4],tr[5]);
        } else {
          // ol ~ v5.3.0
          e.context.scale(e.frameState.pixelRatio,e.frameState.pixelRatio)
        }
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
  function angle() {
    var p1,p2, v = Object.keys(pointerEvents);
    if (v.length<2) return false;
    p1 = pointerEvents[v[0]];
    p2 = pointerEvents[v[1]];
    var v1 = [p2.clientX - p1.clientX, p2.clientY - p1.clientY];
    p1 = pointerEvents2[v[0]];
    p2 = pointerEvents2[v[1]];
    var v2 = [p2.clientX - p1.clientX, p2.clientY - p1.clientY];
    var d1 = Math.sqrt(v1[0]*v1[0]+v1[1]*v1[1]);
    var d2 = Math.sqrt(v2[0]*v2[0]+v2[1]*v2[1]);
    var a = Math.acos((v1[0]*v2[0]+v1[1]*v2[1]) / (d1*d2)) * 360 / Math.PI;
    if (v1[0]*v2[1]-v1[1]*v2[0] < 0) return -a;
    else return a;
  }
  // Get distance beetween events
  function distance(pevents) {
    var v = Object.keys(pevents);
    if (v.length<2) return false;
    return ol_coordinate_dist2d([pevents[v[0]].clientX, pevents[v[0]].clientY], [pevents[v[1]].clientX, pevents[v[1]].clientY]);
  }

  // Handle popup move
  var pointerEvents = {};
  var pointerEvents2 = {};
  var pixelPosition = [];
  var distIni, rotIni, scaleIni, move;
  // down
  this.element.addEventListener('pointerdown', function(e) {
    e.preventDefault();
    e.stopPropagation();
    // Reset events to this position
    for (let i in pointerEvents) {
      if (pointerEvents2[i]) {
        pointerEvents[i] = pointerEvents2[i];
      }
    }
    pointerEvents[e.pointerId] = e;
    pixelPosition = this._pixel;
    rotIni = this.get('rotation') || 0;
    scaleIni = this.get('scale') || 1;
    distIni = distance(pointerEvents);
    move = false;
  }.bind(this));
  // Prevent click when move
  this.element.addEventListener('click', function(e) {
    if (move) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
  // up / cancel
  var removePointer = function(e) {
    if (pointerEvents[e.pointerId]) {
      delete pointerEvents[e.pointerId];
      e.preventDefault();
    }
    if (pointerEvents2[e.pointerId]) {
      delete pointerEvents2[e.pointerId];
    }
    /* Simulate a second touch pointer * /
    if (e.metaKey || e.ctrlKey) {
      pointerEvents['touch'] = e;
      pointerEvents2['touch'] = e;
    } else {
      delete pointerEvents['touch'];
      delete pointerEvents2['touch'];
    }
    /**/
  }.bind(this);
  document.addEventListener('pointerup', removePointer);
  document.addEventListener('pointercancel', removePointer);
  // move
  document.addEventListener('pointermove', function(e) {
    if (pointerEvents[e.pointerId]) {
      e.preventDefault();
      pointerEvents2[e.pointerId] = e;
      var c1 = centroid(pointerEvents);
      var c2 = centroid(pointerEvents2);
      var dx = c2[0] - c1[0];
      var dy = c2[1] - c1[1];
      move = move || Math.abs(dx) > 3 || Math.abs(dy) > 3;
      var a = angle();
      if (a) {
        this.setRotation(rotIni + a*1.5, false);
      }
      var d = distance(pointerEvents2);
      if (d!==false && distIni) {
        this.setScale(scaleIni * d / distIni, false);
        distIni = scaleIni * d / this.get('scale');
      }
      this.setPixelPosition([pixelPosition[0]+dx, pixelPosition[1]+dy]);
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
  this.setScale()
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
 * @param {booelan} update update popup, default true
 * @api
 */
ol_Overlay_FixedPopup.prototype.setRotation = function (angle, update) {
  if (typeof(angle) === 'number') this.set('rotation', angle);
  if (update!==false) {
    if (/rotate/.test(this.element.style.transform)) {
      this.element.style.transform = this.element.style.transform.replace(/rotate\((-?[\d,.]+)deg\)/,'rotate('+(this.get('rotation')||0)+'deg)')
    } else {
      this.element.style.transform = this.element.style.transform + ' rotate('+(this.get('rotation')||0)+'deg)';
    }
  }
};

/** Set poppup scale
 * @param {number} scale
 * @param {booelan} update update popup, default true
 * @api
 */
ol_Overlay_FixedPopup.prototype.setScale = function (scale, update) {
  if (typeof(scale) === 'number') this.set('scale', scale);
  scale = Math.min(Math.max(this.get('minScale')||0, this.get('scale')||1 ), this.get('maxScale')||2);
  this.set('scale', scale);
  if (update!==false) {
    if (/scale/.test(this.element.style.transform)) {
      this.element.style.transform = this.element.style.transform.replace(/scale\(([\d,.]+)\)/,'scale('+(scale)+')')
    } else {
      this.element.style.transform = this.element.style.transform + ' scale('+(scale)+')';
    }
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
