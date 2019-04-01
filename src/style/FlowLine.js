/*	Copyright (c) 2019 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_style_Style from 'ol/style/Style'
import {asString as ol_color_asString} from 'ol/color'
import {asArray as ol_color_asArray} from 'ol/color'
import {ol_coordinate_dist2d} from '../geom/GeomUtils'

/** Flow line style
 * Draw LineString with a variable color / width
 *
 * @extends {ol_style_Style}
 * @constructor
 * @param {Object} options
 *  @param {boolean} options.visible draw only the visible part of the line, default true
 *  @param {number|function} options.width Stroke width or a function that gets a feature and the position (beetween [0,1]) and returns current width
 *  @param {number} options.width2 Final stroke width
 *  @param {ol.colorLike|function} options.color Stroke color or a function that gets a feature and the position (beetween [0,1]) and returns current color
 *  @param {ol.colorLike} options.color2 Final sroke color
 */
var ol_style_FlowLine = function(options) {
  if (!options) options = {};
  
  ol_style_Style.call (this, { 
    renderer: this._render.bind(this),
    geometry: options.geometry
  });

  // Draw only visible
  this._visible = (options.visible !== false);

  // Width
  if (typeof options.width === 'function') {
    this._widthFn = options.width;
  } else {
    this.setWidth(options.width);
  }
  this.setWidth2(options.width2);
  // Color
  if (typeof options.color === 'function') {
    this._colorFn = options.color;
  } else {
    this.setColor(options.color);
  }
  this.setColor2(options.color2);
  // LineCap
  this.setLineCap(options.lineCap);
};
ol_ext_inherits(ol_style_FlowLine, ol_style_Style);

/** Set the initial width
 * @param {number} width width, default 0
 */
ol_style_FlowLine.prototype.setWidth = function(width) {
  this._width = width || 0;
};

/** Set the final width
 * @param {number} width width, default 0
 */
ol_style_FlowLine.prototype.setWidth2 = function(width) {
  this._width2 = width;
};

/** Set the LineCap
 * @param {steing} cap LineCap (round or mitter), default mitter
 */
ol_style_FlowLine.prototype.setLineCap = function(cap) {
  this._lineCap = (cap==='round' ? 'round' : 'mitter');
};

/** Get the current width at step
 * @param {ol.feature} feature
 * @param {number} step current drawing step beetween [0,1] 
 * @return {number} 
 */
ol_style_FlowLine.prototype.getWidth = function(feature, step) {
  if (this._widthFn) return this._widthFn(feature, step);
  var w2 = (typeof(this._width2) === 'number') ? this._width2 : this._width;
  return this._width + (w2-this._width) * step;
};

/** Set the initial color
 * @param {ol.colorLike} color
 */
ol_style_FlowLine.prototype.setColor = function(color) {
  try{
    this._color = ol_color_asArray(color);
  } catch(e) {
    this._color = [0,0,0,1];
  }
};

/** Set the final color
 * @param {ol.colorLike} color
 */
ol_style_FlowLine.prototype.setColor2 = function(color) {
  try {
    this._color2 = ol_color_asArray(color);
  } catch(e) {
    this._color2 = null;    
  }
};

/** Get the current color at step
 * @param {ol.feature} feature
 * @param {number} step current drawing step beetween [0,1] 
 * @return {string} 
 */
ol_style_FlowLine.prototype.getColor = function(feature, step) {
  if (this._colorFn) return ol_color_asString(this._colorFn(feature, step));
  var color = this._color;
  var color2 = this._color2 || this._color
  return 'rgba('+
          + Math.round(color[0] + (color2[0]-color[0]) * step) +','
          + Math.round(color[1] + (color2[1]-color[1]) * step) +','
          + Math.round(color[2] + (color2[2]-color[2]) * step) +','
          + (color[3] + (color2[3]-color[3]) * step)
          +')';
};

/** Renderer function
 * @param {Array<ol.coordinate>} geom The pixel coordinates of the geometry in GeoJSON notation
 * @param {ol.render.State} e The olx.render.State of the layer renderer
 */
ol_style_FlowLine.prototype._render = function(geom, e) {
  if (e.geometry.getType()==='LineString') {
    var i, p, ctx = e.context;
    // Get geometry used at drawing
    if (!this._visible) {
      var a = e.pixelRatio / e.resolution;
      var g = e.geometry.getCoordinates();
      var dx = geom[0][0] - g[0][0] * a;
      var dy = geom[0][1] + g[0][1] * a;
      geom = [];
      for (i=0; p=g[i]; i++) {
        geom[i] = [ dx + p[0] * a, dy - p[1] * a];
      }
    }
    // Split into
    var geoms = this._splitInto(geom, 255, 2);
    var k = 0;
    var nb = geoms.length;
    // Draw
    ctx.save();
      ctx.lineJoin = 'round';
      ctx.lineCap = this._lineCap || 'mitter';
      geoms.forEach(function(g) {
        var step = k++/nb;
        ctx.lineWidth = this.getWidth(e.feature, step) * e.pixelRatio;
        ctx.strokeStyle = this.getColor(e.feature, step);
        ctx.beginPath();
        ctx.moveTo(g[0][0],g[0][1]);
        for (i=1; p=g[i]; i++) {
          ctx.lineTo(p[0],p[1]);
          ctx.stroke();
        }
      }.bind(this));
    ctx.restore();
  }
};

/** Split line geometry into equal length geometries
 * @param {Array<ol.coordinate>} geom
 * @param {number} nb number of resulting geometries, default 255
 * @param {number} nim minimum length of the resulting geometries, default 1
 */
ol_style_FlowLine.prototype._splitInto = function(geom, nb, min) {
  var i, p;
  // Split geom into equal length geoms
  var geoms = [];
  var dl, l = 0;
  for (i=1; p=geom[i]; i++) {
    l += ol_coordinate_dist2d(geom[i-1], p);
  }
  var length = Math.max (min||2, l/(nb||255));
  var p0 = geom[0];
  l = 0;
  var g = [p0];
  i = 1;
  p = geom[1];
  while (i < geom.length) {
    var dx = p[0]-p0[0];
    var dy = p[1]-p0[1];
    dl = Math.sqrt(dx*dx + dy*dy);
    if (l+dl > length) {
      var d = (length-l) / dl;
      g.push([ 
        p0[0] + dx * d,  
        p0[1] + dy * d 
      ]);
      geoms.push(g);
      p0 =[ 
        p0[0] + dx * d*.9,  
        p0[1] + dy * d*.9
      ];
      g = [p0];
      l = 0;
    } else {
      l += dl;
      p0 = p;
      g.push(p0);
      i++;
      p = geom[i];
    }
  }
  geoms.push(g);
  return geoms;
}

export default ol_style_FlowLine
