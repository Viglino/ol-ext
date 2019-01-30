/*	Copyright (c) 2019 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import {inherits as ol_inherits} from 'ol'
import ol_style_Style from 'ol/style/Style'
import {asArray as ol_color_asArray} from 'ol/color'

/** Flow line style
 * Draw LineString with a variable color / width
 *
 * @extends {ol_style_Style}
 * @constructor
 * @param {Object}  options
 *  @param {number|function} options.width Stroke width or a function that gets a feature and returns the initial stroke width
 *  @param {number} options.width2 Final stroke width
 *  @param {ol.colorLike} options.color Stroke color
 *  @param {ol.colorLike} options.color2 FInal sroke color
 */
var ol_style_FlowLine = function(options) {
  if (!options) options = {};
  
  ol_style_Style.call (this, { 
    renderer: this._render.bind(this)
  });

  this.setWidth(options.width);
  this.setWidth2(options.width2);
  this.setColor(options.color);
  this.setColor2(options.color2);
};
ol_inherits(ol_style_FlowLine, ol_style_Style);

/** Set the initial width
 * @param {number} width, default 0
 */
ol_style_FlowLine.prototype.setWidth = function(width) {
  this._width = width || 0;
};

/** Get the initial width
 * @return {number} 
 */
ol_style_FlowLine.prototype.getWidth = function() {
  return this._width;
};

/** Set the final width
 * @param {number} width, default 0
 */
ol_style_FlowLine.prototype.setWidth2 = function(width) {
  this._width2 = width;
};

/** Get the final width
 * @return {number} 
 */
ol_style_FlowLine.prototype.getWidth2 = function() {
  return (typeof(this._width2) === 'number') ? this._width2 : this._width;
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

/** Get the initial color
 * @return {Array<number>} 
 */
ol_style_FlowLine.prototype.getColor = function() {
  return this._color;
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

/** Get the final color
 * @return {Array<number>} 
 */
ol_style_FlowLine.prototype.getColor2 = function(color) {
  return (this._color2.length ? this._color2 : this._color);
};

/** Renderer function
 */
ol_style_FlowLine.prototype._render = function(geom, e) {
  if (e.geometry.getType()==='LineString') {
    var i, p, ctx = e.context;
    var geoms = this._splitInto(geom);
    var width = this.getWidth();
    var dw = this.getWidth2() - width;
    var color = this.getColor();
    var color2 = this.getColor2();
    var k = 0;
    var nb = geoms.length;
    ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      geoms.forEach((g) => {
        var step = k++/nb;
        ctx.lineWidth = width + dw * step;
        ctx.strokeStyle = 'rgba('+
          + Math.round(color[0] + (color2[0]-color[0]) * step) +','
          + Math.round(color[1] + (color2[1]-color[1]) * step) +','
          + Math.round(color[2] + (color2[2]-color[2]) * step) +','
          + Math.round(color[3] + (color2[3]-color[3]) * step)
          +')';
        ctx.beginPath();
        ctx.moveTo(g[0][0],g[0][1]);
        for (i=1; p=g[i]; i++) {
          ctx.lineTo(p[0],p[1]);
          ctx.stroke();
        }
      });
    ctx.restore();
  }
};

/** Split line geometry into equal length geometries
 * @param {Array<ol.coordinate>} geom
 */
ol_style_FlowLine.prototype._splitInto = function(geom, nb, min) {
  var i, p;
  // Split geom into equal length geoms
  var geoms = [];
  var dl, l = 0;
  for (i=1; p=geom[i]; i++) {
    l += ol.coordinate.dist2d(geom[i-1], p);
  }
  var length = Math.min (min||10, l / (nb||20));
  var p0 = geom[0];
  l = 0;
  var g = [p0];
  i = 1;
  p = geom[1];
  while (i < geom.length) {
    dl = ol.coordinate.dist2d(p,p0);
    if (l+dl > length) {
      var d = (length-l) / dl;
      p0 = [ 
        p0[0] + (p[0]-p0[0]) * d,  
        p0[1] + (p[1]-p0[1]) * d 
      ];
      g.push(p0);
      geoms.push(g);
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
