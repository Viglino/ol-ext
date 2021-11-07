/*	Copyright (c) 2019 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_style_Style from 'ol/style/Style'
import {asString as ol_color_asString} from 'ol/color'
import {asArray as ol_color_asArray} from 'ol/color'
import {ol_coordinate_dist2d} from '../geom/GeomUtils'
import '../geom/LineStringSplitAt'

/** Flow line style
 * Draw LineString with a variable color / width
 * NB: the FlowLine style doesn't impress the hit-detection.
 * If you want your lines to be sectionable you have to add your own style to handle this.
 * (with transparent line: stroke color opacity to .1 or zero width)
 * @constructor
 * @extends {ol_style_Style}
 * @param {Object} options
 *  @param {boolean} options.visible draw only the visible part of the line, default true
 *  @param {number|function} options.width Stroke width or a function that gets a feature and the position (beetween [0,1]) and returns current width
 *  @param {number} options.width2 Final stroke width (if width is not a function)
 *  @param {number} options.arrow Arrow at start (-1), at end (1), at both (2), none (0), default geta
 *  @param {ol.colorLike|function} options.color Stroke color or a function that gets a feature and the position (beetween [0,1]) and returns current color
 *  @param {ol.colorLike} options.color2 Final sroke color if color is nor a function
 *  @param {ol.colorLike} options.arrowColor Color of arrows, if not defined used color or color2
 *  @param {string} options.lineCap CanvasRenderingContext2D.lineCap 'butt' | 'round' | 'square', default 'butt'
 *  @param {number|ol.size} options.arrowSize height and width of the arrow, default 16
 *  @param {boolean} [options.noOverlap=false] prevent segments overlaping
 *  @param {number} options.offset0 offset at line start
 *  @param {number} options.offset1 offset at line end
 */
var ol_style_FlowLine = function(options) {
  if (!options) options = {};
  
  ol_style_Style.call (this, { 
    renderer: this._render.bind(this),
    stroke: options.stroke,
    text: options.text,
    zIndex: options.zIndex,
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
  // Arrow
  this.setArrow(options.arrow);
  this.setArrowSize(options.arrowSize);
  this.setArrowColor(options.arrowColor);
  // Offset
  this._offset = [0,0];
  this.setOffset(options.offset0, 0);
  this.setOffset(options.offset1, 1);
  // Overlap
  this._noOverlap = options.noOverlap;
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

/** Get offset at start or end
 * @param {number} where 0=start, 1=end
 * @return {number} width
 */
ol_style_FlowLine.prototype.getOffset = function(where) {
  return this._offset[where];
};

/** Add an offset at start or end
 * @param {number} width
 * @param {number} where 0=start, 1=end
 */
ol_style_FlowLine.prototype.setOffset = function(width, where) {
  width = Math.max(0, parseFloat(width));
  switch(where) {
    case 0: {
      this._offset[0] = width;
      break;
    }
    case 1: {
      this._offset[1] = width;
      break;
    }
  }
};

/** Set the LineCap
 * @param {steing} cap LineCap (round or butt), default butt
 */
ol_style_FlowLine.prototype.setLineCap = function(cap) {
  this._lineCap = (cap==='round' ? 'round' : 'butt');
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

/** Set the arrow color
 * @param {ol.colorLike} color
 */
ol_style_FlowLine.prototype.setArrowColor = function(color) {
  try {
    this._acolor = ol_color_asString(color);
  } catch(e) {
    this._acolor = null;    
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

/** Get arrow
 */
ol_style_FlowLine.prototype.getArrow = function() {
  return this._arrow;
};

/** Set arrow
 * @param {number} n -1 | 0 | 1 | 2, default: 0
 */
ol_style_FlowLine.prototype.setArrow = function(n) {
  this._arrow = parseInt(n);
  if (this._arrow < -1 || this._arrow > 2) this._arrow = 0;
}

/** getArrowSize
 * @return {ol.size}
 */
ol_style_FlowLine.prototype.getArrowSize = function() {
  return this._arrowSize || [16,16];
};

/** setArrowSize
 * @param {number|ol.size} size
 */
ol_style_FlowLine.prototype.setArrowSize = function(size) {
  if (Array.isArray(size)) this._arrowSize = size;
  else if (typeof(size) === 'number') this._arrowSize = [size,size];
};

/** drawArrow
 * @param {CanvasRenderingContext2D} ctx 
 * @param {ol.coordinate} p0 
 * @param ol.coordinate} p1 
 * @param {number} width 
 * @param {number} ratio pixelratio
 * @private
 */
ol_style_FlowLine.prototype.drawArrow = function (ctx, p0, p1, width, ratio) {
  var asize = this.getArrowSize()[0] * ratio;
  var l = ol_coordinate_dist2d(p0, p1);
  var dx = (p0[0]-p1[0])/l;
  var dy = (p0[1]-p1[1])/l;
  width = Math.max(this.getArrowSize()[1]/2, width/2) * ratio;
  ctx.beginPath();
  ctx.moveTo(p0[0],p0[1]);
  ctx.lineTo(p0[0]-asize*dx+width*dy, p0[1]-asize*dy-width*dx);
  ctx.lineTo(p0[0]-asize*dx-width*dy, p0[1]-asize*dy+width*dx);
  ctx.lineTo(p0[0],p0[1]);
  ctx.fill();
};

/** Renderer function
 * @param {Array<ol.coordinate>} geom The pixel coordinates of the geometry in GeoJSON notation
 * @param {ol.render.State} e The olx.render.State of the layer renderer
 */
ol_style_FlowLine.prototype._render = function(geom, e) {
  if (e.geometry.getType()==='LineString') {
    var i, g, p, ctx = e.context;
    // Get geometry used at drawing
    if (!this._visible) {
      var a = e.pixelRatio / e.resolution;
      var cos = Math.cos(e.rotation)
      var sin = Math.sin(e.rotation)
      g = e.geometry.getCoordinates();
      var dx = geom[0][0] - g[0][0] * a *cos - g[0][1] * a *sin ;
      var dy = geom[0][1] - g[0][0] * a * sin + g[0][1] * a * cos;
      geom = [];
      for (i=0; p=g[i]; i++) {
        geom[i] = [
          dx + p[0] * a * cos + p[1] * a * sin,
          dy + p[0] * a * sin - p[1] * a * cos,
          p[2]
        ];
      }
    }

    var asize = this.getArrowSize()[0] * e.pixelRatio;

    ctx.save();
      // Offsets
      if (this.getOffset(0)) this._splitAsize(geom, this.getOffset(0) * e.pixelRatio)
      if (this.getOffset(1)) this._splitAsize(geom, this.getOffset(1) * e.pixelRatio, true)
      // Arrow 1
      if (geom.length>1 && (this.getArrow()===-1 || this.getArrow()===2)) {
        p = this._splitAsize(geom, asize);
        if (this._acolor) ctx.fillStyle = this._acolor;
        else ctx.fillStyle = this.getColor(e.feature, 0);
        this.drawArrow(ctx, p[0], p[1], this.getWidth(e.feature, 0), e.pixelRatio);
      }
      // Arrow 2 
      if (geom.length>1 && this.getArrow()>0) {
        p = this._splitAsize(geom, asize, true);
        if (this._acolor) ctx.fillStyle = this._acolor;
        else ctx.fillStyle = this.getColor(e.feature, 1);
        this.drawArrow(ctx, p[0], p[1], this.getWidth(e.feature, 1), e.pixelRatio);
      }

      // Split into
      var geoms = this._splitInto(geom, 255, 2);
      var k = 0;
      var nb = geoms.length;
      
      // Draw
      ctx.lineJoin = 'round';
      ctx.lineCap = this._lineCap || 'butt';

      if (geoms.length > 1) {
        for (k=0; k<geoms.length; k++) {
          var step = k/nb;
          g = geoms[k];
          ctx.lineWidth = this.getWidth(e.feature, step) * e.pixelRatio;
          ctx.strokeStyle = this.getColor(e.feature, step);
          ctx.beginPath();
          ctx.moveTo(g[0][0],g[0][1]);
          for (i=1; p=g[i]; i++) {
            ctx.lineTo(p[0],p[1]);
          }
          ctx.stroke();
        }
      }
    ctx.restore();
  }
};

/** Split extremity at
 * @param {ol.geom.LineString} geom
 * @param {number} asize
 * @param {boolean} end start=false or end=true, default false (start)
 */
ol_style_FlowLine.prototype._splitAsize = function(geom, asize, end) {
  var p, p1, p0;
  var dl, d = 0;
  if (end) p0 = geom.pop();
  else p0 = geom.shift();
  p = p0;
  while(geom.length) {
    if (end) p1 = geom.pop();
    else p1 = geom.shift();
    dl = ol_coordinate_dist2d(p,p1);
    if (d+dl > asize) {
      p = [p[0]+(p1[0]-p[0])*(asize-d)/dl, p[1]+(p1[1]-p[1])*(asize-d)/dl];
      dl = ol_coordinate_dist2d(p,p0);
      if (end) {
        geom.push(p1);
        geom.push(p);
        geom.push([p[0]+(p0[0]-p[0])/dl, p[1]+(p0[1]-p[1])/dl]);
      } else {
        geom.unshift(p1);
        geom.unshift(p);
        geom.unshift([p[0]+(p0[0]-p[0])/dl, p[1]+(p0[1]-p[1])/dl]);
      }
      break;
    }
    d += dl;
    p = p1;
  }
  return [p0,p];
};

/** Split line geometry into equal length geometries
 * @param {Array<ol.coordinate>} geom
 * @param {number} nb number of resulting geometries, default 255
 * @param {number} nim minimum length of the resulting geometries, default 1
 */
ol_style_FlowLine.prototype._splitInto = function(geom, nb, min) {
  var i, p;
  var dt = this._noOverlap ? 1 : .9;
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
        p0[0] + dx * d*dt,  
        p0[1] + dy * d*dt
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
